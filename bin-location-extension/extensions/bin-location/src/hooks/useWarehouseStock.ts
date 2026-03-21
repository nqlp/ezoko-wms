import { useEffect, useState } from 'preact/hooks';
import { VARIANT_WAREHOUSE_STOCK_QUERY } from '../graphql/queries';
import { MetaobjectNode, StockItem, WarehouseStockResponse } from '../types/warehouseStock';
import { getFieldValue, ShopifyQueryFct } from '../utils/helpers';
import { resolveBinName } from '@shared/utils/metaobject';

export interface UseWarehouseStockResult {
  items: StockItem[];
  setItems: (items: StockItem[] | ((prev: StockItem[]) => StockItem[])) => void;
  loading: boolean;
  error: string;
  setError: (error: string) => void;
  initialQtyById: Record<string, number>;
  setInitialQtyById: (qty: Record<string, number>) => void;
  inventoryItemId: string | null;
  locationId: string | null;
  variantBarcode: string | null;
  variantTitle: string | null;
}

export function useWarehouseStock(
  variantId: string | undefined,
  query: ShopifyQueryFct
): UseWarehouseStockResult {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<StockItem[]>([]);
  const [error, setError] = useState("");
  const [initialQtyById, setInitialQtyById] = useState<Record<string, number>>({});
  const [inventoryItemId, setInventoryItemId] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [variantBarcode, setVariantBarcode] = useState<string | null>(null);
  const [variantTitle, setVariantTitle] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!variantId) {
        setItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");

      try {
        const response = await query<WarehouseStockResponse>(VARIANT_WAREHOUSE_STOCK_QUERY, {
          variables: { id: variantId }
        });

        if (response?.data?.productVariant) {
          const productVariant = response.data.productVariant;
          const warehouseStockMetafield = productVariant.metafields.nodes.find(
            (mf) => mf.key === "warehouse_stock"
          );
          const nodes: MetaobjectNode[] = warehouseStockMetafield?.references?.nodes || [];

          const parsed: StockItem[] = nodes.map((node) => {
            const fields = node.fields;
            const binLocationRef = fields.find((field) => field.key === "bin_location")?.reference;
            const binName = resolveBinName(node.fields, binLocationRef?.handle ?? node.handle);
            const qty = getFieldValue(fields, "qty") || "0";

            return { id: node.id, bin: binName, qty: parseInt(qty, 10), binLocationId: binLocationRef?.id };
          });
          setItems(parsed);
          setInitialQtyById(Object.fromEntries(parsed.map(i => [i.id, i.qty])));
          setInventoryItemId(productVariant.inventoryItem?.id);
          setVariantBarcode(productVariant.barcode ?? null);
          setVariantTitle(productVariant.title ?? null);
          setLocationId(productVariant.inventoryItem.inventoryLevels.nodes[0].location.id);
        } else {
          setItems([]);
        }
      } catch (e) {
        setError("Failed to load bin locations.");
      }
      setLoading(false);
    }
    load();
  }, [variantId, query]);

  return {
    items,
    setItems,
    loading,
    error,
    setError,
    initialQtyById,
    setInitialQtyById,
    inventoryItemId,
    locationId,
    variantBarcode,
    variantTitle,
  };
}
