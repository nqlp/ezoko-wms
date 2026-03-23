import type { Prisma } from '@prisma/client';
import type { AuthenticatedSession } from '@/lib/auth/session-token';
import type { PurchaseOrderListFilters } from '@/lib/validation/po';
import { dateRangeFilter } from '@/lib/utils/prisma-filters';

export type SortBy = NonNullable<PurchaseOrderListFilters["sortBy"]>;

function applyDateRange(
    where: Prisma.PoHeaderWhereInput,
    field: "expectedDate" | "createdAt",
    startValue?: string,
    endValue?: string
) {
    const clause = dateRangeFilter(startValue, endValue, { endOfDay: field === "createdAt" });
    if (clause) {
        where[field] = clause;
    }
}

export function applyFilters(session: AuthenticatedSession, filters: PurchaseOrderListFilters): Prisma.PoHeaderWhereInput {
    const where: Prisma.PoHeaderWhereInput = {
        scope: {
            is: {
                shop: session.shop
            }
        }
    };

    if (filters.status) {
        where.status = filters.status;
    }

    if (filters.vendor) {
        where.vendor = {
            equals: filters.vendor,
            mode: "insensitive"
        };
    }

    if (filters.poNumber) {
        where.poNumber = filters.poNumber;
    }

    if (typeof filters.importDuties === "boolean") {
        where.importDuties = filters.importDuties;
    }

    if (filters.importType) {
        where.importType = filters.importType;
    }

    if (typeof filters.hasNotes === "boolean") {
        if (filters.hasNotes) {
            where.AND = [{ notes: { not: null } }, { notes: { not: "" } }];
        } else {
            where.OR = [{ notes: null }, { notes: "" }];
        }
    }

    if (filters.sku) {
        where.items = {
            some: {
                sku: {
                    contains: filters.sku,
                    mode: "insensitive"
                }
            }
        };
    }

    applyDateRange(where, "expectedDate", filters.expectedDateStart, filters.expectedDateEnd);
    applyDateRange(where, "createdAt", filters.createdAtStart, filters.createdAtEnd);

    return where;
}

export const SORT_COLUMN_MAP: Record<SortBy, keyof Prisma.PoHeaderOrderByWithRelationInput> = {
    poNumber: "poNumber",
    createdAt: "createdAt",
    expectedDate: "expectedDate",
    status: "status",
    vendor: "vendor"
};