import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Product, AdminUser } from './types/product';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { FeaturedProducts } from './components/FeaturedProducts';
import { ProductCatalogue } from './components/ProductCatalogue';
import { ProductDetailPage } from './components/ProductDetailPage';
import { LegalPagesModal, LegalPageType } from './components/LegalPagesModal';
import { SearchModal } from './components/SearchModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLogin } from './components/admin/AdminLogin';

export default function App() {
  // Public product catalogue (empty by default until admin adds products)
  const [products, setProducts] = useState<Product[]>([]);
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [catalogueCategory, setCatalogueCategory] = useState<string>('All');
  const [catalogueSearch, setCatalogueSearch] = useState<string>('');

  // Admin authentication state
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  // Modals
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<LegalPageType | null>(null);

  // Fetch live published products for the public store
  const fetchProducts = useCallback(async (): Promise<Product[]> => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
          return data.products;
        }
      }
    } catch (err) {
      console.warn('Backend connection fallback: Empty database initialized', err);
    }
    return [];
  }, []);

  // Parse path and resolve initial route / product detail page
  const handleRouteFromLocation = useCallback(async (loadedProducts?: Product[]) => {
    const path = window.location.pathname;

    // Check if URL is an individual product page: /product/:slugOrId
    if (path.startsWith('/product/')) {
      const identifier = decodeURIComponent(path.slice('/product/'.length)).replace(/\/$/, '');
      if (identifier) {
        // Try to match from available products first
        const activeList = loadedProducts || products;
        const matched = activeList.find(
          (p) =>
            p.slug.toLowerCase() === identifier.toLowerCase() ||
            p.id.toLowerCase() === identifier.toLowerCase()
        );

        if (matched) {
          setSelectedProduct(matched);
          setCurrentView('product');
          return;
        }

        // If not in local array, fetch directly from backend API
        try {
          const res = await fetch(`/api/products/${encodeURIComponent(identifier)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.product) {
              setSelectedProduct(data.product);
              setCurrentView('product');
              return;
            }
          }
        } catch (e) {
          console.error('Failed to fetch product by slug', e);
        }
      }
    }

    if (path === '/admin') {
      setCurrentView('admin');
      return;
    }

    if (path === '/shop') {
      setCurrentView('shop');
      return;
    }

    // Default to home
    setCurrentView('home');
  }, [products]);

  // Initial load: Fetch products and sync routing
  useEffect(() => {
    fetchProducts().then((loaded) => {
      handleRouteFromLocation(loaded);
    });

    const storedToken = localStorage.getItem('elite_admin_token');
    const storedEmail = localStorage.getItem('elite_admin_email');
    if (storedToken && storedEmail) {
      setAdminUser({ token: storedToken, email: storedEmail });

      // Verify token validity with backend
      fetch('/api/admin/me', {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
        .then((res) => {
          if (!res.ok) {
            localStorage.removeItem('elite_admin_token');
            localStorage.removeItem('elite_admin_email');
            setAdminUser(null);
          }
        })
        .catch(() => {
          // If offline or network error, keep current state
        });
    }

    // Listen to browser Back/Forward popstate events
    const onPopState = () => {
      handleRouteFromLocation();
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [fetchProducts, handleRouteFromLocation]);

  // Admin login / logout
  const handleAdminLogin = (user: AdminUser) => {
    setAdminUser(user);
    window.history.pushState({ view: 'admin' }, '', '/admin');
    setCurrentView('admin');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('elite_admin_token');
    localStorage.removeItem('elite_admin_email');
    setAdminUser(null);
    window.history.pushState({ view: 'home' }, '', '/');
    setCurrentView('home');
    fetchProducts();
  };

  // Navigation router with History API synchronization
  const handleNavigate = (view: string, param?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (view === 'categories') {
      setCatalogueCategory('All');
      setCatalogueSearch('');
      window.history.pushState({ view: 'shop' }, '', '/shop');
      setCurrentView('shop');
      return;
    }

    if (view === 'category' && param) {
      setCatalogueCategory(param);
      setCatalogueSearch('');
      window.history.pushState({ view: 'shop', category: param }, '', '/shop');
      setCurrentView('shop');
      return;
    }

    if (view === 'shop') {
      if (param) setCatalogueCategory(param);
      window.history.pushState({ view: 'shop' }, '', '/shop');
      setCurrentView('shop');
      return;
    }

    if (view === 'admin') {
      window.history.pushState({ view: 'admin' }, '', '/admin');
      setCurrentView('admin');
      return;
    }

    if (view === 'home') {
      window.history.pushState({ view: 'home' }, '', '/');
      setCurrentView('home');
      return;
    }

    setCurrentView(view);
  };

  // Open individual product detail page with unique SEO-friendly URL
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product');
    window.history.pushState(
      { view: 'product', slug: product.slug, id: product.id },
      '',
      `/product/${product.slug}`
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Related products: Same category, strictly excluding current product, published only
  const relatedProducts = useMemo(() => {
    if (!selectedProduct || !selectedProduct.category) return [];
    const currentCat = selectedProduct.category.trim().toLowerCase();
    return products.filter(
      (p) =>
        p.status === 'published' &&
        p.id !== selectedProduct.id &&
        p.category &&
        p.category.trim().toLowerCase() === currentCat
    );
  }, [selectedProduct, products]);

  // If in Admin Mode, render the Private Admin Dashboard or Login
  if (currentView === 'admin') {
    if (!adminUser) {
      return (
        <AdminLogin
          onLoginSuccess={handleAdminLogin}
          onBackToStore={() => handleNavigate('home')}
        />
      );
    }
    return (
      <AdminDashboard
        adminUser={adminUser}
        onLogout={handleAdminLogout}
        onViewStore={() => {
          fetchProducts();
          handleNavigate('home');
        }}
        onProductUpdated={fetchProducts}
      />
    );
  }

  // Public Fashion Store
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111]">
      {/* 1. Clean Navigation Bar */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenAdmin={() => handleNavigate('admin')}
        isAdminLoggedIn={!!adminUser}
      />

      {/* 2. Main Content Body */}
      <main className="flex-1">
        {/* VIEW: HOMEPAGE (Displays all published products in a responsive grid with Load More) */}
        {currentView === 'home' && (
          <div>
            {/* A. Hero Section */}
            <Hero onShopNow={() => handleNavigate('shop')} />

            {/* B. All Published Products Section on Home Page */}
            <FeaturedProducts
              products={products}
              onSelectProduct={handleSelectProduct}
              onViewAll={() => handleNavigate('shop')}
            />

            {/* C. Explore All Outfits Banner */}
            <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
                <div className="space-y-1.5 text-center sm:text-left">
                  <span className="text-xs uppercase font-bold tracking-wider text-[#E53935]">
                    Amazon Affiliate Fashion
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#111111]">
                    Explore Complete Wardrobe Catalogue
                  </h3>
                  <p className="text-sm text-gray-500 max-w-lg">
                    Discover clothing items, stylish seasonal dresses, and verified outfits with direct Amazon affiliate links.
                  </p>
                </div>
                <button
                  onClick={() => handleNavigate('shop')}
                  className="px-6 py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-md transition-colors cursor-pointer shrink-0 shadow-xs"
                >
                  View All Clothing
                </button>
              </div>
            </section>
          </div>
        )}

        {/* VIEW: PRODUCT LISTING PAGE (ALL CLOTHING) */}
        {currentView === 'shop' && (
          <ProductCatalogue
            products={products}
            onSelectProduct={handleSelectProduct}
            initialCategory={catalogueCategory}
            initialSearch={catalogueSearch}
            onOpenAdmin={() => handleNavigate('admin')}
          />
        )}

        {/* VIEW: INDIVIDUAL PRODUCT PAGE (Unique URL: /product/:slug) */}
        {currentView === 'product' && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            relatedProducts={relatedProducts}
            onBack={() => handleNavigate('shop')}
            onSelectProduct={handleSelectProduct}
          />
        )}
      </main>

      {/* 3. Simple Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenLegal={(page) => setLegalModalType(page)}
        onOpenAdmin={() => handleNavigate('admin')}
      />

      {/* 4. Functional Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        products={products}
        onSelectProduct={handleSelectProduct}
        onViewAllResults={(q) => {
          setCatalogueSearch(q);
          setCatalogueCategory('All');
          handleNavigate('shop');
        }}
      />

      {/* 5. Legal & Policy Modal */}
      <LegalPagesModal
        pageType={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </div>
  );
}
