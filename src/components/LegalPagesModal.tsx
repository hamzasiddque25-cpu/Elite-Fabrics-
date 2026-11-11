import React, { useState } from 'react';
import { X, CheckCircle2, Send } from 'lucide-react';

export type LegalPageType =
  | 'about'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'affiliate';

interface LegalPagesModalProps {
  pageType: LegalPageType | null;
  onClose: () => void;
}

export const LegalPagesModal: React.FC<LegalPagesModalProps> = ({ pageType, onClose }) => {
  const [activeTab, setActiveTab] = useState<LegalPageType>(pageType || 'about');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  React.useEffect(() => {
    if (pageType) setActiveTab(pageType);
  }, [pageType]);

  if (!pageType) return null;

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border border-gray-200 rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-[#111111] text-white flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">
              Elite Fabrics Information & Policies
            </h2>
            <p className="text-xs text-gray-400">
              Governance, transparency, and compliance.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('about')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'about' ? 'border-[#2563EB] text-[#2563EB] bg-white' : 'border-transparent text-gray-500 hover:text-[#111111]'
            }`}
          >
            About Us
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'contact' ? 'border-[#2563EB] text-[#2563EB] bg-white' : 'border-transparent text-gray-500 hover:text-[#111111]'
            }`}
          >
            Contact Us
          </button>
          <button
            onClick={() => setActiveTab('affiliate')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'affiliate' ? 'border-[#2563EB] text-[#2563EB] bg-white' : 'border-transparent text-gray-500 hover:text-[#111111]'
            }`}
          >
            Affiliate Disclosure
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'privacy' ? 'border-[#2563EB] text-[#2563EB] bg-white' : 'border-transparent text-gray-500 hover:text-[#111111]'
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'terms' ? 'border-[#2563EB] text-[#2563EB] bg-white' : 'border-transparent text-gray-500 hover:text-[#111111]'
            }`}
          >
            Terms of Service
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4 text-sm text-gray-800 leading-relaxed">
          {activeTab === 'about' && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-[#111111]">About Elite Fabrics</h3>
              <p>
                Elite Fabrics (https://elitefabrics.online/) is a premier fashion discovery, outfit inspiration, and clothing affiliate platform. We showcase carefully curated clothing items, dresses, seasonal wardrobes, and accessories with verified direct Amazon links.
              </p>
              <p>
                Every outfit on our platform is curated to inspire your personal style. Clicking order links connects you immediately to the Amazon store for safe purchasing, verified reviews, and customer support.
              </p>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[#111111]">Contact Us</h3>
                <p className="text-xs text-gray-500">
                  Have questions about our platform or need support with product links? Send us a message below.
                </p>
              </div>

              {submitted ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded text-center space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-[#2563EB] mx-auto" />
                  <span className="font-bold text-sm text-[#111111] block">
                    Message Sent
                  </span>
                  <p className="text-xs text-gray-600">
                    Thank you for reaching out. We will respond to your inquiry shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitContact} className="space-y-3 max-w-lg">
                  <div>
                    <label className="block text-xs font-bold text-[#111111] mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded focus:border-[#2563EB] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#111111] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded focus:border-[#2563EB] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#111111] mb-1">
                      Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full p-3 text-xs bg-gray-50 border border-gray-300 rounded focus:border-[#2563EB] focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs rounded transition-colors cursor-pointer inline-flex items-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === 'affiliate' && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-[#111111]">Amazon Associates Disclosure</h3>
              <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-[#111111] space-y-1">
                <span className="font-bold text-[#E53935] block">Affiliate Statement:</span>
                <p>
                  "Elite Fabrics is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com."
                </p>
              </div>
              <p className="text-xs text-gray-600">
                When you click on outfit and clothing links on Elite Fabrics and complete a purchase on Amazon, we may earn an affiliate commission at no extra cost to you. Pricing and stock availability are determined by Amazon sellers.
              </p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-[#111111]">Privacy Policy</h3>
              <p className="text-xs text-gray-600">
                Elite Fabrics does not process payments or collect personal billing details. All financial transactions occur directly through Amazon's checkout systems. We only use essential cookies to maintain search preferences and improve website performance.
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-[#111111]">Terms of Service</h3>
              <p className="text-xs text-gray-600">
                By browsing Elite Fabrics, you acknowledge that all third-party product links redirect to external merchant platforms (such as Amazon). Elite Fabrics is not liable for merchant shipping times, product availability, or returns.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#111111] hover:bg-gray-800 text-white text-xs font-semibold rounded cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
