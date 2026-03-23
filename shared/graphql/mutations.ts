export const METAOBJECT_UPDATE_MUTATION = `#graphql
  mutation UpdateStock($id: ID!, $fields: [MetaobjectFieldInput!]!) {
    metaobjectUpdate(id: $id, metaobject: { fields: $fields }) { # object: key: "qty", value: "15"
      metaobject { 
        id # ID: gid://shopify/Metaobject/123
      } 
      userErrors { 
        field 
        message }
    }
  }
`;

export const INVENTORY_SET_QUANTITIES_MUTATION = `#graphql
  mutation InventorySetQuantities($inventoryItemId: ID!, $locationId: ID!, $quantity: Int!) {
    inventorySetQuantities(input: {
      name: "on_hand",
      reason: "correction",
      quantities: [
        {
          inventoryItemId: $inventoryItemId
          locationId: $locationId
          quantity: $quantity
          changeFromQuantity: null  
        }
      ]
    }) {
      inventoryAdjustmentGroup { 
        id
      }
      userErrors { 
        field 
        message 
      }
    }
  }
`;

export const METAOBJECT_CREATE_BIN_QTY_MUTATION = `#graphql
  mutation CreateBinQty($type: String!, $handle: String!, $binLocationId: String!, $qty: String!, $variantId: String!) {
    metaobjectCreate(metaobject: {
    # type: bin_qty
      type: $type
      handle: $handle
      fields: [
        {
          key: "bin_location"
          value: $binLocationId
        }
        {
          key: "product_variant"
          value: $variantId
        }
        {
          key: "qty"
          value: $qty
        }
      ]
    }) {
      metaobject { 
        id 
      }
      userErrors { 
        field 
        message 
      }
    }
  }
`;

export const METAOBJECT_CREATE_BIN_LOCATION_MUTATION = `#graphql
  mutation CreateBinLocation($type: String!, $handle: String!, $title: String!) {
    metaobjectCreate(metaobject: {
    # type: bin_location
      type: $type
      handle: $handle
      fields: [
        {
          key: "bin_location"
          value: $title
        }
      ]
    }) {
      metaobject { 
        id
        handle }
      userErrors { 
        field 
        message 
      }
    }
  }
`;

export const METAFIELDS_SET_MUTATION = `#graphql
  mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        namespace
        key
        type
        value
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const INVENTORY_ADJUST_QUANTITIES_MUTATION = `#graphql
mutation InventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!) {
  inventoryAdjustQuantities(input: $input) {
    inventoryAdjustmentGroup { id }
    userErrors { field message }
  }
}
`;

export const INVENTORY_ITEM_UPDATE_MUTATION = `#graphql
mutation InventoryItemUpdate($id: ID!, $input: InventoryItemInput!) {
  inventoryItemUpdate(id: $id, input: $input) {
    inventoryItem {
      id
      unitCost {
        amount
      }
      countryCodeOfOrigin
      harmonizedSystemCode
    }
    userErrors { 
      field 
      message
    }
  }
}
`;