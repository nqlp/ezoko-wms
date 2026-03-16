export const FIND_VARIANTS_BY_BARCODE_QUERY = /* GraphQL */ `
query GetVariantByBarcode($query: String!) {
    productVariants(first: 2, query: $query) {
      nodes {
        # variant informations
        id
        title
        sku
        barcode
        displayName
        price

        # available quantity 
        inventoryQuantity

        createdAt
        updatedAt

        # image de la variante
        media(first: 1) {
          nodes {
            ... on MediaImage {
              image {
                url
                altText
              }
            }
          }
        }

        # backorder (continue / deny)
        inventoryPolicy

        position
        availableForSale
        compareAtPrice
        taxable

        # metafield variant
        metafields(first: 250) { 
          nodes {
            id
            namespace
            key
            value
            type
            references(first: 10) {
              nodes {
                ... on Metaobject {
                  id
                  handle
                  fields {
                    key
                    value
                    reference {
                      ... on Metaobject {
                        id
                        handle
                        fields {
                          key
                          value
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        } 

        # price
        unitPrice {
          amount
          currencyCode
        }

        unitPriceMeasurement {
          measuredType
          quantityUnit
        }
        
        inventoryItem {
        id
        inventoryLevels(first: 2) {
          nodes {
              location { 
                id
              }
            }
          }
        }

        # product associated to the variant
        product {
          title
          # image de la variante
          featuredMedia {
            ... on MediaImage {
              image {
                url
                altText
              }
            }
          }
        }
        
        # options for variant
        selectedOptions {
          name
          value
        }
      } 
    }
  }
`;