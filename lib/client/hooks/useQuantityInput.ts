import { useState, useEffect } from "react";
import { requestScanRefocus } from "@/components/m/scanner/focusBus";

interface UseQuantityInputOptions {
    value: number;
    onChange: (newValue: number) => void;
    min?: number;
    refocusKey?: string;
}

export function useQuantityInput({
    value,
    onChange,
    min = 1,
    refocusKey
}: UseQuantityInputOptions) {
    const [inputValue, setInputValue] = useState(String(value));

    useEffect(() => {
        setInputValue(String(value));
    }, [value]);

    const handleChange = (text: string) => {
        setInputValue(text);

        if (text === "" || !/^\d+$/.test(text)) return;

        const parsed = Number.parseInt(text, 10);
        if (parsed >= min) {
            onChange(parsed);
        }
    };

    const handleBlur = () => {
        const parsed = Number.parseInt(inputValue, 10);
        if (isNaN(parsed) || parsed < min) {
            setInputValue(String(value));
        } else {
            onChange(parsed);
        }

        if (refocusKey) {
            requestScanRefocus(refocusKey);
        }
    };

    const increment = () => onChange(value + 1);
    const decrement = () => {
        if (value > min) {
            onChange(value - 1);
        }
    };

    return {
        inputValue,
        handleChange,
        handleBlur,
        increment,
        decrement,
        canDecrement: value > min
    };
}