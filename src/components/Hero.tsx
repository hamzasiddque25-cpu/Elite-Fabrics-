import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onShopNow: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopNow }) => {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-200 py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
        {/* Red Tag */}
        <div className="inline-flex items-center space-x-1.5 bg-red-50 text-[#E53935] px-3.5 py-1 text-xs font-bold rounded-full border border-red-200">
          <span>Curated Amazon Fashion & Outfits</span>
        </div>

        {/* Main Required Headline */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#111111] leading-tight">
          Discover Your Style
        </h1>

        {/* Required Subheading */}
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Explore stylish outfits and fashion essentials for every season.
        </p>

        {/* Required "Shop Now" Button */}
        <div className="pt-3">
          <button
            onClick={onShopNow}
            className="px-8 py-3.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-md transition-colors cursor-pointer shadow-xs inline-flex items-center space-x-2"
          >
            <span>Shop Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
