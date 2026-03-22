import {
  IMPORT_TYPES,
  PO_CURRENCIES,
  PO_HEADER_STATUS,
  PO_ITEM_STATUS,
  PO_TABLE_HEADERS,
  STATUS_LABELS,
  IMPORT_DUTIES_OPTIONS,
  SORT_DIRECTION_OPTIONS,
  PO_SORT_BY_OPTIONS
} from "@/lib/constants";

export function PoHeaderStatusOptions() {
  return (
    <>
      {PO_HEADER_STATUS.map((status) => (
        <s-option key={status} value={status}>
          {STATUS_LABELS[status] ?? status}
        </s-option>
      ))}
    </>
  );
}

export function PoSortByOptions() {
  return (
    <>
      {PO_SORT_BY_OPTIONS.map((opt) => (
        <s-option key={opt.value} value={opt.value}>
          {opt.label}
        </s-option>
      ))}
    </>
  );
}

export function PoSortDirectionOptions() {
  return (
    <>
      {SORT_DIRECTION_OPTIONS.map((opt) => (
        <s-option key={opt.value} value={opt.value}>
          {opt.label}
        </s-option>
      ))}
    </>
  );
}

export function PoImportDutiesOptions() {
  return (
    <>
      {IMPORT_DUTIES_OPTIONS.map((option) => (
        <s-option key={option.label} value={option.value}>
          {option.label}
        </s-option>
      ))}
    </>
  );
}

export function PoImportTypeOptions() {
  return (
    <>
      {IMPORT_TYPES.map((type) => (
        <s-option key={type} value={type}>
          {type}
        </s-option>
      ))}
    </>
  );
}

export function PoCurrencyOptions() {
  return (
    <>
      {PO_CURRENCIES.map((currency) => (
        <s-option key={currency} value={currency}>
          {currency}
        </s-option>
      ))}
    </>
  );
}

export function PoItemStatusOptions() {
  return (
    <>
      {PO_ITEM_STATUS.map((status: string) => (
        <s-option key={status} value={status}>
          {status}
        </s-option>
      ))}
    </>
  );
}

export function PoTableHeaders() {
  return (
    <>
      {PO_TABLE_HEADERS.map((header: string) => (
        <s-table-header key={header}>{header}</s-table-header>
      ))}
    </>
  );
}

interface VendorOptionsProps {
  vendors: string[];
}

export function VendorOptions({ vendors }: VendorOptionsProps) {
  return (
    <>
      {vendors.map((vendor) => (
        <s-option key={vendor} value={vendor}>
          {vendor}
        </s-option>
      ))}
    </>
  );
}

export const PurchaseOrderUIOptions = {
  PoHeaderStatusOptions,
  PoSortByOptions,
  PoSortDirectionOptions,
  PoImportDutiesOptions,
  PoImportTypeOptions,
  PoCurrencyOptions,
  PoItemStatusOptions,
  PoTableHeaders
};