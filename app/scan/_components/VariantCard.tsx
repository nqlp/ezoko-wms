import { useEffect, useState } from "react";
import { ProductVariant } from "@/lib/types/ProductVariant";

type VariantCardProps = {
    foundProduct: ProductVariant | null;
};

export default function VariantCard({ foundProduct }: VariantCardProps) {
    const [isMagnified, setIsMagnified] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    if (!foundProduct) {
        return null;
    }

    const variantImage = foundProduct?.media?.nodes?.[0]?.image;
    const productImage = foundProduct?.product?.featuredMedia?.image;
    const displayImage = variantImage ?? productImage;
    const displayImageAlt = displayImage?.altText;

    useEffect(() => {
        const media = window.matchMedia("(pointer: coarse)");
        const updateIsMobile = () => setIsMobile(media.matches);
        updateIsMobile();

        media.addEventListener?.("change", updateIsMobile);

        return () => {
            media.removeEventListener?.("change", updateIsMobile);
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key == "Escape") {
                setIsMagnified(false);
            }
        };

        if (isMagnified && !isMobile) {
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isMagnified, isMobile]);

    return (
        <div className="mt-4 border-(--ezoko-ink) bg-(--ezoko-mint)">
            <div>
                <div>
                    <h2 className="text-lg font-bold text-(--ezoko-ink)">Product found!</h2>
                </div>
            </div>

            <div className="mt-4 flex gap-4 items-start">
                <div
                    className={`h-28 w-28 border-2 border-(--ezoko-ink) bg-white flex items-center justify-center ${displayImage && !isMobile ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
                    onClick={() => displayImage && !isMobile && setIsMagnified(true)}
                >
                    {displayImage ? (
                        <img
                            src={displayImage.url}
                            alt={displayImageAlt ?? "Product image"}
                            className="max-w-full max-h-full object-contain bg-white"
                        />
                    ) : (
                        <span className="text-[10px] text-(--ezoko-ink) opacity-50 text-center uppercase">
                            No Image Available
                        </span>
                    )}
                </div>

                <div className="text-lg uppercase">
                    <div>
                        {foundProduct.product?.title}
                    </div>

                    <div>
                        {foundProduct.selectedOptions.map((variant) => (
                            <div key={variant.name}>
                                {variant.name}: {variant.value}
                            </div>
                        ))}
                    </div>

                    <div>
                        SKU: {foundProduct.sku}
                    </div>

                    <div>
                        On-hand: {foundProduct.inventoryQuantity ?? "N/A"}
                    </div>
                </div>
            </div>

            {isMagnified && displayImage && !isMobile && (
                <div
                    className="fixed inset-0 z-50 flex justify-center p-4 bg-(--ezoko-paper)/50 backdrop-blur-sm"
                    onClick={() => setIsMagnified(false)}
                >
                    <img
                        src={displayImage.url}
                        alt={displayImageAlt ?? "Magnified product image"}
                        className="max-w-full max-h-full object-contain border-2 border-(--ezoko-ink) bg-white"
                    />
                    <button
                        className="absolute top-4 right-4 cursor-pointer text-(--ezoko-ink) text-3xl font-bold"
                        onClick={() => setIsMagnified(false)}
                    >
                        X
                    </button>
                </div>
            )}
        </div>
    );
}
