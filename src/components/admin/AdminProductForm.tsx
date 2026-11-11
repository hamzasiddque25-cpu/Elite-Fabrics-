import React, { useState, useEffect } from 'react';
import { Upload, X, Film, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Product, AdminUser } from '../../types/product';

interface AdminProductFormProps {
  adminUser: AdminUser;
  categories: string[];
  productToEdit?: Product | null;
  onSaved: (product: Product) => void;
  onCancel: () => void;
}

export const AdminProductForm: React.FC<AdminProductFormProps> = ({
  adminUser,
  categories,
  productToEdit,
  onSaved,
  onCancel,
}) => {
  // Form state
  const [title, setTitle] = useState(productToEdit?.title || '');
  const [category, setCategory] = useState(productToEdit?.category || categories[0] || 'Summer');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  const [image, setImage] = useState(productToEdit?.image || '');
  const [galleryImages, setGalleryImages] = useState<string[]>(
    productToEdit?.images || (productToEdit?.image ? [productToEdit.image] : [])
  );
  const [extraImageUrl, setExtraImageUrl] = useState('');
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [video, setVideo] = useState(productToEdit?.video || '');

  const [regularPrice, setRegularPrice] = useState(productToEdit?.regularPrice ? productToEdit.regularPrice.toString() : '');
  const [salePrice, setSalePrice] = useState(productToEdit?.salePrice ? productToEdit.salePrice.toString() : '');
  const [discount, setDiscount] = useState<number>(productToEdit?.discount || 0);

  const [brand, setBrand] = useState(productToEdit?.brand || '');
  const [sizesInput, setSizesInput] = useState(productToEdit?.sizes?.join(', ') || 'S, M, L, XL');
  const [coloursInput, setColoursInput] = useState(productToEdit?.colours?.join(', ') || 'Black, Red, Blue, White');

  const [amazonAffiliateLink, setAmazonAffiliateLink] = useState(productToEdit?.amazonAffiliateLink || '');
  const [description, setDescription] = useState(productToEdit?.description || '');

  // SEO fields (auto-suggested)
  const [seoTitle, setSeoTitle] = useState(productToEdit?.seoTitle || '');
  const [metaDescription, setMetaDescription] = useState(productToEdit?.metaDescription || '');
  const [slug, setSlug] = useState(productToEdit?.slug || '');

  // UI state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-calculate discount percentage whenever prices change
  useEffect(() => {
    const reg = parseFloat(regularPrice);
    const sale = parseFloat(salePrice);
    if (!isNaN(reg) && reg > 0 && !isNaN(sale) && sale < reg) {
      setDiscount(Math.round(((reg - sale) / reg) * 100));
    } else {
      setDiscount(0);
    }
  }, [regularPrice, salePrice]);

  // Auto-generate SEO title, slug, and meta description from title
  useEffect(() => {
    if (!productToEdit) {
      if (title.trim()) {
        const cleanSlug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        setSlug(cleanSlug);
        setSeoTitle(`${title} | Elite Fabrics`);
        if (!metaDescription && description) {
          setMetaDescription(description.slice(0, 155));
        }
      }
    }
  }, [title, productToEdit, description]);

  // Handle Image Upload (Converts to Data URL & uploads to backend persistent /uploads/)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WEBP)');
      return;
    }

    setUploadingImage(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;
        const res = await fetch('/api/admin/upload-media', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminUser.token}`,
          },
          body: JSON.stringify({
            dataUrl,
            filename: file.name,
            mediaType: 'image',
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Image upload failed');
        }
        setImage(data.url);
        setGalleryImages((prev) => (prev.includes(data.url) ? prev : [data.url, ...prev]));
      } catch (err: any) {
        setError(err.message || 'Failed to upload image');
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Additional Gallery Image Upload
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    setError(null);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      await new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const dataUrl = reader.result as string;
            const res = await fetch('/api/admin/upload-media', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${adminUser.token}`,
              },
              body: JSON.stringify({
                dataUrl,
                filename: file.name,
                mediaType: 'image',
              }),
            });
            const data = await res.json();
            if (res.ok && data.success && data.url) {
              setGalleryImages((prev) => (prev.includes(data.url) ? prev : [...prev, data.url]));
              if (!image) setImage(data.url);
            }
          } catch (err: any) {
            console.error('Gallery image upload failed', err);
          } finally {
            resolve();
          }
        };
        reader.readAsDataURL(file);
      });
    }
    setUploadingGallery(false);
  };

  const handleAddExtraUrl = () => {
    if (extraImageUrl.trim()) {
      const url = extraImageUrl.trim();
      setGalleryImages((prev) => (prev.includes(url) ? prev : [...prev, url]));
      if (!image) setImage(url);
      setExtraImageUrl('');
    }
  };

  const handleRemoveGalleryImage = (imgUrl: string) => {
    setGalleryImages((prev) => prev.filter((img) => img !== imgUrl));
    if (image === imgUrl) {
      const remaining = galleryImages.filter((img) => img !== imgUrl);
      setImage(remaining[0] || '');
    }
  };

  // Handle Video Upload (Optional)
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file (MP4, WEBM, MOV)');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('Video file size exceeds maximum limit of 50MB');
      return;
    }

    setUploadingVideo(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;
        const res = await fetch('/api/admin/upload-media', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminUser.token}`,
          },
          body: JSON.stringify({
            dataUrl,
            filename: file.name,
            mediaType: 'video',
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Video upload failed');
        }
        setVideo(data.url);
      } catch (err: any) {
        setError(err.message || 'Failed to upload video');
      } finally {
        setUploadingVideo(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Add Custom Category
  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      setCategory(newCategoryName.trim());
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  };

  // Submit Handler
  const handleSave = async (status: 'published' | 'draft') => {
    setError(null);

    // Validation
    if (!title.trim()) {
      setError('Product Title is required.');
      return;
    }
    if (!image.trim()) {
      setError('Main Product Image is required.');
      return;
    }
    if (!amazonAffiliateLink.trim()) {
      setError('Amazon Affiliate Link is required.');
      return;
    }

    // URL validation
    try {
      new URL(amazonAffiliateLink);
    } catch {
      setError('Please enter a valid Amazon URL starting with http:// or https://');
      return;
    }

    setSaving(true);

    const sizes = sizesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const colours = coloursInput
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const allImages = Array.from(
      new Set([image.trim(), ...galleryImages.map((img) => img.trim())].filter(Boolean))
    );

    const payload = {
      title: title.trim(),
      category: category.trim(),
      image: image.trim(),
      images: allImages,
      video: video.trim() || undefined,
      description: description.trim(),
      regularPrice: parseFloat(regularPrice) || 0,
      salePrice: salePrice ? parseFloat(salePrice) : undefined,
      brand: brand.trim() || undefined,
      sizes,
      colours,
      amazonAffiliateLink: amazonAffiliateLink.trim(),
      status,
      seoTitle: seoTitle.trim() || `${title} | Elite Fabrics`,
      metaDescription: metaDescription.trim() || description.slice(0, 155),
      slug: slug.trim(),
    };

    try {
      const endpoint = productToEdit ? `/api/admin/products/${productToEdit.id}` : '/api/admin/products';
      const method = productToEdit ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminUser.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save product');
      }

      onSaved(data.product);
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-extrabold text-[#111111]">
            {productToEdit ? `Edit Product: ${productToEdit.id}` : 'Add New Fashion Product'}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Create or edit clothing product information, pricing, media, and Amazon affiliate links.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-xs font-semibold text-gray-500 hover:text-[#111111] cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-xs text-[#E53935] rounded-md flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-6 text-sm text-[#111111]">
        {/* A. Product Image (Required) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]">
            A. Main Product Image <span className="text-[#E53935]">*</span>
          </label>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {image ? (
              <div className="relative w-40 h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImage('')}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-[#E53935] text-white p-1 rounded-full transition-colors cursor-pointer"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="w-40 h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 p-4 text-center shrink-0">
                <ImageIcon className="w-8 h-8 mb-1 text-gray-300" />
                <span className="text-[11px]">No image uploaded</span>
              </div>
            )}

            <div className="space-y-2 flex-1">
              <label className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-xs font-semibold cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-[#2563EB]" />
                <span>{image ? 'Replace Image' : 'Upload Main Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
              {uploadingImage && <span className="text-xs text-[#2563EB] ml-2 font-medium">Uploading image...</span>}
              <p className="text-xs text-gray-500 leading-relaxed">
                Upload a high-quality vertical fashion photo (JPG, PNG, WEBP). The image will be stored permanently in persistent storage.
              </p>

              {/* Or Direct Image URL input */}
              <div className="pt-1">
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="Or paste external image URL directly..."
                  className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Additional Gallery Photos */}
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#111111]">
                Product Image Gallery ({galleryImages.length} photos)
              </span>
              <label className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-50 text-[#2563EB] hover:bg-blue-100 rounded text-xs font-semibold cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>+ Upload Gallery Photos</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryUpload}
                  disabled={uploadingGallery}
                  className="hidden"
                />
              </label>
            </div>

            {uploadingGallery && (
              <p className="text-xs text-[#2563EB] mb-2 font-medium">Uploading gallery images...</p>
            )}

            {/* Gallery Thumbnails List */}
            {galleryImages.length > 0 && (
              <div className="flex flex-wrap gap-2.5 mb-2.5">
                {galleryImages.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className={`relative w-20 h-24 rounded border overflow-hidden group bg-gray-100 ${
                      image === imgUrl ? 'ring-2 ring-[#2563EB] border-[#2563EB]' : 'border-gray-200'
                    }`}
                  >
                    <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                    {image === imgUrl && (
                      <span className="absolute bottom-0 inset-x-0 bg-[#2563EB] text-white text-[9px] font-bold text-center py-0.5">
                        Primary
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(imgUrl)}
                      className="absolute top-1 right-1 bg-black/70 hover:bg-[#E53935] text-white p-0.5 rounded-full transition-colors cursor-pointer"
                      title="Remove from gallery"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {image !== imgUrl && (
                      <button
                        type="button"
                        onClick={() => setImage(imgUrl)}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-bold transition-opacity cursor-pointer"
                      >
                        Set Main
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add Extra Image URL */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="url"
                value={extraImageUrl}
                onChange={(e) => setExtraImageUrl(e.target.value)}
                placeholder="Or paste an additional image URL to add to gallery..."
                className="flex-1 px-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded focus:border-[#2563EB] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddExtraUrl}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-xs font-semibold rounded text-[#111111] cursor-pointer"
              >
                Add URL
              </button>
            </div>
          </div>
        </div>

        {/* B. Product Title */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]">
            B. Product Title <span className="text-[#E53935]">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Elegant Summer Linen Wrap Dress"
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md focus:border-[#2563EB] focus:bg-white focus:outline-none"
          />
        </div>

        {/* C. Category */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]">
            C. Category <span className="text-[#E53935]">*</span>
          </label>
          <div className="flex items-center gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md focus:border-[#2563EB] focus:outline-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setShowAddCategory(!showAddCategory)}
              className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
            >
              + Add Custom Category
            </button>
          </div>

          {showAddCategory && (
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category name (e.g. Dresses, Outfits)"
                className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded focus:border-[#2563EB] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-3 py-1.5 bg-[#2563EB] text-white text-xs font-semibold rounded hover:bg-blue-700 cursor-pointer"
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* D. Product Video (Optional) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]">
            D. Product Video <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {video && (
              <div className="relative w-48 h-32 bg-black rounded-lg overflow-hidden border border-gray-300 shrink-0">
                <video src={video} controls className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setVideo('')}
                  className="absolute top-2 right-2 bg-black/80 hover:bg-[#E53935] text-white p-1 rounded-full cursor-pointer"
                  title="Remove video"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="space-y-2 flex-1">
              <label className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-xs font-semibold cursor-pointer transition-colors">
                <Film className="w-4 h-4 text-[#2563EB]" />
                <span>{video ? 'Replace Video' : 'Upload Outfit Video'}</span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleVideoUpload}
                  disabled={uploadingVideo}
                  className="hidden"
                />
              </label>
              {uploadingVideo && <span className="text-xs text-[#2563EB] ml-2 font-medium">Uploading video...</span>}
              <p className="text-xs text-gray-500">
                Supports MP4, WEBM, MOV up to 50MB. Shows high-converting live video on the individual product page.
              </p>
            </div>
          </div>
        </div>

        {/* E. Product Description */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]">
            E. Product Description
          </label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of the outfit, fabric material, fit, styling tips, and occasion..."
            className="w-full p-3 text-sm bg-gray-50 border border-gray-300 rounded-md focus:border-[#2563EB] focus:bg-white focus:outline-none"
          />
        </div>

        {/* F. Product Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#111111] mb-1">
              F1. Regular Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={regularPrice}
              onChange={(e) => setRegularPrice(e.target.value)}
              placeholder="e.g. 59.99"
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md focus:border-[#2563EB] focus:outline-none tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#111111] mb-1">
              F2. Sale Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="e.g. 47.99"
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md focus:border-[#2563EB] focus:outline-none tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#111111] mb-1">
              F3. Auto Discount %
            </label>
            <div className="px-3 py-2 text-sm font-bold text-[#E53935] bg-gray-100 border border-gray-300 rounded-md">
              {discount > 0 ? `${discount}% OFF` : 'No Discount'}
            </div>
          </div>
        </div>

        {/* G. Additional Product Information */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#111111] mb-1">
              Brand / Label
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Atelier Milan"
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md focus:border-[#2563EB] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#111111] mb-1">
              Available Sizes
            </label>
            <input
              type="text"
              value={sizesInput}
              onChange={(e) => setSizesInput(e.target.value)}
              placeholder="e.g. S, M, L, XL"
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md focus:border-[#2563EB] focus:outline-none"
            />
            <span className="text-[10px] text-gray-400">Comma-separated sizes</span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#111111] mb-1">
              Available Colours
            </label>
            <input
              type="text"
              value={coloursInput}
              onChange={(e) => setColoursInput(e.target.value)}
              placeholder="e.g. Black, White, Red, Blue"
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md focus:border-[#2563EB] focus:outline-none"
            />
            <span className="text-[10px] text-gray-400">Comma-separated colours</span>
          </div>
        </div>

        {/* H. Amazon Affiliate Link */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]">
            H. Amazon Affiliate Link <span className="text-[#E53935]">*</span>
          </label>
          <input
            type="url"
            required
            value={amazonAffiliateLink}
            onChange={(e) => setAmazonAffiliateLink(e.target.value)}
            placeholder="https://www.amazon.com/dp/B08XYZ...?tag=yourtag-20"
            className="w-full px-3 py-2 text-sm font-mono bg-gray-50 border border-gray-300 rounded-md focus:border-[#2563EB] focus:bg-white focus:outline-none"
          />
          <p className="text-[11px] text-gray-500">
            When a customer clicks <strong>PLACE ORDER</strong> on this product's page, they will be redirected to this exact Amazon affiliate URL.
          </p>
        </div>

        {/* I. SEO Information */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#111111]">
              I. SEO & Google Search Console Optimization
            </span>
            <span className="text-[11px] text-gray-400">Auto-suggested from title</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1">
                SEO Title
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Product SEO Title"
                className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1">
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="seo-friendly-url-slug"
                className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-gray-300 rounded focus:border-[#2563EB] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1">
              Meta Description
            </label>
            <input
              type="text"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Brief summary for Google search snippet (120-160 chars)"
              className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded focus:border-[#2563EB] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Publishing Actions */}
      <div className="pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded text-xs font-semibold cursor-pointer"
        >
          Cancel
        </button>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('draft')}
            className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-[#111111] font-bold text-xs uppercase tracking-wider rounded-md transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('published')}
            className="px-6 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-md transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            {saving ? 'Publishing...' : 'Publish Product'}
          </button>
        </div>
      </div>
    </div>
  );
};
