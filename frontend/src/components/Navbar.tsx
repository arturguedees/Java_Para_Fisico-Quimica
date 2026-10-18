import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Coins, Cpu } from 'lucide-react';
import AvatarBadge from './AvatarBadge';
import { LanguageSelector, useI18n } from '../i18n/i18n';
import {
  obterStatusMotor,
  inscreverStatusMotor,
  verificarSaudeBackend,
  type StatusMotor,
} from '../services/api';

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
  const [statusMotor, setStatusMotor] = useState<StatusMotor>(obterStatusMotor());

  useEffect(() => {
    // Se inscreve pra saber quando o backend Java fica online ou quando cai pro motor local
    const cancelar = inscreverStatusMotor(novo => setStatusMotor(novo));
    verificarSaudeBackend();
    return cancelar;
  }, []);

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

          {/* Seletor de Idioma (EUA / Brasil), Status do Motor, Moedas e Perfil */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 pl-3 border-l-2 border-dark/15">
            {/* Seletor de Idiomas com Bandeiras SVG dos EUA (English) e Brasil (Portugues) */}
            <LanguageSelector compact />

            {/* Indicador de Status do Motor Cientifico */}
            <div
              className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 border-2 border-dark rounded-xl text-[10px] font-black uppercase tracking-wider shadow-neo-sm cursor-default ${
                statusMotor === 'api' ? 'bg-brand text-dark' : 'bg-white text-dark'
              }`}
              title={
                statusMotor === 'api'
                  ? isEn
                    ? 'Connected to Java Spring Boot REST API'
                    : 'Conectado à API REST Spring Boot Java'
                  : isEn
                  ? 'Running on Isomorphic Local Scientific Engine (< 1ms)'
                  : 'Operando com Motor Científico Isomórfico Local (< 1ms)'
              }
            >
              <span
                className={`w-2 h-2 rounded-full border border-dark ${
                  statusMotor === 'api' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <Cpu className="w-3.5 h-3.5 text-dark stroke-[2.5]" />
              <span>
                {statusMotor === 'api'
                  ? isEn
                    ? 'JAVA API ONLINE'
                    : 'API JAVA ONLINE'
                  : isEn
                  ? 'LOCAL ENGINE'
                  : 'MOTOR LOCAL ATIVO'}
              </span>
            </div>

            {usuario ? (
              <>
                {/* Saldo de Moedas/Pontos */}
                <div 
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-yellow-300 border-2 border-dark rounded-xl text-xs font-black text-dark shadow-neo-sm hover:shadow-neo hover:-translate-y-0.5 transition-all duration-200 cursor-default"
                  title={isEn ? 'Coins earned by solving exercises' : 'Moedas ganhas ao responder exercícios'}
                >
                  <Coins className="w-4 h-4 text-dark fill-dark stroke-[2]" />
                  <span className="font-mono text-sm">{usuario.pontos}</span>
                  <span className="text-dark/70 text-[10px] uppercase font-bold tracking-wider">pts</span>
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
