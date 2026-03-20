"use client";

import { useCallback, useRef, useState } from "react";
import { ParseCsvData, parseCsvHeaders } from "@/lib/po/item-import/parseCsvPurchaseOrderItems";
import { parseExcelHeaders } from "@/lib/po/item-import/parseExcelFile";

export function useFileImport() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importData, setImportData] = useState<ParseCsvData | null>(null);

    const openFilePicker = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.currentTarget.files?.[0];
        if (!file) return;

        if (file.name.endsWith(".csv")) {
            const text = await file.text();
            setImportData(parseCsvHeaders(text));
        } else {
            setImportData(await parseExcelHeaders(file));
        }

        // Reset input so the same file can be re-selected
        e.currentTarget.value = "";
    }, []);

    const clearImportData = useCallback(() => {
        setImportData(null);
    }, []);

    return {
        fileInputRef,
        importData,
        openFilePicker,
        handleFileChange,
        clearImportData,
    };
}