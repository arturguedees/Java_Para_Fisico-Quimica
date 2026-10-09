import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Coins } from 'lucide-react';
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
    { path: '/exercicios', label: 'Questões' },
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

  return (
    <header className="bg-white border-b-4 border-dark sticky top-0 z-50 transition-all">
      {/* Barra de Navegação Principal com Margens Proporcionais */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        <div className="flex items-center justify-between gap-6 h-20">
          
          {/* Logo e Nome */}
          <Link to="/dashboard" className="flex items-center space-x-3 group shrink-0">
            <div className="w-11 h-11 bg-white border-3 border-dark rounded-xl flex items-center justify-center p-1 shadow-neo-sm group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none transition-all duration-200">
              <img src="/logo.png" alt="Lab Quântico" className="w-full h-full object-contain" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-black tracking-tight text-dark uppercase font-display leading-none block">
                Lab Quântico
              </span>
              <span className="text-[10px] text-dark/70 font-black uppercase tracking-widest block mt-0.5">
                Físico-Química
              </span>
            </div>
          </Link>

          {/* Links Centrais de Navegação com Hierarquia Limpa e Harmônica */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2 text-xs xl:text-sm font-bold font-display">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-1.5 rounded-xl uppercase tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'bg-brand text-dark font-black border-2 border-dark shadow-neo-sm -translate-y-0.5'
                      : 'text-dark/75 hover:text-dark hover:bg-slate-100 font-bold border-2 border-transparent hover:border-dark/20'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Indicadores de Gamificação e Perfil Proporcionais */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 pl-4 border-l-2 border-dark/15">
            {usuario ? (
              <>
                {/* Saldo de Moedas/Pontos */}
                <div 
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-yellow-300 border-2 border-dark rounded-xl text-xs font-black text-dark shadow-neo-sm hover:shadow-neo hover:-translate-y-0.5 transition-all duration-200 cursor-default"
                  title="Moedas ganhas ao responder exercícios"
                >
                  <Coins className="w-4 h-4 text-dark fill-dark stroke-[2]" />
                  <span className="font-mono text-sm">{usuario.pontos}</span>
                  <span className="text-dark/70 text-[10px] uppercase font-bold tracking-wider">pts</span>
                </div>

                {/* Botão de Perfil */}
                <Link
                  to="/perfil"
                  className="flex items-center space-x-2.5 px-3 py-1.5 bg-white border-2 border-dark rounded-xl hover:bg-brand hover:-translate-y-0.5 hover:shadow-neo shadow-neo-sm transition-all duration-200"
                  title="Meu Perfil"
                >
                  <AvatarBadge avatarId={usuario.avatarId} size="sm" />
                  <div className="hidden xl:block text-left">
                    <span className="block text-xs font-black text-dark uppercase tracking-wider leading-tight">
                      {usuario.nomeCompleto.split(' ')[0]}
                    </span>
                    <span className="block text-[9px] font-bold text-dark/70 uppercase tracking-widest leading-none">
                      NV. {nivel} • {xp} XP
                    </span>
                  </div>
                </Link>

                {/* Botão Sair */}
                <button
                  onClick={handleLogout}
                  className="w-10 h-10 flex items-center justify-center text-dark bg-white hover:text-white hover:bg-dark border-2 border-dark rounded-xl shadow-neo-sm hover:shadow-neo hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                  title="Sair da conta"
                >
                  <LogOut className="w-4 h-4 stroke-[2.5]" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3 text-xs font-black font-display uppercase tracking-widest">
                <Link to="/login" className="text-dark hover:-translate-y-0.5 transition-transform px-3 py-1.5">
                  Entrar
                </Link>
                <Link
                  to="/cadastro"
                  className="btn-quantum-primary px-5 py-2.5 rounded-xl text-xs hover:-translate-y-0.5 transition-transform shadow-neo-sm"
                >
                  Criar Conta
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Menu Mobile Horizontal com Scroll */}
      <div className="lg:hidden flex items-center space-x-2 px-4 py-2.5 bg-slate-50 border-t-2 border-dark/15 overflow-x-auto text-xs font-bold">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`whitespace-nowrap px-3 py-1.5 rounded-xl border-2 transition-all ${
                isActive
                  ? 'bg-brand text-dark border-dark font-black shadow-neo-sm'
                  : 'bg-white text-dark/80 border-dark/20 hover:border-dark'
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
