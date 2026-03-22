export type MappedRow = {
    /** * Mapped Properties:
     * Automatically creates optional fields for every key defined in CsvTargetField.
     * it updates here automatically.
     */
    [K in CsvTargetField]?: string | number | null;
} & {
    /** * Index Signature:
     * Allows the object to hold extra, unmapped columns from the original file.
     * This prevents TypeScript errors when passing along additional reference data.
     */
    [key: string]: string | number | null | undefined;
};

export interface RowToValidate extends MappedRow {
    rowNumber: number;
}

export interface ValidatedCsvRow {
    csvRowNumber: number;
    sku: string;
    productTitle: string;
    variantTitle: string;
    orderQty: number;
    unitCost: number | null;
}

export interface PurchaseOrderImportError {
    csvRowNumber?: number;
    field?: string;
    message: string;
}

export type PurchaseOrderImportParseResult =
    | {
        success: true;
        parsedRows: ValidatedCsvRow[];
    }
    | {
        success: false;
        errors: PurchaseOrderImportError[];
    };

export type CsvTargetField = "sku" | "product_handle" | "variant" | "qty" | "unit_cost";

export const TARGET_FIELDS: CsvTargetField[] = ["sku", "product_handle", "variant", "qty", "unit_cost"];

export type CsvColumnMapping = {
    csvColumn: string,
    targetField: CsvTargetField | null,
}

export type CsvValidationIssue = {
    rowNumber: number;
    sku: string;
    field: string;
    message: string;
    severity: "error" | "warning";
}

export type CsvValidationResult = {
    issues: CsvValidationIssue[];
    hasErrors: boolean;
    validRows?: ValidatedCsvRow[];
}