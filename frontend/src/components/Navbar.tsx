import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Coins } from 'lucide-react';
import AvatarBadge from './AvatarBadge';
import { LanguageSelector, useI18n } from '../i18n/i18n';

interface NavbarProps {
  usuario: any;
  onLogout?: () => void;
}

/**
 * Barra de navegacao principal do Lab Quantico.
 * Adicionei aqui o seletor de idioma (LanguageSelector) com as bandeiras dos EUA e do Brasil,
 * deixando o Ingles como default como o professor pediu!
 */
export default function Navbar({ usuario, onLogout }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isEn } = useI18n();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('usuario');
      navigate('/login');
    }
  };

  // Links do menu traduzidos automaticamente entre Ingles e Portugues
  const navItems = [
    { path: '/dashboard', label: isEn ? 'Home' : 'Início', aliases: ['/dashboard'] },
    {
      path: '/formulas',
      label: isEn ? 'Formulas' : 'Fórmulas',
      aliases: ['/formulas', '/cinetica', '/maxwell', '/dsc'],
    },
    { path: '/exercicios', label: isEn ? 'Exercises' : 'Questões', aliases: ['/exercicios'] },
    { path: '/loja', label: isEn ? 'Badges' : 'Insígnias', aliases: ['/loja'] },
    { path: '/ranking', label: isEn ? 'Leaderboard' : 'Ranking', aliases: ['/ranking'] },
  ];

  // Calculo do nivel do estudante com base no XP acumulado
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
    <header className="bg-white border-b-4 border-dark sticky top-0 z-50 transition-all">
      {/* Container centralizado da Navbar */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        <div className="flex items-center justify-between gap-4 h-20">
          
          {/* Logo e Nome do Sistema */}
          <Link to="/dashboard" className="flex items-center space-x-3 group shrink-0">
            <div className="w-11 h-11 bg-white border-3 border-dark rounded-xl flex items-center justify-center p-1 shadow-neo-sm group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none transition-all duration-200">
              <img
                src="/logo.png"
                alt={isEn ? 'Quantum Lab' : 'Lab Quântico'}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-black tracking-tight text-dark uppercase font-display leading-none block">
                {isEn ? 'Quantum Lab' : 'Lab Quântico'}
              </span>
              <span className="text-[10px] text-dark/70 font-black uppercase tracking-widest block mt-0.5">
                {isEn ? 'Physical Chemistry' : 'Físico-Química'}
              </span>
            </div>
          </Link>

          {/* Links Centrais de Navegacao */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2 text-xs xl:text-sm font-bold font-display">
            {navItems.map(item => {
              const isActive = item.aliases.includes(location.pathname);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-1.5 rounded-xl uppercase tracking-wide transition-all duration-150 cursor-pointer select-none active:scale-95 active:translate-y-1 active:shadow-none ${
                    isActive
                      ? 'bg-brand text-dark font-black border-2 border-dark shadow-neo-sm -translate-y-0.5'
                      : 'text-dark/75 hover:text-dark hover:bg-slate-100 font-bold border-2 border-transparent hover:border-dark hover:shadow-neo-sm hover:-translate-y-0.5'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Seletor de Idioma (EUA / Brasil), Moedas com Tooltip e Perfil */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 pl-3 border-l-2 border-dark/15">
            {/* Seletor de Idiomas com Bandeiras SVG dos EUA (English) e Brasil (Portugues) */}
            <LanguageSelector compact />

            {usuario ? (
              <>
                {/* Saldo de Moedas/Pontos com Tooltip Interativo Explicando Como Ganhar e Gastar */}
                <div className="relative group">
                  <div 
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-yellow-300 border-2 border-dark rounded-xl text-xs font-black text-dark shadow-neo-sm hover:shadow-neo hover:-translate-y-0.5 transition-all duration-200 cursor-help"
                  >
                    <Coins className="w-4 h-4 text-dark fill-dark stroke-[2]" />
                    <span className="font-mono text-sm">{usuario.pontos}</span>
                    <span className="text-dark/70 text-[10px] uppercase font-bold tracking-wider">pts</span>
                  </div>

                  {/* Tooltip Educativo com Informacoes de Como Ganhar e Gastar Pontos */}
                  <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white border-3 border-dark rounded-2xl p-4 shadow-[6px_6px_0px_0px_#191A23] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] pointer-events-none text-left">
                    <div className="flex items-center space-x-2 border-b-2 border-dark/10 pb-2 mb-2.5">
                      <Coins className="w-4 h-4 text-amber-500 fill-amber-400 stroke-[2.5]" />
                      <span className="text-xs font-black uppercase tracking-wider text-dark font-display">
                        {isEn ? 'Points & Economy Guide' : 'Guia de Moedas & Pontos'}
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="font-black text-[11px] uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 block mb-1">
                          {isEn ? '⚡ HOW TO EARN POINTS' : '⚡ COMO GANHAR MOEDAS'}
                        </span>
                        <ul className="text-dark/80 space-y-1 font-medium text-[11px] list-disc list-inside">
                          <li>{isEn ? 'Solve exercises in Question Hub (+50 to +110 PTS)' : 'Acertar exercícios na Central de Questões (+50 a +110 PTS)'}</li>
                          <li>{isEn ? 'Complete laboratory simulations (+25 to +60 PTS)' : 'Concluir desafios em Cinética, Maxwell e DSC (+25 a +60 PTS)'}</li>
                        </ul>
                      </div>

                      <div>
                        <span className="font-black text-[11px] uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-300 block mb-1">
                          {isEn ? '🛍️ WHERE TO SPEND POINTS' : '🛍️ ONDE GASTAR SEUS PONTOS'}
                        </span>
                        <ul className="text-dark/80 space-y-1 font-medium text-[11px] list-disc list-inside">
                          <li>{isEn ? 'Unlock theoretical formula hints (-20 PTS)' : 'Revelar fórmula teórica da questão (-20 PTS)'}</li>
                          <li>{isEn ? 'Unlock step-by-step resolution (-30 PTS)' : 'Desbloquear passo a passo armado (-30 PTS)'}</li>
                          <li>{isEn ? 'Buy historical badges in the Shop (-100 to -400 PTS)' : 'Adquirir insígnias históricas na Loja (-100 a -400 PTS)'}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botao de Perfil */}
                <Link
                  to="/perfil"
                  className="flex items-center space-x-2.5 px-3 py-1.5 bg-white border-2 border-dark rounded-xl hover:bg-brand hover:-translate-y-0.5 hover:shadow-neo shadow-neo-sm active:translate-y-1 active:scale-95 active:shadow-none transition-all duration-150 cursor-pointer"
                  title={isEn ? 'My Profile' : 'Meu Perfil'}
                >
                  <AvatarBadge avatarId={usuario.avatarId} size="sm" />
                  <div className="hidden xl:block text-left">
                    <span className="block text-xs font-black text-dark uppercase tracking-wider leading-tight">
                      {usuario.nomeCompleto.split(' ')[0]}
                    </span>
                    <span className="block text-[9px] font-bold text-dark/70 uppercase tracking-widest leading-none">
                      {isEn ? `LV. ${nivel}` : `NV. ${nivel}`} • {xp} XP
                    </span>
                  </div>
                </Link>

                {/* Botao Sair */}
                <button
                  onClick={handleLogout}
                  className="w-10 h-10 flex items-center justify-center text-dark bg-white hover:text-white hover:bg-dark border-2 border-dark rounded-xl shadow-neo-sm hover:shadow-neo hover:-translate-y-0.5 active:translate-y-1 active:scale-95 active:shadow-none transition-all duration-150 cursor-pointer"
                  title={isEn ? 'Sign out' : 'Sair da conta'}
                >
                  <LogOut className="w-4 h-4 stroke-[2.5]" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3 text-xs font-black font-display uppercase tracking-widest">
                <Link to="/login" className="text-dark hover:-translate-y-0.5 active:translate-y-1 transition-transform px-3 py-1.5">
                  {isEn ? 'Sign In' : 'Entrar'}
                </Link>
                <Link
                  to="/cadastro"
                  className="btn-quantum-primary px-5 py-2.5 rounded-xl text-xs hover:-translate-y-0.5 active:translate-y-1 transition-transform shadow-neo-sm"
                >
                  {isEn ? 'Sign Up' : 'Criar Conta'}
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Menu Mobile Horizontal com Scroll */}
      <div className="lg:hidden flex items-center space-x-2 px-4 py-2.5 bg-slate-50 border-t-2 border-dark/15 overflow-x-auto text-xs font-bold">
        {navItems.map(item => {
          const isActive = item.aliases.includes(location.pathname);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`whitespace-nowrap px-3 py-1.5 rounded-xl border-2 transition-all active:scale-95 active:translate-y-1 cursor-pointer duration-150 ${
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
