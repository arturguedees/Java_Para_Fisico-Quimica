import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FlaskConical, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between p-6 sm:p-12 font-sans">
      
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 pb-4 text-xs font-semibold text-slate-500">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <FlaskConical className="w-3.5 h-3.5" />
          </div>
          <span className="text-slate-900 font-bold tracking-tight">LAB QUÂNTICO</span>
        </div>
        <span>UNIVERSIDADE TIRADENTES</span>
      </header>

      {/* Caixa de Acesso */}
      <main className="max-w-md w-full mx-auto my-12 bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 space-y-6 shadow-sm">
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <FlaskConical className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Lab Quântico
          </h1>
          <p className="text-sm text-slate-600 max-w-xs mx-auto leading-relaxed">
            Plataforma de estudos práticos e exercícios em Físico-Química.
          </p>
        </div>

        {erro && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">Email Institucional ou Pessoal</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                placeholder="seu@email.com"
                required 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">Senha de Acesso</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input 
                type="password" 
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                placeholder="••••••••"
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={carregando}
            className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-sm disabled:opacity-50 flex items-center justify-center space-x-2 text-sm"
          >
            <span>{carregando ? 'Entrando...' : 'Entrar na Plataforma'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Ainda não tem conta?{' '}
          <Link to="/cadastro" className="text-blue-600 hover:text-blue-700 font-bold">
            Cadastre-se gratuitamente
          </Link>
        </div>
      </main>

      {/* Rodapé */}
      <footer className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <span>Projeto de Programação • Físico-Química</span>
        <span>Universidade Tiradentes</span>
      </footer>

    </div>
  );
}
