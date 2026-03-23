import { useEffect, useState } from 'preact/hooks';
import { FETCH_BIN_LOCATIONS_QUERY } from '../graphql/queries';
import { FetchBinLocationsResponse } from '../types/api';
import { BinLocation } from '../types/warehouseStock';
import { getFieldValue, ShopifyQueryFct } from '../utils/helpers';
import { scoreMatch } from '../utils/search';

export type { BinLocation } from '../types/warehouseStock';

export interface UseBinLocationSearchResult {
    selectedBin: BinLocation | null;
    setSelectedBin: (bin: BinLocation | null) => void;
    draftQuery: string;
    draftQty: string;
    setDraftQty: (qty: string) => void;
    searching: boolean;
    searchResults: BinLocation[];
    onSelectResult: (result: BinLocation) => void;
    resetDraft: () => void;
    findBinLocationBySearch: (searchString: string) => Promise<BinLocation | null>;
    handleQueryChange: (value: string) => void;
    noResultsFound: boolean;
}

export function useBinLocationSearch(
    isAdding: boolean,
    query: ShopifyQueryFct
): UseBinLocationSearchResult {
    const [selectedBin, setSelectedBin] = useState<BinLocation | null>(null);
    const [draftQuery, setDraftQuery] = useState("");
    const [draftQty, setDraftQty] = useState("");
    const [searching, setSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<BinLocation[]>([]);
    const [noResultsFound, setNoResultsFound] = useState(false);

    const onSelectResult = (result: BinLocation) => {
        setSelectedBin(result);
        setDraftQuery(result.title || result.handle || "");
        setSearchResults([]);
        setNoResultsFound(false);
    };

    const resetDraft = () => {
        setDraftQuery("");
        setDraftQty("");
        setSelectedBin(null);
        setSearchResults([]);
        setSearching(false);
        setNoResultsFound(false);
    };

    const findBinLocationBySearch = async (searchString: string): Promise<BinLocation | null> => {
        if (!searchString) {
            return null;
        }
        const response = await query<FetchBinLocationsResponse>(FETCH_BIN_LOCATIONS_QUERY, {});
        const nodes = response?.data?.metaobjects?.nodes ?? [];
        const match = nodes.find(node => node.handle === searchString);
        return match ? { id: match.id, handle: match.handle, title: getFieldValue(match.fields, "bin_location") } : null;
    };

    const handleQueryChange = (value: string) => {
        setDraftQuery(value);
        setSelectedBin(null);
        setNoResultsFound(false);
    };

    // Search effect
    useEffect(() => {
        if (!isAdding) return;
        const searchQuery = draftQuery.trim();
        if (!searchQuery || selectedBin) {
            setSearchResults([]);
            setSearching(false);
            setNoResultsFound(false);
            return;
        }
        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const response = await query<FetchBinLocationsResponse>(FETCH_BIN_LOCATIONS_QUERY, {});

                const nodes = response?.data.metaobjects.nodes || [];
                const mapped = nodes.map((node) => {
                    const title = (getFieldValue(node.fields, "bin_location") || "").trim();
                    const score = scoreMatch(searchQuery, title);
                    return { id: node.id, title, score };
                }).filter((node) => node.score > 0)
                    .sort((a, b) => b.score - a.score
                        || a.title.localeCompare(b.title));

                const finalResults = mapped.slice(0, 3).map(({ id, title }) => ({ id, title }));
                setSearchResults(finalResults);
                setNoResultsFound(finalResults.length === 0);

            } catch (e) {
                console.error("Search failed", e);
            }
            setSearching(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [draftQuery, isAdding, query, selectedBin]);

    return {
        selectedBin,
        setSelectedBin,
        draftQuery,
        draftQty,
        setDraftQty,
        searching,
        searchResults,
        onSelectResult,
        resetDraft,
        findBinLocationBySearch,
        handleQueryChange,
        noResultsFound,
    };
}
