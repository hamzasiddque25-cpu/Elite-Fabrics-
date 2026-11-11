import React from 'react';
import { Shield } from 'lucide-react';
import { LegalPageType } from './LegalPagesModal';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
  onOpenLegal: (page: LegalPageType) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenLegal,
  onOpenAdmin,
}) => {
  return (
    <footer className="bg-[#111111] text-white border-t border-gray-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-1">
              <span className="text-xl font-bold tracking-tight text-white">
                Elite Fabrics
              </span>
              <span className="w-2 h-2 rounded-full bg-[#E53935]" aria-hidden="true" />
            </div>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              Curated fashion apparel, seasonal dresses, and outfits discovery platform. Discover high quality fashion essentials with verified Amazon affiliate links.
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-wider text-gray-300 block">
              Quick Links
            </span>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#2563EB] transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop')}
                  className="hover:text-[#2563EB] transition-colors cursor-pointer"
                >
                  Shop Clothing
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('categories')}
                  className="hover:text-[#2563EB] transition-colors cursor-pointer"
                >
                  Fashion Categories
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="text-gray-400 hover:text-white inline-flex items-center space-x-1 cursor-pointer pt-1"
                >
                  <Shield className="w-3 h-3 text-[#2563EB]" />
                  <span>Admin Portal</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Legal and Compliance */}
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-wider text-gray-300 block">
              Information & Legal
            </span>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li>
                <button
                  onClick={() => onOpenLegal('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('contact')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('affiliate')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Affiliate Disclosure
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('privacy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('terms')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Amazon Disclosure Box */}
        <div className="p-4 bg-white/5 border border-white/10 rounded text-[11px] text-gray-400 leading-relaxed space-y-1">
          <p className="font-semibold text-white">
            Amazon Associates Program Disclosure:
          </p>
          <p>
            Elite Fabrics is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com. Product prices and availability are accurate as of the date/time indicated and are subject to change.
          </p>
        </div>

        {/* Bottom Strip */}
        <div className="pt-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          <div>
            &copy; {new Date().getFullYear()} Elite Fabrics. All rights reserved.
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span>https://elitefabrics.online/</span>
            <span>·</span>
            <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="hover:text-white">
              Sitemap.xml
            </a>
            <span>·</span>
            <a href="/robots.txt" target="_blank" rel="noreferrer" className="hover:text-white">
              Robots.txt
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
