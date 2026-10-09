import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FlaskConical, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const response = await axios.post('http://localhost:8080/api/usuarios/login', { email, senha });
      localStorage.setItem('usuario', JSON.stringify(response.data));
      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'ERR_NETWORK') {
        setErro('Servidor Java ou Banco de Dados offline. Certifique-se de que o backend esteja rodando.');
      } else if (err.response && err.response.data) {
        setErro(typeof err.response.data === 'string' ? err.response.data : 'Email ou senha inválidos.');
      } else {
        setErro('Email ou senha inválidos.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen text-stone-800 flex flex-col justify-between p-6 sm:p-12 font-sans">
      
      {/* Header */}
      <header className="flex items-center justify-between border-b border-stone-200/80 pb-4 text-xs font-bold text-stone-500">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand via-brand-500 to-emerald-500 flex items-center justify-center text-white shadow-xs">
            <FlaskConical className="w-4 h-4" />
          </div>
          <span className="text-stone-900 font-extrabold tracking-tight text-sm font-serif">LAB QUÂNTICO</span>
        </div>
        <span className="text-stone-400">UNIVERSIDADE TIRADENTES</span>
      </header>

      {/* Caixa de Acesso */}
      <main className="max-w-md w-full mx-auto my-12 quantum-card rounded-3xl p-8 sm:p-10 space-y-6 shadow-card hover:shadow-card-hover transition-all">
        <div className="space-y-2 text-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-brand via-brand-500 to-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-brand-500/25 hover:rotate-6 transition-transform">
            <FlaskConical className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-serif">
            Lab Quântico
          </h1>
          <p className="text-sm text-stone-600 max-w-xs mx-auto leading-relaxed">
            Plataforma de estudos práticos e exercícios em Físico-Química.
          </p>
        </div>

        {erro && (
          <div className="p-3.5 bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-slide-up">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block">Email Institucional ou Pessoal</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition shadow-xs"
                placeholder="seu@email.com"
                required 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block">Senha de Acesso</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input 
                type="password" 
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition shadow-xs"
                placeholder="••••••••"
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={carregando}
            className="btn-quantum-primary w-full mt-2 py-3.5 rounded-xl font-bold transition shadow-md disabled:opacity-50 flex items-center justify-center space-x-2 text-sm"
          >
            <span>{carregando ? 'Entrando...' : 'Entrar na Plataforma'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-stone-100 text-center text-xs text-stone-500">
          Ainda não tem conta?{' '}
          <Link to="/cadastro" className="text-brand hover:text-brand-hover font-extrabold hover:underline">
            Cadastre-se gratuitamente
          </Link>
        </div>
      </main>

      {/* Rodapé */}
      <footer className="border-t border-stone-200/80 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 font-medium">
        <span>Projeto de Programação • Físico-Química</span>
        <span>Universidade Tiradentes</span>
      </footer>

    </div>
  );
}
