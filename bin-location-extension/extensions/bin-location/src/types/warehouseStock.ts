export { StockItem, BinLocation, MetaobjectField, MetaobjectFieldReference, MetaobjectFieldWithReference, MetaobjectNode } from '@shared/types/index';

export interface WarehouseStockMetafieldNode {
  id: string;
  key: string;
  references?: {
    nodes: MetaobjectNode[];
  } | null;
}

export interface WarehouseStockResponse {
  productVariant: {
    title: string;
    product?: {
      title: string;
    } | null;
    inventoryQuantity: number;
    barcode?: string | null;
    inventoryItem: {
      id: string;
      inventoryLevels: {
        nodes: {
          location: {
            id: string;
          }
        }[];
      };
    };
    metafields: {
      nodes: WarehouseStockMetafieldNode[];
    };
  } | null;
}

export interface StaffMemberResponse {
  staffMember: {
    name?: string | null;
  } | null;
}
