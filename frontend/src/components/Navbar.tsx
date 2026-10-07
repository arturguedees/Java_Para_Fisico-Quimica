import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
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
    { path: '/dashboard', label: 'Visão Geral' },
    { path: '/cinetica', label: '01. Cinética' },
    { path: '/maxwell', label: '02. Maxwell' },
    { path: '/dsc', label: '03. Calorimetria' },
    { path: '/exercicios', label: '04. Desafios' },
    { path: '/loja', label: '05. Insígnias' },
    { path: '/ranking', label: '06. Tábua de Honra' },
  ];

  const xp = usuario?.experiencia || 0;
  let nivel = 1;
  if (xp < 100) nivel = 1;
  else if (xp < 300) nivel = 2;
  else if (xp < 600) nivel = 3;
  else if (xp < 1000) nivel = 4;
  else if (xp < 1500) nivel = 5;
  else if (xp < 2500) nivel = 6;
  else nivel = 7;

  return (
    <header className="bg-[#0e1013] border-b border-[#1d2027] sticky top-0 z-50">
      {/* Barra de Topo Editorial */}
      <div className="border-b border-[#1d2027] px-4 sm:px-8 py-1.5 flex items-center justify-between text-[11px] font-mono tracking-wider text-[#918b7e] uppercase">
        <div className="flex items-center space-x-3">
          <span className="text-[#c85a32] font-semibold">● LAB QUÂNTICO</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="hidden md:inline">EDIÇÃO ACADÊMICA 2026</span>
          {usuario && (
            <span className="text-[#e5e2dc]">
              PESQUISADOR: <strong className="text-[#c85a32]">{usuario.nomeCompleto}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Navegação Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Tipográfico Editorial */}
          <Link to="/dashboard" className="flex items-baseline space-x-2 group">
            <span className="font-serif text-2xl font-normal tracking-tight text-[#f5f2eb] group-hover:text-[#c85a32] transition-colors">
              Lab Quântico
            </span>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#918b7e]">
              v2.0
            </span>
          </Link>

          {/* Links de Módulos */}
          <nav className="hidden lg:flex items-center space-x-6 text-xs font-mono tracking-wider">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`py-5 transition-colors border-b-2 ${
                    isActive
                      ? 'border-[#c85a32] text-[#f5f2eb] font-semibold'
                      : 'border-transparent text-[#918b7e] hover:text-[#e5e2dc]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Dados do Pesquisador (Status) */}
          <div className="flex items-center space-x-5">
            {usuario ? (
              <>
                {/* Saldo de Moedas & Nível */}
                <div className="hidden sm:flex items-center space-x-3 text-xs font-mono">
                  <div className="px-2.5 py-1 bg-[#14161b] border border-[#1d2027] text-[#c85a32] font-semibold">
                    {usuario.pontos} <span className="text-[10px] text-[#918b7e]">PTS</span>
                  </div>
                  <div className="px-2.5 py-1 bg-[#14161b] border border-[#1d2027] text-[#e5e2dc]">
                    NV. {nivel} <span className="text-[10px] text-[#918b7e]">({xp} XP)</span>
                  </div>
                </div>

                {/* Insígnia e Perfil */}
                <Link
                  to="/perfil"
                  className="flex items-center space-x-2.5 hover:opacity-80 transition"
                  title="Acessar Dossier do Pesquisador"
                >
                  <AvatarBadge avatarId={usuario.avatarId} size="sm" />
                  <span className="hidden xl:inline text-xs font-serif italic text-[#c5bfb4] max-w-[120px] truncate">
                    {usuario.titulo}
                  </span>
                </Link>

                {/* Sair */}
                <button
                  onClick={handleLogout}
                  className="text-[#918b7e] hover:text-[#c85a32] transition p-1"
                  title="Desconectar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3 text-xs font-mono">
                <Link to="/login" className="text-[#918b7e] hover:text-[#e5e2dc]">
                  ENTRAR
                </Link>
                <Link
                  to="/cadastro"
                  className="px-3 py-1.5 bg-[#c85a32] hover:bg-[#a74521] text-[#faf9f5] font-semibold tracking-wider uppercase transition"
                >
                  REGISTRAR
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Menu mobile secundário */}
      <div className="lg:hidden flex items-center space-x-4 px-4 py-2 bg-[#14161b] border-t border-[#1d2027] overflow-x-auto text-xs font-mono">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`whitespace-nowrap ${
                isActive ? 'text-[#c85a32] font-semibold' : 'text-[#918b7e]'
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
