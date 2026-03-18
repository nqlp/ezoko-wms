"use client";

export const WMS_SCAN_REFOCUS_EVENT = "wms:scan-refocus";

export type ScanRefocusDetail = {
    reason?: string;
};

export function requestScanRefocus(reason?: string): void {
    if (typeof window === "undefined") {
        return;
    }

    const detail: ScanRefocusDetail = reason ? { reason } : {};
    window.dispatchEvent(
        new CustomEvent<ScanRefocusDetail>(WMS_SCAN_REFOCUS_EVENT, { detail })
    );
}