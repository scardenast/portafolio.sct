
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthProvider';
import { Navigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/private/admin');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (user) {
    return <Navigate to="/private/admin" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white pt-20">
      <div className="w-full max-w-md p-8 space-y-8 bg-[#0c0c0c] rounded-lg border border-gray-900">
        <h1 className="text-3xl font-bold text-center">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="text-sm font-bold text-gray-400">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 mt-2 bg-black border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#39f8b1]"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-bold text-gray-400">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 mt-2 bg-black border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#39f8b1]"
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 font-bold text-black bg-[#39f8b1] rounded-md hover:bg-white transition-colors duration-300 disabled:bg-gray-600"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;