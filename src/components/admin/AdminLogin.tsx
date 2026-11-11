import React, { useState } from 'react';
import { Lock, Mail, ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';
import { AdminUser } from '../../types/product';

interface AdminLoginProps {
  onLoginSuccess: (user: AdminUser) => void;
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToStore }) => {
  const [email, setEmail] = useState('admin@elitefabrics.online');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed. Please check credentials.');
      }

      // Save token to localStorage for persistent session
      localStorage.setItem('elite_admin_token', data.token);
      localStorage.setItem('elite_admin_email', data.user.email);

      onLoginSuccess({
        email: data.user.email,
        token: data.token,
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button
          onClick={onBackToStore}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-600 hover:text-[#2563EB] mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Public Store</span>
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1.5">
            <span className="text-2xl font-extrabold tracking-tight text-[#111111]">
              Elite Fabrics
            </span>
            <span className="w-2 h-2 rounded-full bg-[#E53935]" />
          </div>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-[#111111]">
            Private Admin Dashboard
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Website Owner Authentication Portal
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 border border-gray-200 rounded-lg shadow-sm space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs text-[#E53935] rounded-md flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#111111] mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@elitefabrics.online"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md focus:border-[#2563EB] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#111111] mb-1">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md focus:border-[#2563EB] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-md transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          {/* Quick Setup Hint for the Owner */}
          <div className="pt-3 border-t border-gray-100 bg-gray-50 p-3 rounded text-[11px] text-gray-600 space-y-1">
            <div className="flex items-center space-x-1 font-semibold text-[#111111]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Owner Access Credentials:</span>
            </div>
            <p>Email: <code className="text-[#111111] font-mono">admin@elitefabrics.online</code></p>
            <p>Password: <code className="text-[#111111] font-mono">EliteAdmin2026!</code></p>
          </div>
        </div>
      </div>
    </div>
  );
};
