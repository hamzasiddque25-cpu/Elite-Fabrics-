import React, { useState, useMemo } from 'react';
import { Product } from '../types/product';
import { ProductCard } from './ProductCard';
import { ShoppingBag, ChevronDown, Sparkles } from 'lucide-react';

interface FeaturedProductsProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onViewAll: () => void;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products,
  onSelectProduct,
  onViewAll,
}) => {
  // Only published products are visible on the home page
  const publishedProducts = useMemo(() => {
    return products
      .filter((p) => p.status === 'published')
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
  }, [products]);

  // Dynamic categories from published products
  const categories = useMemo(() => {
    const set = new Set<string>();
    publishedProducts.forEach((p) => {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
    });
    return Array.from(set).sort();
  }, [publishedProducts]);

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [visibleCount, setVisibleCount] = useState<number>(8);

  // Filter by category if selected
  const displayedList = useMemo(() => {
    if (activeCategory === 'All') return publishedProducts;
    return publishedProducts.filter(
      (p) => p.category.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [publishedProducts, activeCategory]);

  const visibleProducts = displayedList.slice(0, visibleCount);
  const hasMore = visibleCount < displayedList.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 8);
  };

  // Clean empty state if no products are published yet
  if (publishedProducts.length === 0) {
    return (
      <section className="py-20 bg-gray-50 border-y border-gray-200">
        <div className="max-w-2xl mx-auto px-4 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto shadow-xs">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-wider text-[#E53935]">
              Curated Wardrobe
            </span>
            <h3 className="text-2xl font-extrabold text-[#111111]">
              New Outfits Coming Soon
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
              Our clothing collection is currently being curated. Check back soon for the latest seasonal outfits and dresses with verified Amazon affiliate links.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-14 sm:py-18 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Section Header with Category Tabs */}
      <div className="border-b border-gray-200 pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs uppercase font-bold tracking-wider text-[#E53935] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Collection</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
            Featured Outfits & Clothing
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Explore verified clothing apparel, seasonal fashion, and stylish dresses with direct Amazon affiliate links.
          </p>
        </div>

        {/* Category Pills on Home Page */}
        {categories.length > 0 && (
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 self-start md:self-auto shrink-0">
            <button
              onClick={() => {
                setActiveCategory('All');
                setVisibleCount(8);
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === 'All'
                  ? 'bg-[#111111] text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-400'
              }`}
            >
              All ({publishedProducts.length})
            </button>
            {categories.map((cat) => {
              const count = publishedProducts.filter(
                (p) => p.category.toLowerCase() === cat.toLowerCase()
              ).length;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setVisibleCount(8);
                  }}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                    activeCategory.toLowerCase() === cat.toLowerCase()
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
      </div>

      {/* Clean Responsive Product Grid (Mobile 1 col, Tablet 2 cols, Desktop 4 cols) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {visibleProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onSelectProduct={onSelectProduct}
          />
        ))}
      </div>

      {/* Pagination / "Load More" Button */}
      {hasMore && (
        <div className="pt-6 text-center">
          <button
            onClick={handleLoadMore}
            className="px-8 py-3 bg-white hover:bg-gray-50 border-2 border-[#111111] hover:border-[#2563EB] text-[#111111] hover:text-[#2563EB] font-bold text-xs uppercase tracking-wider rounded-md transition-all cursor-pointer shadow-xs inline-flex items-center space-x-2"
          >
            <span>Load More Outfits ({displayedList.length - visibleCount} remaining)</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}

      {!hasMore && displayedList.length > 8 && (
        <div className="pt-4 text-center text-xs text-gray-400 font-medium">
          Showing all {displayedList.length} outfits in this collection.
        </div>
      )}
    </section>
  );
};
