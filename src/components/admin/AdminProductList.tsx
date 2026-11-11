import React, { useState } from 'react';
import { Product, AdminUser } from '../../types/product';
import { Edit2, Trash2, Eye, EyeOff, ExternalLink, Plus, AlertTriangle } from 'lucide-react';

interface AdminProductListProps {
  products: Product[];
  adminUser: AdminUser;
  onEdit: (product: Product) => void;
  onAddNew: () => void;
  onRefresh: () => void;
}

export const AdminProductList: React.FC<AdminProductListProps> = ({
  products,
  adminUser,
  onEdit,
  onAddNew,
  onRefresh,
}) => {
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Toggle Publish / Unpublish
  const handleToggleStatus = async (product: Product) => {
    setUpdatingId(product.id);
    const newStatus = product.status === 'published' ? 'draft' : 'published';

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminUser.token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (e) {
      console.error('Failed to update status', e);
    } finally {
      setUpdatingId(null);
    }
  };

  // Confirm and Execute Delete
  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/products/${productToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminUser.token}`,
        },
      });
      if (res.ok) {
        setProductToDelete(null);
        onRefresh();
      }
    } catch (e) {
      console.error('Delete error', e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#111111]">Manage Fashion Products</h2>
          <p className="text-xs text-gray-500">
            Publish, edit, unpublish, or delete clothing items from the public store.
          </p>
        </div>

        <button
          onClick={onAddNew}
          className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-md transition-colors inline-flex items-center space-x-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products Table */}
      {products.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center max-w-lg mx-auto space-y-4">
          <h3 className="text-base font-bold text-[#111111]">No Products Added Yet</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Your fashion catalogue is currently empty. Click "Add New Product" above to upload your first clothing item and associate its Amazon affiliate link.
          </p>
          <button
            onClick={onAddNew}
            className="px-5 py-2.5 bg-[#2563EB] text-white text-xs font-bold uppercase rounded-md cursor-pointer hover:bg-blue-700"
          >
            Add First Product
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100 border-b border-gray-200 text-[#111111] uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">Image</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Product ID</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    {/* Image */}
                    <td className="py-3 px-4">
                      <div className="w-12 h-14 bg-gray-100 rounded overflow-hidden border border-gray-200">
                        {p.image ? (
                          <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-400">
                            No Img
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-sm text-[#111111] block line-clamp-1">
                        {p.title}
                      </span>
                      {p.brand && <span className="text-[11px] text-gray-500">{p.brand}</span>}
                    </td>

                    {/* Product ID */}
                    <td className="py-3 px-4 font-mono text-[11px] text-gray-600">
                      {p.id}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 font-semibold text-[#111111]">
                      {p.category}
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 tabular-nums">
                      <span className="font-bold text-[#111111]">
                        ${p.salePrice ? p.salePrice.toFixed(2) : p.regularPrice.toFixed(2)}
                      </span>
                      {p.salePrice && p.salePrice < p.regularPrice && (
                        <span className="text-gray-400 line-through text-[11px] block">
                          ${p.regularPrice.toFixed(2)}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {p.status === 'published' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-[#2563EB]">
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-gray-100 text-gray-600">
                          Draft
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Toggle Status */}
                        <button
                          disabled={updatingId === p.id}
                          onClick={() => handleToggleStatus(p)}
                          className="p-1.5 text-gray-600 hover:text-[#2563EB] rounded cursor-pointer transition-colors"
                          title={p.status === 'published' ? 'Unpublish Product' : 'Publish Product'}
                        >
                          {p.status === 'published' ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4 text-[#2563EB]" />
                          )}
                        </button>

                        {/* View Live Product Link */}
                        {p.status === 'published' && (
                          <a
                            href={`/product/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-gray-400 hover:text-[#2563EB] rounded cursor-pointer transition-colors"
                            title="View Live Product Page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        {/* Edit */}
                        <button
                          onClick={() => onEdit(p)}
                          className="p-1.5 text-gray-600 hover:text-[#111111] rounded cursor-pointer transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setProductToDelete(p)}
                          className="p-1.5 text-gray-400 hover:text-[#E53935] rounded cursor-pointer transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-gray-200 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center space-x-3 text-[#E53935]">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-[#111111]">
                Delete Product Permanently?
              </h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to delete <strong>"{productToDelete.title}"</strong> (ID: {productToDelete.id})? This will permanently remove the item and its public page.
            </p>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-[#E53935] hover:bg-red-700 text-white rounded text-xs font-bold uppercase cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
