
import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Mail, Lock, UserPlus } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate username login using a virtual domain
    const email = `${username.trim().toLowerCase().replace(/\s+/g, '')}@stocky.app`;

    try {
      if (isRegistering) {
        if (password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres');
          setLoading(false);
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error("Auth Error Details:", err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Acción requerida: Debes habilitar "Correo electrónico/contraseña" en la pestaña "Sign-in method" de tu consola Firebase.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este usuario ya está en uso. Intenta con otro.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Usuario o contraseña incorrectos.');
      } else {
        setError(`Error: ${err.message || 'Mala conexión o error interno'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A2E] flex flex-col items-center justify-center p-6 text-white font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 mb-6 rotate-12 transition-transform hover:rotate-0">
            <span className="text-3xl font-black -rotate-12 italic">S</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase">STOCKY</h1>
          <p className="text-indigo-400/70 text-[10px] font-bold uppercase tracking-[0.3em] -mt-1">S Professional USA</p>
        </div>

        <div className="bg-[#24243E]/50 border border-indigo-900/30 p-8 rounded-[32px] backdrop-blur-xl">
          <AnimatePresence mode="wait">
            <motion.h2 
              key={isRegistering ? 'reg' : 'log'}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xl font-bold mb-6 text-center text-gray-200"
            >
              {isRegistering ? 'Crear Usuario' : 'Ingresar'}
            </motion.h2>
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-red-400 text-xs font-bold text-center"
              >
                {error}
              </motion.div>
            )}

            <div className="relative">
              <LogIn className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Nombre de Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-indigo-900/20 border-none py-3.5 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-indigo-600/50 focus:outline-none transition-all text-sm font-medium placeholder:text-gray-600"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-indigo-900/20 border-none py-3.5 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-indigo-600/50 focus:outline-none transition-all text-sm font-medium placeholder:text-gray-600"
                required
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isRegistering ? <UserPlus size={18} /> : <LogIn size={18} />}
                  <span className="uppercase tracking-widest text-xs font-black">
                    {isRegistering ? 'Registrar' : 'Entrar'}
                  </span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center space-y-3">
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors"
            >
              {isRegistering ? 'Tengo cuenta · Login' : '¿Nuevo aquí? · Registrarse'}
            </button>
          </div>
        </div>

        <p className="text-center text-gray-600 text-[10px] mt-12 tracking-[0.3em] font-bold uppercase italic">
          Simplemente Diferente
        </p>
      </motion.div>
    </div>
  );
};
