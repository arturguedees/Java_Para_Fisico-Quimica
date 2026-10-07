import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Coins, FlaskConical, Trophy, Flame, Sparkles } from 'lucide-react';
import AvatarBadge from './AvatarBadge';

interface NavbarProps {
  usuario: any;
  onLogout?: () => void;
}

export default function Navbar({ usuario, onLogout }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('usuario');
      navigate('/login');
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Início' },
    { path: '/cinetica', label: 'Cinética' },
    { path: '/maxwell', label: 'Maxwell' },
    { path: '/dsc', label: 'Calorimetria' },
    { path: '/exercicios', label: 'Questões & Quiz' },
    { path: '/loja', label: 'Insígnias' },
    { path: '/ranking', label: 'Ranking' },
  ];

  const xp = usuario?.experiencia || 0;
  let nivel = 1;
  let xpBase = 0;
  let xpProximo = 100;

  if (xp < 100) { nivel = 1; xpBase = 0; xpProximo = 100; }
  else if (xp < 300) { nivel = 2; xpBase = 100; xpProximo = 300; }
  else if (xp < 600) { nivel = 3; xpBase = 300; xpProximo = 600; }
  else if (xp < 1000) { nivel = 4; xpBase = 600; xpProximo = 1000; }
  else if (xp < 1500) { nivel = 5; xpBase = 1000; xpProximo = 1500; }
  else if (xp < 2500) { nivel = 6; xpBase = 1500; xpProximo = 2500; }
  else { nivel = 7; xpBase = 2500; xpProximo = 5000; }

  const progressoPercent = Math.min(100, Math.max(0, ((xp - xpBase) / (xpProximo - xpBase)) * 100));

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-50 shadow-sm transition-all">
      {/* Faixa Superior com Micro-Detalhes */}
      <div className="bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 border-b border-slate-200/60 px-4 sm:px-8 py-1.5 flex items-center justify-between text-xs text-slate-500 font-medium">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
          </span>
          <span className="text-slate-800 font-bold tracking-wide">LAB QUÂNTICO</span>
          <span className="text-slate-300">•</span>
          <span className="hidden sm:inline text-slate-500">Universidade Tiradentes</span>
        </div>
        <div className="flex items-center space-x-4">
          {usuario && (
            <div className="flex items-center space-x-1.5 text-slate-600">
              <span className="hidden sm:inline">Estudante:</span>
              <strong className="text-slate-900 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                {usuario.nomeCompleto}
              </strong>
            </div>
          )}
        </div>
      </div>

      {/* Barra de Navegação Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo e Nome */}
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 group-hover:shadow-indigo-500/35 transition-all duration-300">
              <FlaskConical className="w-5 h-5 transition-transform group-hover:rotate-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors block leading-tight">
                Lab Quântico
              </span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                Físico-Química Interativa
              </span>
            </div>
          </Link>

          {/* Links Centrais de Navegação */}
          <nav className="hidden lg:flex items-center space-x-1 text-sm font-semibold">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3.5 py-2 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-200/60 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 hover:-translate-y-0.5'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Indicadores de Gamificação e Perfil */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {usuario ? (
              <>
                {/* Saldo de Moedas/Pontos Animado */}
                <div 
                  className="group flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-xl text-xs font-bold text-amber-800 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 cursor-default"
                  title="Moedas ganhas ao responder exercícios"
                >
                  <Coins className="w-4 h-4 text-amber-500 fill-amber-500 group-hover:rotate-12 transition-transform" />
                  <span className="font-mono text-sm">{usuario.pontos}</span>
                  <span className="text-amber-600/80 text-[10px] font-medium">pts</span>
                </div>

                {/* Barra de Progresso de XP Dinâmica */}
                <div className="hidden sm:flex flex-col items-end text-xs">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-700">
                    <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/50">
                      Nv. {nivel}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono text-slate-800">{xp} XP</span>
                  </div>
                  <div className="w-28 bg-slate-200/80 h-2 rounded-full overflow-hidden mt-1 relative">
                    <div
                      className="bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500 ease-out shadow-sm"
                      style={{ width: `${progressoPercent}%` }}
                    />
                  </div>
                </div>

                {/* Avatar e Perfil */}
                <Link
                  to="/perfil"
                  className="flex items-center p-0.5 rounded-xl hover:ring-2 hover:ring-indigo-400 hover:scale-105 transition-all duration-200"
                  title="Meu Perfil"
                >
                  <AvatarBadge avatarId={usuario.avatarId} size="sm" />
                </Link>

                {/* Sair */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition duration-150"
                  title="Sair da conta"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3 text-sm font-semibold">
                <Link to="/login" className="text-slate-600 hover:text-slate-900 px-3 py-1.5">
                  Entrar
                </Link>
                <Link
                  to="/cadastro"
                  className="btn-quantum-primary px-4 py-2 rounded-xl text-sm font-semibold"
                >
                  Criar Conta
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Menu Mobile Horizontal com Scroll */}
      <div className="lg:hidden flex items-center space-x-1.5 px-4 py-2.5 bg-slate-50/90 border-t border-slate-200/80 overflow-x-auto text-xs font-semibold">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
