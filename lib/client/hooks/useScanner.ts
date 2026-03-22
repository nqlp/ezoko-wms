import { useCallback, useEffect, useRef, useState } from "react";
import { WMS_SCAN_REFOCUS_EVENT } from "@/components/m/scanner/focusBus";

interface UseScannerOptions {
    onSubmit: (barcode: string) => void | Promise<void>;
}

export function useScanner({ onSubmit }: UseScannerOptions) {
    const [manualValue, setManualValue] = useState("");
    const catcherRef = useRef<HTMLDivElement | null>(null);
    const scanBufferRef = useRef("");
    const manualFocusedRef = useRef(false);
    const queueRef = useRef<string[]>([]);
    const processingRef = useRef(false);

    const focusCatcher = useCallback((force = false) => {
        const catcher = catcherRef.current;
        if (!catcher) return;
        if (!force && manualFocusedRef.current) return;

        const activeElement = document.activeElement;

        if (!force && activeElement && activeElement !== catcher && activeElement !== document.body) {
            return;
        }
        catcher.focus();
    }, []);

    const processQueue = useCallback(async () => {
        if (processingRef.current) return;
        processingRef.current = true;
        try {
            while (queueRef.current.length > 0) {
                const nextBarcode = queueRef.current.shift();
                if (nextBarcode) await onSubmit(nextBarcode);
            }
        } finally {
            processingRef.current = false;
            focusCatcher(true);
        }
    }, [focusCatcher, onSubmit]);

    const enqueueSubmit = useCallback((barcode: string) => {
        const value = barcode.trim();
        if (!value) return;
        queueRef.current.push(value);
        void processQueue();
    }, [processQueue]);
    
    // Manage focus to ensure the scanner input is always ready
    useEffect(() => {
        const refocus = (event: Event) => {
            if (event.type === "visibilitychange" && document.visibilityState !== "visible") return;

            if (event.type === "focus") {
                const target = event.target as Element;
                if (
                    target instanceof HTMLInputElement ||
                    target instanceof HTMLTextAreaElement ||
                    target instanceof HTMLSelectElement ||
                    (target as HTMLElement).isContentEditable
                ) {
                    return; 
                }
            }

            const isForce = event.type === WMS_SCAN_REFOCUS_EVENT;
            focusCatcher(isForce);
        };

        window.addEventListener(WMS_SCAN_REFOCUS_EVENT, refocus);
        document.addEventListener("focus", refocus, true);
        document.addEventListener("visibilitychange", refocus);

        focusCatcher(true);

        return () => {
            window.removeEventListener(WMS_SCAN_REFOCUS_EVENT, refocus);
            document.removeEventListener("focus", refocus, true);
            document.removeEventListener("visibilitychange", refocus);
        };
    }, [focusCatcher]);

    const handleCatcherKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === "NumpadEnter") {
            e.preventDefault();
            const value = scanBufferRef.current;
            scanBufferRef.current = "";
            enqueueSubmit(value);
        } else if (e.key === "Backspace") {
            scanBufferRef.current = scanBufferRef.current.slice(0, -1);
        } else if (e.key.length === 1) {
            scanBufferRef.current += e.key;
        }
    };

    const submitManualValue = () => {
        const value = manualValue.trim();
        if (!value) return;
        setManualValue("");
        manualFocusedRef.current = false;
        enqueueSubmit(value);
        focusCatcher(true);
    };

    return {
        manualValue,
        setManualValue,
        catcherRef,
        handleCatcherKeyDown,
        submitManualValue,
        setManualFocused: (focused: boolean) =>  manualFocusedRef.current = focused,
        focusCatcher
    };
}