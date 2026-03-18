import { ProductVariant } from "@/lib/types/ProductVariant";
import { StockLocation } from "@/lib/types/StockLocation";

const DEFAULT_ERROR_HIDE_MS = 3000; // 3 seconds
const DEFAULT_SUCCESS_HIDE_MS = 5000; // 5 seconds

export type ScannerState = {
    errorMessage: string | null;
    errorAutoHideDuration: number | undefined;
    successAutoHideDuration: number | undefined;
    inlineErrorMessage: string | null;
    successMessage: string | null;
    loading: boolean;
    variant: ProductVariant | null;
    stockLocation: StockLocation[];
    selectedBins: string[];
    moveQty: number;
    currentProductBarcode: string | null;
};

export type ScannerAction =
    | { type: "SET_ERROR_MESSAGE"; payload: string | null }
    | { type: "SET_ERROR_AUTO_HIDE_DURATION"; payload: number | undefined }
    | { type: "SET_SUCCESS_AUTO_HIDE_DURATION"; payload: number | undefined }
    | { type: "SET_INLINE_ERROR_MESSAGE"; payload: string | null }
    | { type: "SET_SUCCESS_MESSAGE"; payload: string | null }
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_VARIANT"; payload: ProductVariant | null }
    | { type: "SET_STOCK_LOCATION"; payload: StockLocation[] }
    | { type: "SET_SELECTED_BINS"; payload: string[] }
    | { type: "SET_MOVE_QTY"; payload: number }
    | { type: "INCREMENT_MOVE_QTY" }
    | { type: "SET_CURRENT_PRODUCT_BARCODE"; payload: string | null }
    | { type: "RESET_SCAN_FEEDBACK" }
    | { type: "RESET_VARIANT_SELECTION" }
    | { type: "CLEAR_MOVE_WORKFLOW" };

export const initialScannerState: ScannerState = {
    errorMessage: null,
    errorAutoHideDuration: DEFAULT_ERROR_HIDE_MS,
    successAutoHideDuration: DEFAULT_SUCCESS_HIDE_MS,
    inlineErrorMessage: null,
    successMessage: null,
    loading: false,
    variant: null,
    stockLocation: [],
    selectedBins: [],
    moveQty: 1,
    currentProductBarcode: null,
};

export function scannerReducer(state: ScannerState, action: ScannerAction): ScannerState {
    switch (action.type) {
        case "SET_ERROR_MESSAGE":
            return { ...state, errorMessage: action.payload };
        case "SET_ERROR_AUTO_HIDE_DURATION":
            return { ...state, errorAutoHideDuration: action.payload };
        case "SET_SUCCESS_AUTO_HIDE_DURATION":
            return { ...state, successAutoHideDuration: action.payload };
        case "SET_INLINE_ERROR_MESSAGE":
            return { ...state, inlineErrorMessage: action.payload };
        case "SET_SUCCESS_MESSAGE":
            return { ...state, successMessage: action.payload };
        case "SET_LOADING":
            return { ...state, loading: action.payload };
        case "SET_VARIANT":
            return { ...state, variant: action.payload };
        case "SET_STOCK_LOCATION":
            return { ...state, stockLocation: action.payload };
        case "SET_SELECTED_BINS":
            return { ...state, selectedBins: action.payload };
        case "SET_MOVE_QTY":
            return { ...state, moveQty: action.payload };
        case "INCREMENT_MOVE_QTY":
            return { ...state, moveQty: state.moveQty + 1 };
        case "SET_CURRENT_PRODUCT_BARCODE":
            return { ...state, currentProductBarcode: action.payload };
        case "RESET_SCAN_FEEDBACK":
            return {
                ...state,
                errorMessage: null,
                errorAutoHideDuration: DEFAULT_ERROR_HIDE_MS,
                successAutoHideDuration: DEFAULT_SUCCESS_HIDE_MS,
                inlineErrorMessage: null,
                successMessage: null,
            };
        case "RESET_VARIANT_SELECTION":
            return {
                ...state,
                variant: null,
                stockLocation: [],
                selectedBins: [],
                currentProductBarcode: null,
            };
        case "CLEAR_MOVE_WORKFLOW":
            return {
                ...state,
                variant: null,
                stockLocation: [],
                selectedBins: [],
                currentProductBarcode: null,
                moveQty: 1,
            };
        default:
            return state;
    }
}
