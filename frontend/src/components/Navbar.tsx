import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Coins, Award, Sparkles } from 'lucide-react';
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
    { path: '/cinetica', label: '01. Cinética' },
    { path: '/maxwell', label: '02. Maxwell' },
    { path: '/dsc', label: '03. Calorimetria' },
    { path: '/exercicios', label: '04. Exercícios' },
    { path: '/loja', label: '05. Insígnias' },
    { path: '/ranking', label: '06. Ranking' },
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
    <header className="bg-surface border-b border-border sticky top-0 z-50 shadow-md">
      {/* Barra de Topo Acadêmica */}
      <div className="border-b border-border/80 px-4 sm:px-8 py-1.5 flex items-center justify-between text-xs font-mono text-slate-300">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-brand"></span>
          <span className="text-white font-bold tracking-wider">LAB QUÂNTICO</span>
          <span className="text-slate-500">•</span>
          <span className="hidden sm:inline text-slate-400">Universidade Tiradentes</span>
        </div>
        <div className="flex items-center space-x-4">
          {usuario && (
            <span className="text-slate-200">
              Aluno: <strong className="text-white font-bold">{usuario.nomeCompleto}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Navegação Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/dashboard" className="flex items-baseline space-x-2 group">
            <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white group-hover:text-brand transition-colors">
              Lab Quântico
            </span>
          </Link>

          {/* Links de Módulos */}
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`py-5 transition-colors border-b-2 font-semibold ${
                    isActive
                      ? 'border-brand text-brand'
                      : 'border-transparent text-slate-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* HUD do Estudante */}
          <div className="flex items-center space-x-4">
            {usuario ? (
              <>
                {/* Pontos / Moedas */}
                <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-surface-elevated border border-border-light rounded-lg text-xs font-mono">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span className="text-white font-bold">{usuario.pontos}</span>
                  <span className="text-slate-400 text-[10px]">pts</span>
                </div>

                {/* Nível e XP */}
                <div className="hidden sm:flex flex-col items-end text-xs font-mono">
                  <div className="flex items-center space-x-1 font-bold">
                    <span className="text-brand">Nível {nivel}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-white">{xp} XP</span>
                  </div>
                  <div className="w-24 bg-surface-highlight h-1.5 rounded-full overflow-hidden mt-1 border border-border">
                    <div
                      className="bg-brand h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressoPercent}%` }}
                    />
                  </div>
                </div>

                {/* Avatar e Perfil */}
                <Link
                  to="/perfil"
                  className="flex items-center space-x-2 p-1 rounded-lg hover:bg-surface-elevated transition"
                  title="Acessar meu perfil"
                >
                  <AvatarBadge avatarId={usuario.avatarId} size="sm" />
                </Link>

                {/* Sair */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-surface-elevated rounded-lg transition"
                  title="Sair da conta"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3 text-sm font-semibold">
                <Link to="/login" className="text-slate-300 hover:text-white">
                  Entrar
                </Link>
                <Link
                  to="/cadastro"
                  className="px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-lg transition shadow-md"
                >
                  Criar Conta
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Menu mobile secundário */}
      <div className="lg:hidden flex items-center space-x-3 px-4 py-2 bg-surface-elevated border-t border-border overflow-x-auto text-xs font-medium">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`whitespace-nowrap px-2.5 py-1 rounded-md ${
                isActive ? 'bg-brand text-white font-bold' : 'text-slate-300 hover:text-white'
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
