import React, { useState } from 'react';
import { Search, Menu, X, Shield } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenSearch: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenSearch,
  onOpenAdmin,
  isAdminLoggedIn,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Wordmark with Red Accent */}
          <div className="flex items-center">
            <button
              onClick={() => onNavigate('home')}
              className="text-left group cursor-pointer focus:outline-none flex items-center space-x-1"
            >
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
                Elite Fabrics
              </span>
              <span className="w-2 h-2 rounded-full bg-[#E53935]" aria-hidden="true" />
            </button>
          </div>

          {/* Clean Public Navigation (Home, Shop, Categories) */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-[#111111]">
            <button
              onClick={() => onNavigate('home')}
              className={`py-1 transition-colors cursor-pointer ${
                currentView === 'home'
                  ? 'text-[#2563EB] border-b-2 border-[#2563EB]'
                  : 'hover:text-[#2563EB]'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('shop')}
              className={`py-1 transition-colors cursor-pointer ${
                currentView === 'shop'
                  ? 'text-[#2563EB] border-b-2 border-[#2563EB]'
                  : 'hover:text-[#2563EB]'
              }`}
            >
              Shop
            </button>
            <button
              onClick={() => onNavigate('categories')}
              className={`py-1 transition-colors cursor-pointer ${
                currentView === 'categories'
                  ? 'text-[#2563EB] border-b-2 border-[#2563EB]'
                  : 'hover:text-[#2563EB]'
              }`}
            >
              Categories
            </button>
          </nav>

          {/* Right Tools: Search & Admin Entry */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenSearch}
              className="p-2 text-[#111111]/70 hover:text-[#2563EB] hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              title="Search outfits & clothing"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Subtle Admin Entrance */}
            <button
              onClick={onOpenAdmin}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                isAdminLoggedIn
                  ? 'bg-red-50 text-[#E53935] hover:bg-red-100 border border-red-200'
                  : 'text-gray-500 hover:text-[#111111] hover:bg-gray-100'
              }`}
              title="Website Owner Admin Dashboard"
            >
              <Shield className="w-3.5 h-3.5 text-[#2563EB]" />
              <span className="hidden sm:inline">{isAdminLoggedIn ? 'Admin Active' : 'Admin'}</span>
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#111111] hover:bg-gray-100 rounded-md cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-4 space-y-2">
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left py-2 px-3 text-sm font-semibold rounded-md ${
              currentView === 'home' ? 'bg-blue-50 text-[#2563EB]' : 'text-[#111111] hover:bg-gray-50'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => {
              onNavigate('shop');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left py-2 px-3 text-sm font-semibold rounded-md ${
              currentView === 'shop' ? 'bg-blue-50 text-[#2563EB]' : 'text-[#111111] hover:bg-gray-50'
            }`}
          >
            Shop
          </button>
          <button
            onClick={() => {
              onNavigate('categories');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left py-2 px-3 text-sm font-semibold rounded-md ${
              currentView === 'categories' ? 'bg-blue-50 text-[#2563EB]' : 'text-[#111111] hover:bg-gray-50'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => {
              onOpenAdmin();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 text-sm font-semibold text-[#2563EB] hover:bg-blue-50 rounded-md flex items-center space-x-1.5"
          >
            <Shield className="w-4 h-4" />
            <span>Admin Dashboard {isAdminLoggedIn && '(Logged In)'}</span>
          </button>
        </div>
      )}
    </header>
  );
};
