import { MetaobjectField } from "@shared/types/index";

export interface UpdateStockResponse {
    metaobjectUpdate: {
        userErrors: { message: string }[];
    };
}

export interface InventorySetResponse {
    inventorySetQuantities: {
        userErrors: { message: string }[];
    };
}

export interface FetchBinLocationsResponse {
    metaobjects: {
        nodes: {
            id: string;
            handle: string;
            fields: MetaobjectField[];
        }[];
    };
}

export interface CreateBinQtyResponse {
    metaobjectCreate: {
        metaobject: { id: string };
        userErrors: { field: string; message: string }[];
    };
}

export interface CreateBinLocationResponse {
    metaobjectCreate: {
        metaobject: { id: string; handle?: string | null };
        userErrors: { field: string; message: string }[];
    };
}

export interface MetafieldsSetResponse {
    metafieldsSet: {
        metafields: {
            id: string;
            value: string;
        }[];
        userErrors: { field: string; message: string }[];
    };
}

export interface StaffMemberResponse {
    staffMember: {
        name?: string | null;
    } | null;
}
