import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, pin);
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
            <span className="text-3xl text-amber-500">🔬</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">LAB HUB V2</h1>
          <p className="text-slate-400 mt-2 text-sm">Hệ thống quản lý thiết bị</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              placeholder="ten.gv@labhub.edu.vn"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Mã PIN</label>
            <input
              type="password"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 text-center tracking-[0.5em] text-lg font-mono"
              placeholder="••••••"
              value={pin}
              onChange={e => setPin(e.target.value)}
              disabled={loading}
              maxLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email || !pin}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                Đang xử lý...
              </>
            ) : (
              'Đăng Nhập'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
