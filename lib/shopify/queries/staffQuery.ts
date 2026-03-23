export const STAFF_MEMBER_FOR_AUDIT_QUERY = `#graphql
  query StaffMemberForAudit($id: ID!) {
    staffMember(id: $id) {
      firstName
      lastName
      }
  }
`;