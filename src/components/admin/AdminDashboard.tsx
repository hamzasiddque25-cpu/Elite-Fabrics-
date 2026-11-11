import React, { useState, useEffect } from 'react';
import { AdminUser, Product, AdminStats } from '../../types/product';
import { AdminProductList } from './AdminProductList';
import { AdminProductForm } from './AdminProductForm';
import { LogOut, ExternalLink, Package, CheckCircle, FileText, Plus, RefreshCw } from 'lucide-react';

interface AdminDashboardProps {
  adminUser: AdminUser;
  onLogout: () => void;
  onViewStore: () => void;
  onProductUpdated?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminUser,
  onLogout,
  onViewStore,
  onProductUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'edit'>('list');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['Summer', 'Winter']);
  const [stats, setStats] = useState<AdminStats>({ total: 0, published: 0, drafts: 0 });
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch admin products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products', {
        headers: {
          Authorization: `Bearer ${adminUser.token}`,
        },
      });
      if (res.status === 401) {
        onLogout();
        return;
      }
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        setStats(data.stats || { total: 0, published: 0, drafts: 0 });
        if (data.categories) setCategories(data.categories);
        onProductUpdated?.();
      }
    } catch (e) {
      console.error('Failed to load admin products', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [adminUser]);

  const handleEditProduct = (prod: Product) => {
    setProductToEdit(prod);
    setActiveTab('edit');
  };

  const handleSavedProduct = (saved: Product) => {
    setProductToEdit(null);
    setActiveTab('list');
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-[#111111]">
      {/* Top Admin Bar */}
      <header className="bg-[#111111] text-white border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="font-extrabold text-lg tracking-tight text-white">
              Elite Fabrics Admin
            </span>
            <span className="bg-[#E53935] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white">
              Owner Mode
            </span>
          </div>

          <div className="flex items-center space-x-4 text-xs font-semibold">
            <button
              onClick={onViewStore}
              className="text-gray-300 hover:text-white inline-flex items-center space-x-1 cursor-pointer"
            >
              <span>View Public Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <span className="text-gray-600">|</span>

            <span className="hidden sm:inline text-gray-400 font-mono">
              {adminUser.email}
            </span>

            <button
              onClick={onLogout}
              className="text-[#E53935] hover:text-red-400 inline-flex items-center space-x-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Total Products
              </span>
              <h3 className="text-2xl font-extrabold text-[#111111] mt-1 tabular-nums">
                {stats.total}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
                Published (Live)
              </span>
              <h3 className="text-2xl font-extrabold text-[#2563EB] mt-1 tabular-nums">
                {stats.published}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#2563EB]">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Drafts (Unpublished)
              </span>
              <h3 className="text-2xl font-extrabold text-[#111111] mt-1 tabular-nums">
                {stats.drafts}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 space-x-6 text-sm font-bold">
          <button
            onClick={() => {
              setProductToEdit(null);
              setActiveTab('list');
            }}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === 'list'
                ? 'border-b-2 border-[#2563EB] text-[#2563EB]'
                : 'text-gray-500 hover:text-[#111111]'
            }`}
          >
            Manage Products ({products.length})
          </button>

          <button
            onClick={() => {
              setProductToEdit(null);
              setActiveTab('add');
            }}
            className={`pb-3 transition-colors cursor-pointer inline-flex items-center space-x-1 ${
              activeTab === 'add'
                ? 'border-b-2 border-[#2563EB] text-[#2563EB]'
                : 'text-gray-500 hover:text-[#111111]'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>

          {activeTab === 'edit' && (
            <span className="pb-3 border-b-2 border-[#2563EB] text-[#2563EB]">
              Editing Product: {productToEdit?.id}
            </span>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'list' && (
          <AdminProductList
            products={products}
            adminUser={adminUser}
            onEdit={handleEditProduct}
            onAddNew={() => {
              setProductToEdit(null);
              setActiveTab('add');
            }}
            onRefresh={fetchProducts}
          />
        )}

        {(activeTab === 'add' || activeTab === 'edit') && (
          <AdminProductForm
            adminUser={adminUser}
            categories={categories}
            productToEdit={productToEdit}
            onSaved={handleSavedProduct}
            onCancel={() => {
              setProductToEdit(null);
              setActiveTab('list');
            }}
          />
        )}
      </main>
    </div>
  );
};
