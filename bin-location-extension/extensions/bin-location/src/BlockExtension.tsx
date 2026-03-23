import '@shopify/ui-extensions/preact';
import { render, Fragment } from 'preact';
import { useState, useCallback } from 'preact/hooks';
import { useWarehouseStock } from './hooks/useWarehouseStock';
import { useBinLocationSearch } from './hooks/useBinLocationSearch';
import { StockTable } from './components/StockTable';
import { AddBinLocationForm } from './components/AddBinLocationForm';
import { saveStock } from './services/stockService';
import { parseQty } from '@shared/utils/parseQty';

export default async () => {
  render(<Extension />, document.body);
}

function Extension() {
  const { query, data } = shopify;
  const variantId = data?.selected?.[0]?.id;

  const [formKey, setFormKey] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Custom hooks
  const {
    items,
    setItems,
    loading,
    error,
    setError,
    initialQtyById,
    setInitialQtyById,
    inventoryItemId,
    locationId,
    variantBarcode,
    variantTitle,
  } = useWarehouseStock(variantId, query);

  const {
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
  } = useBinLocationSearch(isAdding, query);

  // Handlers 
  const handleBinSearch = (value: string) => {
    handleQueryChange(value);
    setValidationError("");
  };

  // useCallback to memoize the function
  const handleQtyChange = useCallback((id: string, newValue: string) => {
    const newQty = parseQty(newValue);
    setItems(prev => prev.map(item => (item.id === id ? { ...item, qty: newQty } : item)));
  }, [setItems]);

  const handleAddBinLocationStock = () => {
    setIsAdding(true);
    resetDraft();
  };

  const handleSubmit = async () => {
    setError("");
    setValidationError("");
    try {
      const { updatedItems } = await saveStock({
        items,
        initialQtyById,
        isAdding,
        draftQty,
        draftQuery,
        selectedBin,
        inventoryItemId,
        locationId,
        findBinLocationBySearch,
        query,
        variantTitle,
        variantBarcode,
        token: await shopify.auth.idToken(),
      });

      setItems(updatedItems);
      setInitialQtyById(Object.fromEntries(updatedItems.map(i => [i.id, i.qty])));
      setFormKey((prev) => prev + 1);

      if (isAdding) {
        setIsAdding(false);
        resetDraft();
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to save bin quantities.";
      if (message.includes("select") || message.includes("selected")) {
        setValidationError(message);
      } else {
        setError(message);
      }
      throw e;
    }
  };

  const handleReset = () => {
    setItems(prev => prev.map(item => ({ ...item, qty: initialQtyById[item.id] ?? item.qty })));
    setError("");
    setValidationError("");
    setIsAdding(false);
    setSelectedBin(null);
    resetDraft();
  };

  return (
    <Fragment key={formKey}>
      <s-admin-block heading="Bin Locations">
        <s-stack direction="block">
          <s-form
            onSubmit={(event) => {
              event.waitUntil(handleSubmit());
            }}
            onReset={handleReset}
          >
            <s-stack direction="block">
              {!isAdding && (
                <s-button variant="primary" onClick={handleAddBinLocationStock}>
                  Add Bin Location Stock
                </s-button>
              )}

              {isAdding && (
                <AddBinLocationForm
                  draftQuery={draftQuery}
                  draftQty={draftQty}
                  searching={searching}
                  searchResults={searchResults}
                  onQueryChange={handleBinSearch}
                  onQtyChange={setDraftQty}
                  onSelectResult={onSelectResult}
                  noResultsFound={noResultsFound}
                  validationError={validationError}
                />
              )}

              {loading && <s-text>Loading...</s-text>}
              {!loading && error && <s-text tone="critical">{error}</s-text>}
              {!loading && items.length > 0 && (
                <StockTable items={items} onQtyChange={handleQtyChange} />
              )}
            </s-stack>
          </s-form>
        </s-stack>
      </s-admin-block>
    </Fragment>
  );
}
