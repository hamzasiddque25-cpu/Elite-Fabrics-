import React, { useState } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { Product } from '../types/product';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onViewAllResults: (query: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
  onViewAllResults,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const published = products.filter((p) => p.status === 'published');

  const results = query.trim()
    ? published
        .filter(
          (p) =>
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            p.category.toLowerCase().includes(query.toLowerCase()) ||
            (p.brand && p.brand.toLowerCase().includes(query.toLowerCase())) ||
            (p.description && p.description.toLowerCase().includes(query.toLowerCase())) ||
            (p.colours && p.colours.some((c) => c.toLowerCase().includes(query.toLowerCase())))
        )
        .slice(0, 6)
    : [];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && query.trim()) {
      onViewAllResults(query);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border border-gray-200 rounded-lg w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in-50 duration-150">
        {/* Search Input Bar */}
        <div className="p-4 flex items-center space-x-3 border-b border-gray-200 bg-white">
          <Search className="w-5 h-5 text-[#2563EB]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search outfits by title, category, colour, or brand..."
            className="w-full bg-transparent text-sm font-medium text-[#111111] focus:outline-none placeholder:text-gray-400"
          />
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-[#111111] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-72 overflow-y-auto p-3 divide-y divide-gray-100">
          {published.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-500">
              No products available in the store catalogue yet.
            </div>
          ) : query.trim() === '' ? (
            <div className="py-6 text-center text-xs text-gray-400">
              Type to search through all published fashion items...
            </div>
          ) : results.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-500">
              No clothing items matching "{query}".
            </div>
          ) : (
            results.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  onSelectProduct(product);
                  onClose();
                }}
                className="py-2.5 px-2 flex items-center justify-between hover:bg-gray-50 rounded cursor-pointer transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-10 h-10 object-cover rounded bg-gray-100"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                      EF
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#2563EB]">
                      {product.category}
                    </span>
                    <h4 className="text-sm font-semibold text-[#111111] group-hover:text-[#2563EB] transition-colors line-clamp-1">
                      {product.title}
                    </h4>
                    <span className="text-xs font-bold text-[#111111] tabular-nums">
                      ${product.salePrice ? product.salePrice.toFixed(2) : product.regularPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#2563EB] transition-all shrink-0" />
              </div>
            ))
          )}
        </div>

        {/* View All */}
        {query.trim() && published.length > 0 && (
          <div className="p-2.5 bg-gray-50 border-t border-gray-200 text-center">
            <button
              onClick={() => {
                onViewAllResults(query);
                onClose();
              }}
              className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
            >
              View all results for "{query}" &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
