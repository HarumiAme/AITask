import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    if (!isLongEnough) return 'La contraseña debe tener al menos 8 caracteres';
    if (!hasUpperCase) return 'La contraseña debe contener al menos una mayúscula';
    if (!hasNumber) return 'La contraseña debe contener al menos un número';
    if (!hasSpecialChar) return 'La contraseña debe contener al menos un carácter especial';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      setError('');
      setLoading(true);
      await register(email, password, name);
    } catch (error: any) {
      setError(
        error.message.includes('auth/email-already-in-use')
          ? 'Este email ya está registrado'
          : 'Error al crear la cuenta'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center px-6">
      <Link to="/" className="flex items-center space-x-2 mb-8">
        <BrainCircuit className="w-8 h-8 text-blue-400" />
        <span className="text-xl font-bold text-white">TaskAI</span>
      </Link>

      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
          Crea tu cuenta
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Nombre de usuario
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
            <ul className="mt-2 text-xs text-slate-600 space-y-1">
              <li className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-600' : ''}`}>
                • Mínimo 8 caracteres
              </li>
              <li className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-green-600' : ''}`}>
                • Al menos una mayúscula
              </li>
              <li className={`flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-green-600' : ''}`}>
                • Al menos un número
              </li>
              <li className={`flex items-center gap-1 ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : ''}`}>
                • Al menos un carácter especial (!@#$%^&*(),.?":{}|&lt;&gt;)
              </li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus className="w-5 h-5" />
            <span>{loading ? 'Creando cuenta...' : 'Crear cuenta'}</span>
          </button>
        </form>

        <p className="mt-6 text-center text-slate-600">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="text-blue-500 hover:text-blue-600">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;