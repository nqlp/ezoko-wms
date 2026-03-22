export function getControlValue(event: Event): string {
    const currentTargetValue = (event.currentTarget as { value?: unknown } | null)?.value;
    if (typeof currentTargetValue === "string") {
        return currentTargetValue;
    }

    const targetValue = (event.target as { value?: unknown } | null)?.value;
    return typeof targetValue === "string" ? targetValue : "";
}

export function isEditableElement(element: Element | null): boolean {
    if (!element) {
        return false;
    }

    if (element instanceof HTMLInputElement) {
        return true;
    }

    if (element instanceof HTMLTextAreaElement) {
        return true;
    }

    if (element instanceof HTMLSelectElement) {
        return true;
    }

    return element instanceof HTMLElement && element.isContentEditable;
}
