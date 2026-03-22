export const PO_HEADER_STATUS = [
  "OPEN",
  "CHECKEDIN",
  "PART_RECEIVED",
  "RECEIVED",
  "CLOSED",
  "ARCHIVED"] as const;

export const PO_ITEM_STATUS = [
  "OPEN",
  "PART_RECEIVED",
  "RECEIVED",
  "CLOSED",
  "ARCHIVED"
] as const;

export const PO_TABLE_HEADERS = [
  "PO number",
  "Vendor",
  "Items",
  "Pieces",
  "Status",
  "Created",
  "Modified",
  "Expected",
  "Duties",
  "Import Type",
  "Notes",
  "Actions" 
] as const;

export const IMPORT_TYPES = [
  "NO_IMPORT", 
  "BROKERAGE_ONLY", 
  "BROKERAGE_TRANSPORT_CA", 
  "BROKERAGE_TRANSPORT_ALL"] as const;

export const ACTIVITY_TYPES = [
  "MOVEMENT", 
  "CORRECTION", 
  "GOODS_RECEIPT", 
  "PUTAWAY", 
  "PICKING", 
  "GOODS_ISSUE", 
  "INV_COUNTING"] as const;

export const PO_CURRENCIES = [
  "CAD", 
  "USD", 
  "EUR", 
  "JPY", 
  "NOK", 
  "CNY", 
  "AUD", 
  "SGD"] as const;

export type PoHeaderStatus = (typeof PO_HEADER_STATUS)[number];
export type PoItemStatus = (typeof PO_ITEM_STATUS)[number];
export type ImportType = (typeof IMPORT_TYPES)[number];
export type ActivityType = (typeof ACTIVITY_TYPES)[number];
export type Currency = (typeof PO_CURRENCIES)[number];
export type ChipTone = "info" | "warning" | "success" | "critical" | "auto";

export const STATUS_LABELS: Record<PoHeaderStatus, string> = {
  OPEN: "Open",
  CHECKEDIN: "Checked In",
  PART_RECEIVED: "Partially Received",
  RECEIVED: "Received",
  CLOSED: "Closed",
  ARCHIVED: "Archived"
};

export const ACTIVITY_TONE_MAP: Record<ActivityType, ChipTone> = {
  MOVEMENT: "info",
  CORRECTION: "warning",
  GOODS_RECEIPT: "success",
  PUTAWAY: "info",
  PICKING: "auto",
  GOODS_ISSUE: "critical",
  INV_COUNTING: "auto",
};

export const PO_SORT_BY_OPTIONS = [
  { value: "poNumber", label: "PO Number" },
  { value: "createdAt", label: "Creation Date" },
  { value: "expectedDate", label: "Expected Date" },
  { value: "status", label: "Status" },
  { value: "vendor", label: "Vendor" }
] as const;

export const IMPORT_DUTIES_OPTIONS = [
  { value: "", label: "All" },
  { value: "true", label: "Yes" },
  { value: "false", label: "No" }
] as const;

export const SORT_DIRECTION_OPTIONS = [
  { value: "asc", label: "Ascending" },
  { value: "desc", label: "Descending" }
] as const;

export const SHOPIFY_LOGOUT_URL = "https://accounts.shopify.com/logout";
export const DEFAULT_CURRENCY: Currency = "CAD";