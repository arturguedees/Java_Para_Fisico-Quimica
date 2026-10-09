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
    <header className="bg-white border-b-4 border-dark sticky top-0 z-50 transition-all">
      {/* Barra de Navegação Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between gap-4 xl:gap-6 h-20">
          
          {/* Logo e Nome */}
          <Link to="/dashboard" className="flex items-center space-x-3 group shrink-0">
            <div className="w-12 h-12 bg-white border-4 border-dark flex items-center justify-center p-1 shadow-neo group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none transition-all duration-200">
              <img src="/logo.png" alt="Lab Quântico" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-dark uppercase font-display leading-none">
                Lab Quântico
              </span>
              <span className="text-[10px] text-dark font-bold uppercase tracking-widest block mt-0.5">
                Físico-Química
              </span>
            </div>
          </Link>

          {/* Links Centrais de Navegação */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs xl:text-sm font-bold font-display">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-2.5 xl:px-4 py-2 xl:py-2.5 border-2 xl:border-4 transition-all duration-200 uppercase tracking-wide hover:-translate-y-1 ${
                    isActive
                      ? 'bg-brand border-dark shadow-neo'
                      : 'bg-white border-transparent text-dark hover:border-dark hover:shadow-neo-sm'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Indicadores de Gamificação e Perfil com Espaçamento Garantido */}
          <div className="flex items-center space-x-3 sm:space-x-4 shrink-0 pl-3 sm:pl-5 border-l-2 border-dark/20">
            {usuario ? (
              <>
                {/* Saldo de Moedas/Pontos Animado */}
                <div 
                  className="group flex items-center space-x-1.5 px-3 py-1.5 bg-yellow-300 border-[3px] border-dark text-xs font-black text-dark shadow-neo-sm hover:shadow-neo hover:-translate-y-1 transition-all duration-300 cursor-default"
                  title="Moedas ganhas ao responder exercícios"
                >
                  <Coins className="w-5 h-5 text-dark fill-dark group-hover:rotate-12 group-hover:scale-110 transition-transform stroke-[2]" />
                  <span className="font-mono text-base">{usuario.pontos}</span>
                  <span className="text-dark/80 text-[10px] uppercase tracking-widest">pts</span>
                </div>

                {/* Perfil Button */}
                <Link
                  to="/perfil"
                  className="group flex items-center space-x-3 px-3 py-2 bg-white border-4 border-dark hover:bg-brand hover:-translate-y-1 hover:shadow-neo transition-all duration-300"
                  title="Meu Perfil"
                >
                  <AvatarBadge avatarId={usuario.avatarId} size="sm" />
                  <div className="hidden sm:block text-left">
                    <span className="block text-xs font-black text-dark uppercase tracking-widest">{usuario.nomeCompleto.split(' ')[0]}</span>
                    <span className="block text-[10px] font-bold text-dark/70 uppercase tracking-widest">NV. {nivel} • {xp} XP</span>
                  </div>
                </Link>

                {/* Sair */}
                <button
                  onClick={handleLogout}
                  className="p-3 text-dark bg-white hover:text-white hover:bg-dark border-4 border-dark hover:shadow-neo hover:-translate-y-1 transition-all duration-300"
                  title="Sair da conta"
                >
                  <LogOut className="w-5 h-5 stroke-[2.5]" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3 text-sm font-black font-display uppercase tracking-widest">
                <Link to="/login" className="text-dark hover:-translate-y-1 transition-transform px-3 py-1.5">
                  Entrar
                </Link>
                <Link
                  to="/cadastro"
                  className="btn-quantum-primary px-6 py-3 text-sm hover:-translate-y-1 transition-transform"
                >
                  Criar Conta
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Menu Mobile Horizontal com Scroll */}
      <div className="lg:hidden flex items-center space-x-1.5 px-4 py-2.5 bg-stone-50/90 border-t border-stone-200/80 overflow-x-auto text-xs font-semibold">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-brand text-white font-bold shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
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
