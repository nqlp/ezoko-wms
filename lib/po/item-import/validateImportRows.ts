import type { AuthenticatedSession } from "@/lib/auth/session-token";
import type { CsvValidationIssue, ValidatedCsvRow } from "@/lib/po/item-import/types";
import { validateSku, validateProductByHandle } from "@/lib/shopify/catalog";
import { orderQtySchema, moneySchema } from "@/lib/validation/field-schemas";

interface MappedRow {
    rowNumber: number;
    sku?: string;
    product_handle?: string;
    variant?: string;
    qty?: string;
    unit_cost?: string;
}

export interface ValidateImportInput {
    rows: MappedRow[];
    skuMapped: boolean;
    productHandleMapped: boolean;
    qtyMapped: boolean;
    unitCostMapped: boolean;
}

export interface ValidateImportResult {
    issues: CsvValidationIssue[];
    hasErrors: boolean;
    validRows: ValidatedCsvRow[];
}

// Pre-fetch Shopify lookups 

async function prefetchLookups(session: AuthenticatedSession, input: ValidateImportInput) {
    const uniqueSkus = input.skuMapped
        ? [...new Set(input.rows.filter((r) => r.sku?.trim()).map((r) => r.sku!.trim()))]
        : [];

    const uniqueHandles = input.productHandleMapped
        ? [...new Set(input.rows.filter((r) => r.product_handle?.trim()).map((r) => r.product_handle!.trim()))]
        : [];

    const [skuValidations, handleValidations] = await Promise.all([
        Promise.all(
            uniqueSkus.map(async (sku) => [sku.toLowerCase(), await validateSku(session, sku)] as const)
        ),
        Promise.all(
            uniqueHandles.map(async (handle) => {
                try {
                    return [handle.toLowerCase(), await validateProductByHandle(session, handle)] as const;
                } catch (error) {
                    console.error(`Error validating product handle "${handle}":`, error);
                    return [handle.toLowerCase(), null] as const;
                }
            })
        ),
    ]);

    return {
        skuMap: new Map(skuValidations),
        handleMap: new Map(handleValidations),
    };
}

// Row validation

function validateRow(
    row: MappedRow,
    input: ValidateImportInput,
    skuMap: Map<string, Awaited<ReturnType<typeof validateSku>>>,
    handleMap: Map<string, Awaited<ReturnType<typeof validateProductByHandle>> | null>,
): { issues: CsvValidationIssue[]; validRow: ValidatedCsvRow | null } {
    const issues: CsvValidationIssue[] = [];
    const sku = row.sku?.trim() ?? "";
    const productHandle = row.product_handle?.trim() ?? "";
    const variant = row.variant?.trim() ?? "";
    const qty = row.qty?.trim() ?? "";
    const unitCost = row.unit_cost?.trim() ?? "";

    let resolvedSku = sku;
    let resolvedProductTitle = "";
    let resolvedVariantTitle = variant;
    let resolvedUnitCost: number | null = null;

    // SKU or product handle resolution
    if (sku && input.skuMapped) {
        const matches = skuMap.get(sku.toLowerCase()) ?? [];
        const match = matches[0];
        if (!match) {
            issues.push({ rowNumber: row.rowNumber, sku, field: "sku", message: "SKU not found", severity: "error" });
        } else {
            resolvedSku = match.sku;
            resolvedProductTitle = match.productTitle;
            resolvedVariantTitle = match.variantTitle;
        }
    } else if (!productHandle || !input.productHandleMapped) {
        issues.push({ rowNumber: row.rowNumber, sku, field: "product_handle", message: "Product handle required", severity: "error" });
    } else {
        const product = handleMap.get(productHandle.toLowerCase());
        if (!product) {
            issues.push({ rowNumber: row.rowNumber, sku, field: "product_handle", message: "Product handle not found", severity: "error" });
        } else {
            resolvedProductTitle = product.title;
        }
    }

    // Quantity validation (using shared schema)
    if (!input.qtyMapped) {
        issues.push({
            rowNumber: row.rowNumber,
            sku,
            field: "qty",
            message: "Quantity column is not mapped",
            severity: "error"
        });
    } else if (!qty) {
        issues.push({
            rowNumber: row.rowNumber,
            sku,
            field: "qty",
            message: "Quantity is required",
            severity: "error"
        });
    } else {
        const result = orderQtySchema.safeParse(qty);
        if (!result.success) {
            issues.push({
                rowNumber: row.rowNumber,
                sku, field: "qty",
                message: "Quantity must be an integer greater than or equal to 1",
                severity: "error"
            });
        }
    }

    // Unit cost validation (using field schemas) 
    if (unitCost && input.unitCostMapped) {
        const result = moneySchema.safeParse(unitCost);
        if (!result.success) {
            issues.push({
                rowNumber: row.rowNumber,
                sku,
                field: "unit_cost",
                message: "Unit cost must be a positive number",
                severity: "error"
            });
        } else {
            resolvedUnitCost = result.data;
        }
    }

    // Build valid row if no errors 
    const hasError = issues.length > 0;
    const validRow = hasError
        ? null
        : {
            csvRowNumber: row.rowNumber,
            sku: resolvedSku,
            productTitle: resolvedProductTitle,
            variantTitle: resolvedVariantTitle,
            orderQty: Number(qty),
            unitCost: resolvedUnitCost,
        };

    return { issues, validRow };
}

// Public API 

export async function validateImportRows(
    session: AuthenticatedSession,
    input: ValidateImportInput
): Promise<ValidateImportResult> {
    const { skuMap, handleMap } = await prefetchLookups(session, input);

    const allIssues: CsvValidationIssue[] = [];
    const validRows: ValidatedCsvRow[] = [];

    for (const row of input.rows) {
        const { issues, validRow } = validateRow(row, input, skuMap, handleMap);
        allIssues.push(...issues);
        if (validRow) {
            validRows.push(validRow);
        }
    }

    const hasErrors = allIssues.some((issue) => issue.severity === "error");

    return {
        issues: allIssues,
        hasErrors,
        validRows: hasErrors ? [] : validRows,
    };
}