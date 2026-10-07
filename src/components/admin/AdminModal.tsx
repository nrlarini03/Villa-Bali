import React, { useState } from 'react';
import { useVilla } from '../../context/VillaContext';
import { AdminSpreadsheet } from './AdminSpreadsheet';
import { Lock, KeyRound, Eye, EyeOff, ShieldCheck, X, AlertCircle } from 'lucide-react';

export const AdminModal: React.FC = () => {
  const { isAdminModalOpen, setIsAdminModalOpen, isAdminAuthenticated, loginAdmin } = useVilla();
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isAdminModalOpen) return null;

  // If already authenticated, show the spreadsheet workspace
  if (isAdminAuthenticated) {
    return <AdminSpreadsheet onClose={() => setIsAdminModalOpen(false)} />;
  }

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!passwordInput.trim()) {
      setErrorMessage('Silakan masukkan kata sandi Anda.');
      return;
    }

    const success = loginAdmin(passwordInput.trim());
    if (success) {
      setPasswordInput('');
    } else {
      setErrorMessage('Kata sandi salah. Silakan periksa kembali atau gunakan password default: admin123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            setIsAdminModalOpen(false);
            setErrorMessage(null);
            setPasswordInput('');
          }}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with lock icon */}
        <div className="text-center space-y-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold text-white">
              Akses Database & Spreadsheet
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Akses dibatasi khusus pemilik usaha untuk mengubah nama villa, harga, kamar, fasilitas, dan nomor WhatsApp.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Kata Sandi / Password Pemilik</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan kata sandi..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                autoFocus
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
  
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-neutral-950 bg-amber-400 hover:bg-amber-300 active:scale-[0.99] rounded-xl shadow-md transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Masuk ke Database Spreadsheet</span>
          </button>
        </form>
      </div>
    </div>
  );
};
