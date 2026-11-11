import React, { useState, useMemo } from 'react';
import { Search, X, ArrowUpDown, ShoppingBag, Shield } from 'lucide-react';
import { Product } from '../types/product';
import { ProductCard } from './ProductCard';

interface ProductCatalogueProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  initialCategory?: string;
  initialSearch?: string;
  onOpenAdmin?: () => void;
}

export const ProductCatalogue: React.FC<ProductCatalogueProps> = ({
  products,
  onSelectProduct,
  initialCategory = 'All',
  initialSearch = '',
  onOpenAdmin,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [visibleCount, setVisibleCount] = useState<number>(12);

  React.useEffect(() => {
    setVisibleCount(12);
  }, [searchQuery, selectedCategory]);

  // Extract unique categories from published products
  const dynamicCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
    });
    return Array.from(set).sort();
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (p.status !== 'published') return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            p.title.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            (p.brand && p.brand.toLowerCase().includes(q)) ||
            (p.description && p.description.toLowerCase().includes(q)) ||
            (p.colours && p.colours.some((c) => c.toLowerCase().includes(q))) ||
            (p.sizes && p.sizes.some((s) => s.toLowerCase().includes(q)));
          if (!matches) return false;
        }

        // Category filter
        if (selectedCategory !== 'All' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = a.salePrice || a.regularPrice;
        const priceB = b.salePrice || b.regularPrice;

        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
      });
  }, [products, searchQuery, selectedCategory, sortBy]);

  const liveCount = products.filter((p) => p.status === 'published').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Title */}
      <div className="mb-8 pb-4 border-b border-gray-200">
        <span className="text-xs uppercase font-bold tracking-wider text-[#E53935]">
          Curated Discovery
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#111111] tracking-tight mt-1">
          Clothing, Dresses & Outfits
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Browse verified fashion apparel, seasonal dresses, and outfits with direct Amazon affiliate links.
        </p>
      </div>

      {/* Search and Sort Toolbar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search outfits by title, style, colour, or size..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md focus:border-[#2563EB] focus:bg-white focus:outline-none transition-colors text-[#111111]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center space-x-2 text-xs text-gray-600 shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#2563EB]" />
          <span className="font-semibold uppercase tracking-wider text-[11px]">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="py-1.5 px-2 bg-gray-50 border border-gray-200 rounded-md text-xs font-medium text-[#111111] focus:border-[#2563EB] focus:outline-none cursor-pointer"
          >
            <option value="newest">Recently Added</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Dynamic Category Filter Pills */}
      {dynamicCategories.length > 0 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-[#111111] text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-400'
            }`}
          >
            All Categories ({liveCount})
          </button>
          {dynamicCategories.map((cat) => {
            const count = products.filter(
              (p) => p.status === 'published' && p.category.toLowerCase() === cat.toLowerCase()
            ).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-400'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Empty State vs Real Products */}
      {liveCount === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 sm:p-16 text-center max-w-2xl mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#111111]">
              Product Catalogue is Ready & Empty
            </h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
              No sample or fake products are displayed. Real fashion products added through your private admin dashboard will be displayed here immediately.
            </p>
          </div>
          {onOpenAdmin && (
            <div className="pt-2">
              <button
                onClick={onOpenAdmin}
                className="px-6 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs rounded-md transition-colors cursor-pointer inline-flex items-center space-x-2 shadow-xs"
              >
                <Shield className="w-4 h-4" />
                <span>Go to Admin Dashboard</span>
              </button>
            </div>
          )}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center max-w-xl mx-auto space-y-3">
          <h3 className="text-base font-bold text-[#111111]">No matching products found</h3>
          <p className="text-xs text-gray-500">
            No clothing items match your search for "{searchQuery}".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.slice(0, visibleCount).map((p) => (
              <ProductCard key={p.id} product={p} onSelectProduct={onSelectProduct} />
            ))}
          </div>

          {visibleCount < filteredProducts.length && (
            <div className="pt-6 text-center">
              <button
                onClick={() => setVisibleCount((prev) => prev + 12)}
                className="px-8 py-3 bg-white hover:bg-gray-50 border-2 border-[#111111] hover:border-[#2563EB] text-[#111111] hover:text-[#2563EB] font-bold text-xs uppercase tracking-wider rounded-md transition-all cursor-pointer shadow-xs"
              >
                Load More Outfits ({filteredProducts.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
