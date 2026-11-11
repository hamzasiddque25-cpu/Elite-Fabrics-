import React from 'react';
import { Product } from '../types/product';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct }) => {
  const hasDiscount = product.salePrice && product.salePrice < product.regularPrice;

  return (
    <div className="bg-white border border-gray-200 hover:border-[#2563EB] rounded-lg transition-all duration-150 overflow-hidden flex flex-col justify-between group shadow-xs">
      {/* Clothing Photography Area */}
      <a
        href={`/product/${product.slug}`}
        onClick={(e) => {
          e.preventDefault();
          onSelectProduct(product);
        }}
        className="relative h-72 sm:h-80 w-full bg-gray-100 flex items-center justify-center cursor-pointer overflow-hidden block"
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform duration-300"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="text-center p-6 text-gray-400">
            <span className="text-xs uppercase font-bold text-gray-500 block">
              {product.category || 'Clothing'}
            </span>
            <span className="text-sm font-semibold text-gray-700 mt-1 block">
              {product.title}
            </span>
          </div>
        )}

        {/* Red Sale Tag */}
        {hasDiscount && (
          <div className="absolute top-2.5 left-2.5 bg-[#E53935] text-white text-[11px] font-extrabold px-2 py-0.5 rounded shadow-xs">
            Save {product.discount}%
          </div>
        )}

        {/* Unique Product ID */}
        <div className="absolute bottom-2.5 left-2.5 bg-[#111111]/85 text-white text-[10px] font-mono px-2 py-0.5 rounded">
          {product.id}
        </div>
      </a>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Dynamic Category & Brand */}
          <div className="text-xs text-gray-500 font-medium mb-1 truncate">
            <span className="font-semibold text-[#2563EB]">{product.category}</span>
            {product.brand && (
              <>
                <span className="mx-1.5 text-gray-300">·</span>
                <span className="text-[#111111]">{product.brand}</span>
              </>
            )}
          </div>

          {/* Product Title */}
          <h3 className="font-bold text-sm text-[#111111] leading-snug line-clamp-2">
            <a
              href={`/product/${product.slug}`}
              onClick={(e) => {
                e.preventDefault();
                onSelectProduct(product);
              }}
              className="hover:text-[#2563EB] transition-colors cursor-pointer"
              title={product.title}
            >
              {product.title}
            </a>
          </h3>

          {/* Available Colours / Sizes */}
          {product.colours && product.colours.length > 0 && (
            <div className="mt-1.5 text-xs text-gray-500 truncate">
              <span>Colours: </span>
              <span className="text-[#111111] font-semibold">
                {product.colours.slice(0, 3).join(', ')}
                {product.colours.length > 3 ? ` +${product.colours.length - 3}` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Pricing and Action */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-base font-extrabold text-[#111111] tabular-nums">
                ${product.salePrice ? product.salePrice.toFixed(2) : product.regularPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through tabular-nums">
                  ${product.regularPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <a
            href={`/product/${product.slug}`}
            onClick={(e) => {
              e.preventDefault();
              onSelectProduct(product);
            }}
            className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded transition-colors cursor-pointer inline-flex items-center"
          >
            View Product
          </a>
        </div>
      </div>
    </div>
  );
};
