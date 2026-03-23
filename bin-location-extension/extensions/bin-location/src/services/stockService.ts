/* - Detect changes in qty and update the metaobject, 
   - create or update bin location (metaobject) and qty if they exist, 
   - sync inventory to Shopify,
*/

import { StockItem, BinLocation } from '../types/warehouseStock';
import {
    UpdateStockResponse,
    InventorySetResponse,
    StaffMemberResponse,
} from '../types/api';
import { METAOBJECT_UPDATE_MUTATION, INVENTORY_SET_QUANTITIES_MUTATION } from '../graphql/mutations';
import {
    validateResponse,
    ShopifyQueryFct,
} from '../utils/helpers';
import { logCorrectionActivity, extractUserIdFromToken } from './stockMovementLog';
import { validateAddBinStockInput } from '../validation/addBinStock';
import { STAFF_MEMBER_QUERY } from '../graphql/queries';

export interface SaveStockParams {
    items: StockItem[];
    initialQtyById: Record<string, number>;
    isAdding: boolean;
    draftQty: string;
    draftQuery: string;
    selectedBin: BinLocation | null;
    inventoryItemId: string | null;
    locationId: string | null;
    findBinLocationBySearch: (searchString: string) => Promise<BinLocation | null>;
    query: ShopifyQueryFct;
    variantTitle?: string | null;
    variantBarcode?: string | null;
    token?: string | null;
}

export interface SaveStockResult {
    updatedItems: StockItem[];
}

async function getUserFirstName(query: ShopifyQueryFct, token: string | null | undefined): Promise<string | null> {
    if (!token) {
        console.log("getUserFirstName: No token provided");
        return null;
    }

    const userId = extractUserIdFromToken(token);
    if (!userId) {
        console.log("getUserFirstName: Failed to extract userId from token");
        return null;
    }

    try {
        const staffId = `gid://shopify/StaffMember/${userId}`;
        const result = await query<StaffMemberResponse>(STAFF_MEMBER_QUERY, {
            variables: { id: staffId },
        });
        if (result?.errors?.length) {
            console.warn("getUserFirstName: staffMember errors:", result.errors);
        }
        const staff = result?.data?.staffMember;
        const userFullName = staff?.name;
        return userFullName;
    } catch (error) {
        console.warn("Failed to fetch staff first name:", error);
        return null;
    }
}

/**
 * Persist quantity changes for items whose qty differs from the initial snapshot
 */
async function updateDirtyItems(
    items: StockItem[],
    initialQtyById: Record<string, number>,
    query: ShopifyQueryFct,
    logContext: { variantBarcode?: string | null; variantTitle?: string | null; token?: string | null; user?: string | null },
): Promise<void> {
    const dirtyItems = items.filter(
        (item) => item.qty !== (initialQtyById[item.id] ?? item.qty)
    );

    await Promise.all(dirtyItems.map(async (item) => {
        const result = await query<UpdateStockResponse>(METAOBJECT_UPDATE_MUTATION, {
            variables: {
                id: item.id,
                fields: [{ key: "qty", value: String(item.qty) }],
            },
        });
        validateResponse<UpdateStockResponse>(result, data => data?.metaobjectUpdate?.userErrors);
        await logCorrectionActivity({
            barcode: logContext.variantBarcode,
            variantTitle: logContext.variantTitle,
            destinationLocation: item.bin,
            destinationQty: item.qty,
            token: logContext.token,
            user: logContext.user,
        });
    }));
}

/**
 * Save stock changes: update modified quantities, add to existing bin,
 * and sync inventory to Shopify.
 */
export async function saveStock(params: SaveStockParams): Promise<SaveStockResult> {
    const {
        items,
        initialQtyById,
        isAdding,
        draftQty,
        draftQuery,
        selectedBin,
        inventoryItemId,
        locationId,
        query,
        variantTitle,
        variantBarcode,
        token,
    } = params;

    const userFirstName = await getUserFirstName(query, token);
    const logContext = {
        variantBarcode,
        variantTitle,
        token,
        user: userFirstName
    };

    // 1. Persist changed quantities
    await updateDirtyItems(items, initialQtyById, query, logContext);

    const nextItems = [...items];

    // 2. Handle adding stock to an existing bin location
    if (isAdding) {
        const { selectedBin: validatedBin, qty: qtyNum } = validateAddBinStockInput({
            draftQuery,
            draftQty,
            selectedBin,
        });

        const existingStockIndex = nextItems.findIndex((i) => i.binLocationId === validatedBin.id);
        if (existingStockIndex >= 0) {
            await updateExistingBinQty(query, nextItems, existingStockIndex, qtyNum, logContext);
        } else {
            throw new Error(`This bin location: "${draftQuery.trim()}" is not yet linked to this variant.`);
        }
    }

    // 3. Sync total inventory to Shopify
    if (inventoryItemId && locationId) {
        await syncInventory(query, nextItems, inventoryItemId, locationId);
    }

    return { updatedItems: nextItems };
}

async function updateExistingBinQty(
    query: ShopifyQueryFct,
    items: StockItem[],
    existingStockIndex: number,
    qtyNum: number,
    logContext?: {
        variantTitle?: string | null;
        variantBarcode?: string | null;
        token?: string | null;
        user?: string | null
    },
): Promise<void> {
    const existing = items[existingStockIndex];
    const result = await query<UpdateStockResponse>(METAOBJECT_UPDATE_MUTATION, {
        variables: {
            id: existing.id,
            fields: [{ key: "qty", value: String(qtyNum) }],
        },
    });
    validateResponse<UpdateStockResponse>(result, data => data?.metaobjectUpdate?.userErrors);
    await logCorrectionActivity({
        barcode: logContext?.variantBarcode,
        variantTitle: logContext?.variantTitle,
        destinationLocation: existing.bin,
        destinationQty: qtyNum,
        token: logContext?.token,
        user: logContext?.user,
    });
    items[existingStockIndex] = { ...existing, qty: qtyNum };
}

async function syncInventory(
    query: ShopifyQueryFct,
    items: StockItem[],
    inventoryItemId: string,
    locationId: string
): Promise<void> {
    const sumOfBins = items.reduce((current, item) => current + item.qty, 0);
    const inventoryResult = await query<InventorySetResponse>(INVENTORY_SET_QUANTITIES_MUTATION, {
        variables: {
            inventoryItemId,
            locationId,
            quantity: sumOfBins
        }
    });
    validateResponse<InventorySetResponse>(inventoryResult, data => data?.inventorySetQuantities?.userErrors);
}
