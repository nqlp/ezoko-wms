import { ApiError } from '@/lib/http';
import type { PoHeaderStatus } from '@/lib/constants';

export function parsePoNumber(value: string): bigint {
    try {
        return BigInt(value);
    } catch {
        throw new ApiError(400, "Invalid po_number");
    }
}

export function canCheckIn(status: PoHeaderStatus): boolean {
    return status === "OPEN";
}

export function isReadOnly(status: PoHeaderStatus): boolean {
    return status === "CLOSED";
}