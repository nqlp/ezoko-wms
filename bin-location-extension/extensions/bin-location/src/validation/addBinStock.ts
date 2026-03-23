import { BinLocation } from '../types/warehouseStock';
import { parseQty } from '@shared/utils/parseQty';

export interface AddBinStockInput {
    draftQuery: string;
    draftQty: string;
    selectedBin: BinLocation | null;
}

export interface ValidatedAddBinStock {
    selectedBin: BinLocation;
    qty: number;
}

/**
 * Validates the input for adding stock to a bin location
 * Throws a user-facing Error if validation fails
 */
export function validateAddBinStockInput(input: AddBinStockInput): ValidatedAddBinStock {
    const trimmedQuery = input.draftQuery.trim();

    if (!input.selectedBin) {
        if (!trimmedQuery) {
            throw new Error("Please type and select a bin location.");
        }
        throw new Error(
            `"${trimmedQuery}" is not selected. Please choose a bin location from the suggestions.`
        );
    }

    const raw = Number(input.draftQty);
    if (input.draftQty.trim() === "" || !Number.isFinite(raw) || raw < 0) {
        throw new Error("Please enter a valid quantity.");
    }

    return {
        selectedBin: input.selectedBin,
        qty: parseQty(input.draftQty),
    };
}
