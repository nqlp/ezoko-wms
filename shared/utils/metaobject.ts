import type { MetaobjectFieldWithReference } from "@shared/types/index";

export function resolveBinName(
    fields: MetaobjectFieldWithReference[],
    fallbackHandle: string
): string {
    const binField = fields.find((f) => f.key === "bin_location");
    const refFields = binField?.reference?.fields ?? [];
    const value =
        refFields.find((f) => f.key === "bin_location")?.value ??
        refFields.find((f) => f.key === "bin")?.value;

    if (value?.trim()) return value.trim();
    if (binField?.reference?.handle) return binField.reference.handle;
    return fallbackHandle || "Unknown";
}