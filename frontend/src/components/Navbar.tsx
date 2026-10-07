import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FlaskConical, 
  Wind, 
  Flame, 
  BrainCircuit, 
  ShoppingBag, 
  Trophy, 
  LogOut, 
  Coins, 
  Award,
  User as UserIcon
} from 'lucide-react';
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
    { path: '/dashboard', label: 'Início', icon: FlaskConical },
    { path: '/cinetica', label: 'Cinética', icon: FlaskConical },
    { path: '/maxwell', label: 'Maxwell', icon: Wind },
    { path: '/dsc', label: 'Calorimetria', icon: Flame },
    { path: '/exercicios', label: 'Desafios & Quiz', icon: BrainCircuit },
    { path: '/loja', label: 'Loja de Avatares', icon: ShoppingBag },
    { path: '/ranking', label: 'Ranking', icon: Trophy },
  ];

  // Cálculo de nível: Cada nível requer 100 * nivel XP
  const xp = usuario?.experiencia || 0;
  let nivel = 1;
  let xpBase = 0;
  let xpNecessario = 100;

  if (xp < 100) {
    nivel = 1;
    xpBase = 0;
    xpNecessario = 100;
  } else if (xp < 300) {
    nivel = 2;
    xpBase = 100;
    xpNecessario = 200;
  } else if (xp < 600) {
    nivel = 3;
    xpBase = 300;
    xpNecessario = 300;
  } else if (xp < 1000) {
    nivel = 4;
    xpBase = 600;
    xpNecessario = 400;
  } else if (xp < 1500) {
    nivel = 5;
    xpBase = 1000;
    xpNecessario = 500;
  } else if (xp < 2500) {
    nivel = 6;
    xpBase = 1500;
    xpNecessario = 1000;
  } else {
    nivel = 7;
    xpBase = 2500;
    xpNecessario = 2000;
  }

  const progressoNivel = Math.min(
    100,
    Math.max(0, ((xp - xpBase) / xpNecessario) * 100)
  );

  return (
    <nav className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Marca */}
          <div className="flex items-center space-x-3">
            <Link to="/dashboard" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-lg font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  QuantumChem
                </span>
                <span className="block text-[10px] font-semibold text-slate-400 -mt-1 tracking-wider uppercase">
                  Lab & Gamificação
                </span>
              </div>
            </Link>
          </div>

          {/* Links Centrais de Navegação */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* HUD de Jogador / Usuário */}
          <div className="flex items-center space-x-4">
            {usuario ? (
              <>
                {/* Carteira de Moedas / Pontos */}
                <div className="flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full">
                  <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="text-xs font-bold text-amber-300">
                    {usuario.pontos} <span className="text-[10px] font-normal text-amber-400/80">pts</span>
                  </span>
                </div>

                {/* Nível & Barra de XP */}
                <div className="hidden sm:flex flex-col items-end min-w-[100px]">
                  <div className="flex items-center space-x-1 text-[11px] font-bold text-slate-300">
                    <span className="text-cyan-400">Nv. {nivel}</span>
                    <span className="text-slate-500">•</span>
                    <span>{xp} XP</span>
                  </div>
                  <div className="w-24 bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden border border-slate-700">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressoNivel}%` }}
                    />
                  </div>
                </div>

                {/* Perfil & Avatar Animado */}
                <Link
                  to="/perfil"
                  className="flex items-center space-x-2.5 pl-2 border-l border-slate-800 hover:opacity-90 transition group"
                  title="Ver Perfil e Inventário"
                >
                  <AvatarBadge avatarId={usuario.avatarId} size="sm" />
                  <div className="hidden md:block text-left">
                    <span className="block text-xs font-bold text-slate-100 group-hover:text-cyan-400 transition truncate max-w-[120px]">
                      {usuario.nomeCompleto}
                    </span>
                    <span className="block text-[10px] text-cyan-400/80 font-medium truncate max-w-[120px]">
                      {usuario.titulo}
                    </span>
                  </div>
                </Link>

                {/* Botão Sair */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/80 rounded-lg transition"
                  title="Encerrar Sessão"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Entrar
                </Link>
                <Link
                  to="/cadastro"
                  className="px-3 py-1.5 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg shadow-sm"
                >
                  Criar Conta
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Menu mobile secundário */}
      <div className="lg:hidden flex items-center justify-around py-2 px-2 bg-slate-950/80 border-t border-slate-800 overflow-x-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`px-2 py-1 rounded text-[11px] font-medium flex flex-col items-center space-y-0.5 whitespace-nowrap ${
                isActive ? 'text-cyan-400' : 'text-slate-400'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
