export function getControlValue(event: Event): string {
    const currentTargetValue = (event.currentTarget as { value?: unknown } | null)?.value;
    if (typeof currentTargetValue === "string") {
        return currentTargetValue;
    }

    const targetValue = (event.target as { value?: unknown } | null)?.value;
    return typeof targetValue === "string" ? targetValue : "";
}
