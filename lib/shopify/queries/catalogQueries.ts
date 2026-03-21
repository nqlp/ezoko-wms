export const VERIFY_PRODUCT_TITLE_QUERY = `#graphql
  query VerifyProductTitle($query: String!) {
    products(first: 20, query: $query) {
      nodes {
        title
      }
    }
  }
`;

export const FIND_PRODUCT_BY_HANDLE_QUERY = `#graphql
  query FindProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      title
      handle
    }
  }
`;

export const VENDORS_QUERY =  `#graphql
  query Vendors($first: Int!, $after: String) {
    productVendors(first: $first, after: $after) {
      nodes
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const SEARCH_PRODUCTS_QUERY = `#graphql
  query SearchProducts($query: String!) {
    products(first: 20, query: $query) {
      nodes {
        id
        title
        vendor
        variants(first: 50) {
          nodes {
            id
            title
            sku
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
  }
`;

export const SEARCH_VARIANTS_BY_TITLE_QUERY = `#graphql
  query SearchVariantsByTitle($query: String!) {
    productVariants(first: 20, query: $query) {
      nodes {
        id
        title
        sku
        product {
          id
          title
        }
        selectedOptions {
          name
          value
        }
      }
    }
  }
`;

export const PRODUCT_VARIANTS_QUERY = `#graphql
  query ProductVariants($id: ID!) {
    product(id: $id) {
      id
      title
      variants(first: 100) {
        nodes {
          id
          title
          sku
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
`;

export const VALIDATE_SKU_QUERY = `#graphql
  query ValidateSku($query: String!) {
    productVariants(first: 20, query: $query) {
      nodes {
        id
        sku
        product {
          id
          title
        }
        selectedOptions {
          name
          value
        }
      }
    }
  }
`;
