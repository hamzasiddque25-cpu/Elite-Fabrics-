import React, { useState, useEffect, useMemo } from 'react';
import {
  ExternalLink,
  ArrowLeft,
  ShieldCheck,
  Film,
  ChevronLeft,
  ChevronRight,
  Share2,
  Check,
  Tag,
} from 'lucide-react';
import { Product } from '../types/product';
import { ProductCard } from './ProductCard';

interface ProductDetailPageProps {
  product: Product;
  relatedProducts: Product[];
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  relatedProducts,
  onBack,
  onSelectProduct,
}) => {
  const [activeMedia, setActiveMedia] = useState<'image' | 'video'>('image');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // Compile full image gallery list from product
  const galleryImages = useMemo(() => {
    const list: string[] = [];
    if (product.image) list.push(product.image);
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (img && typeof img === 'string' && !list.includes(img.trim())) {
          list.push(img.trim());
        }
      });
    }
    return list;
  }, [product]);

  // Reset active photo index when product changes
  useEffect(() => {
    setSelectedImageIndex(0);
    setActiveMedia('image');
  }, [product.id]);

  // Dynamic SEO, Canonical and OpenGraph Metadata for social sharing (Pinterest, Google, Facebook)
  useEffect(() => {
    const originalTitle = document.title;
    const pageTitle = product.seoTitle || `${product.title} | Elite Fabrics`;
    document.title = pageTitle;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    const originalDesc = metaDesc.getAttribute('content') || '';
    metaDesc.setAttribute(
      'content',
      product.metaDescription || product.description.slice(0, 155) || 'Discover curated outfits on Elite Fabrics.'
    );

    // OpenGraph Title & Image
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', pageTitle);

    let ogImage = document.querySelector('meta[property="og:image"]');
    if (!ogImage) {
      ogImage = document.createElement('meta');
      ogImage.setAttribute('property', 'og:image');
      document.head.appendChild(ogImage);
    }
    ogImage.setAttribute('content', product.image);

    // OpenGraph URL
    const pageUrl = window.location.href;
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', pageUrl);

    // JSON-LD Product Schema for Google Search Console & Rich Snippets
    const scriptId = 'product-json-ld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const jsonLdData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      image: galleryImages,
      description: product.description || product.title,
      sku: product.id,
      brand: {
        '@type': 'Brand',
        name: product.brand || 'Elite Fabrics',
      },
      category: product.category,
      offers: {
        '@type': 'Offer',
        url: product.amazonAffiliateLink,
        priceCurrency: 'USD',
        price: product.salePrice ? product.salePrice.toFixed(2) : product.regularPrice.toFixed(2),
        availability: 'https://schema.org/InStock',
        seller: {
          '@type': 'Organization',
          name: 'Amazon',
        },
      },
    };
    scriptTag.text = JSON.stringify(jsonLdData);

    return () => {
      document.title = originalTitle;
      if (metaDesc) metaDesc.setAttribute('content', originalDesc);
      const existingScript = document.getElementById(scriptId);
      if (existingScript) existingScript.remove();
    };
  }, [product, galleryImages]);

  const hasDiscount = product.salePrice && product.salePrice < product.regularPrice;
  const currentPhoto = galleryImages[selectedImageIndex] || product.image;

  const handleNextPhoto = () => {
    if (galleryImages.length > 1) {
      setActiveMedia('image');
      setSelectedImageIndex((prev) => (prev + 1) % galleryImages.length);
    }
  };

  const handlePrevPhoto = () => {
    if (galleryImages.length > 1) {
      setActiveMedia('image');
      setSelectedImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Pinterest Share URL
  const pinterestShareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
    window.location.href
  )}&media=${encodeURIComponent(product.image)}&description=${encodeURIComponent(product.title)}`;

  return (
    <article className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* 1. Breadcrumb and Sharing Bar */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-gray-200 gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-wider font-bold text-[#111111] hover:text-[#2563EB] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Outfits</span>
        </button>

        <div className="flex items-center space-x-3 text-xs">
          <span className="font-semibold text-gray-500">
            {product.category}
          </span>
          <span className="text-gray-300">·</span>

          {/* Pinterest Share Button */}
          <a
            href={pinterestShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 text-[#E53935] hover:text-red-700 font-bold transition-colors cursor-pointer"
            title="Share on Pinterest"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Pin It</span>
          </a>

          <span className="text-gray-300">·</span>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center space-x-1 text-[#2563EB] hover:underline font-bold cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span className="text-green-600">Link Copied!</span>
              </>
            ) : (
              <span>Copy Link</span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Main Product Presentation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Interactive Image & Video Gallery */}
        <div className="md:col-span-6 lg:col-span-7 space-y-4">
          {/* Main Viewing Box */}
          <div className="relative h-96 sm:h-[500px] lg:h-[560px] w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center select-none group">
            {activeMedia === 'video' && product.video ? (
              <video
                src={product.video}
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            ) : currentPhoto ? (
              <img
                src={currentPhoto}
                alt={`${product.title} - Photo ${selectedImageIndex + 1}`}
                className="w-full h-full object-cover object-top transition-transform duration-300"
                loading="eager"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="text-center p-8 text-gray-400">
                <span className="text-xs uppercase font-bold text-gray-500 block">
                  {product.category}
                </span>
                <span className="text-base font-semibold text-gray-700 mt-1 block">
                  {product.title}
                </span>
              </div>
            )}

            {/* Permanent Product ID Reference */}
            <div className="absolute top-3 left-3 bg-[#111111]/85 text-white text-[11px] font-mono px-2.5 py-1 rounded shadow-xs z-10">
              REF: {product.id}
            </div>

            {/* Red Discount Tag */}
            {hasDiscount && (
              <div className="absolute top-3 right-3 bg-[#E53935] text-white text-xs font-extrabold px-2.5 py-1 rounded shadow-xs z-10">
                Save {product.discount}%
              </div>
            )}

            {/* Navigation Arrows for Multi-Image Gallery */}
            {activeMedia === 'image' && galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevPhoto}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-opacity opacity-80 hover:opacity-100 cursor-pointer z-10"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextPhoto}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-opacity opacity-80 hover:opacity-100 cursor-pointer z-10"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Photo Counter Pill */}
            {activeMedia === 'image' && galleryImages.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-[#111111]/75 text-white text-[10px] font-bold px-2 py-0.5 rounded z-10">
                {selectedImageIndex + 1} / {galleryImages.length}
              </div>
            )}
          </div>

          {/* Gallery Thumbnails Strip (Photos + Video) */}
          <div className="flex items-center space-x-2.5 overflow-x-auto pb-2">
            {galleryImages.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedImageIndex(idx);
                  setActiveMedia('image');
                }}
                className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded border overflow-hidden shrink-0 cursor-pointer transition-all ${
                  activeMedia === 'image' && selectedImageIndex === idx
                    ? 'ring-2 ring-[#2563EB] border-[#2563EB] scale-102'
                    : 'border-gray-300 hover:border-gray-500 opacity-80 hover:opacity-100'
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover object-top"
                />
              </button>
            ))}

            {/* Video Thumbnail if uploaded */}
            {product.video && (
              <button
                type="button"
                onClick={() => setActiveMedia('video')}
                className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded border overflow-hidden shrink-0 cursor-pointer bg-black flex flex-col items-center justify-center text-white transition-all ${
                  activeMedia === 'video'
                    ? 'ring-2 ring-[#2563EB] border-[#2563EB] scale-102'
                    : 'border-gray-300 hover:border-gray-500 opacity-80 hover:opacity-100'
                }`}
              >
                <Film className="w-6 h-6 text-[#2563EB]" />
                <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Video</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Pricing, Specs, and Prominent PLACE ORDER Button */}
        <div className="md:col-span-6 lg:col-span-5 space-y-6">
          <div className="space-y-1.5">
            <span className="text-xs uppercase font-bold tracking-wider text-[#2563EB] block">
              {product.category} {product.brand && `· ${product.brand}`}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] leading-tight">
              {product.title}
            </h1>
          </div>

          {/* Pricing Box */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-1.5">
            <div className="flex items-baseline space-x-2.5">
              <span className="text-3xl font-extrabold text-[#111111] tabular-nums">
                ${product.salePrice ? product.salePrice.toFixed(2) : product.regularPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-base text-gray-400 line-through tabular-nums">
                  ${product.regularPrice.toFixed(2)}
                </span>
              )}
            </div>
            {hasDiscount && (
              <div className="text-xs font-bold text-[#E53935] flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5" />
                <span>Special Deal: Save {product.discount}% on Amazon</span>
              </div>
            )}
            <p className="text-[11px] text-gray-500">
              *Verified pricing on Amazon. Taxes, sizing choices, and shipping options are handled securely on Amazon.
            </p>
          </div>

          {/* Available Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#111111] uppercase tracking-wide block">
                Available Sizes:
              </span>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-white border border-gray-300 text-xs text-[#111111] font-bold rounded"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Available Colours */}
          {product.colours && product.colours.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#111111] uppercase tracking-wide block">
                Available Colours:
              </span>
              <div className="flex flex-wrap gap-2">
                {product.colours.map((c, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-white border border-gray-300 text-xs text-[#111111] font-semibold rounded"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* PROMINENT BUTTON: PLACE ORDER */}
          <div className="space-y-2.5 pt-2">
            <a
              href={product.amazonAffiliateLink}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="w-full flex items-center justify-center space-x-2 py-4 px-6 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-base uppercase tracking-widest rounded-md transition-all shadow-md cursor-pointer hover:shadow-lg active:scale-[0.99]"
            >
              <span>PLACE ORDER</span>
              <ExternalLink className="w-5 h-5 ml-1" />
            </a>

            {/* Clear Amazon Affiliate Disclosure */}
            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded text-xs text-gray-600 leading-relaxed flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
              <span>
                As an Amazon Associate, Elite Fabrics earns from qualifying purchases. Clicking <strong>PLACE ORDER</strong> opens this exact outfit directly on Amazon to choose sizes, confirm shipping, and complete your purchase securely.
              </span>
            </div>
          </div>

          {/* Detailed Product Description */}
          {product.description && (
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <h2 className="text-xs uppercase font-bold text-[#111111] tracking-wider">
                Product Details & Description
              </h2>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. RELATED PRODUCTS: "You May Also Like" (Exact requested title and same-category matching) */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-gray-200 space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <span className="text-xs uppercase font-bold tracking-wider text-[#E53935]">
              Similar Outfits in {product.category}
            </span>
            <h2 className="text-2xl font-extrabold text-[#111111] tracking-tight mt-1">
              You May Also Like
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}
    </article>
  );
};
