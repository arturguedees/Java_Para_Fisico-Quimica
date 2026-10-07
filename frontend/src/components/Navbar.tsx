import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Coins, FlaskConical, Trophy, Flame } from 'lucide-react';
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
    { path: '/exercicios', label: 'Exercícios & Quiz' },
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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      {/* Faixa Superior Institucional */}
      <div className="bg-slate-50 border-b border-slate-200/80 px-4 sm:px-8 py-1.5 flex items-center justify-between text-xs text-slate-500 font-medium">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          <span className="text-slate-800 font-bold tracking-wide">LAB QUÂNTICO</span>
          <span className="text-slate-300">•</span>
          <span className="hidden sm:inline text-slate-500">Universidade Tiradentes</span>
        </div>
        <div className="flex items-center space-x-4">
          {usuario && (
            <span className="text-slate-600">
              Estudante: <strong className="text-slate-900 font-semibold">{usuario.nomeCompleto}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Barra de Navegação Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo e Nome */}
          <Link to="/dashboard" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition">
              <FlaskConical className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              Lab Quântico
            </span>
          </Link>

          {/* Links Centrais de Navegação */}
          <nav className="hidden lg:flex items-center space-x-1 text-sm font-medium">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3.5 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                {/* Saldo de Moedas/Pontos */}
                <div 
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200/80 rounded-lg text-xs font-semibold text-amber-800 shadow-sm"
                  title="Seus pontos acumulados"
                >
                  <Coins className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>{usuario.pontos}</span>
                  <span className="text-amber-600 text-[11px] font-normal">pts</span>
                </div>

                {/* Barra de Progresso de XP */}
                <div className="hidden sm:flex flex-col items-end text-xs">
                  <div className="flex items-center space-x-1.5 font-semibold text-slate-700">
                    <span className="text-blue-600 font-bold">Nível {nivel}</span>
                    <span className="text-slate-300">•</span>
                    <span>{xp} XP</span>
                  </div>
                  <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden mt-1 border border-slate-200">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressoPercent}%` }}
                    />
                  </div>
                </div>

                {/* Avatar e Perfil */}
                <Link
                  to="/perfil"
                  className="flex items-center p-0.5 rounded-lg hover:ring-2 hover:ring-blue-400 transition"
                  title="Meu Perfil"
                >
                  <AvatarBadge avatarId={usuario.avatarId} size="sm" />
                </Link>

                {/* Sair */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm font-medium"
                >
                  Criar Conta
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Menu Mobile Horizontal com Scroll */}
      <div className="lg:hidden flex items-center space-x-1 px-4 py-2 bg-slate-50 border-t border-slate-200 overflow-x-auto text-xs font-medium">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg transition ${
                isActive ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
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
