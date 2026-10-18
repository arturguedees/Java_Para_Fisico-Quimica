import React from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Plano de fundo sutil e animado para a plataforma.
 * Inspirado na estética científica e no visual do login, porém mais suave e moderno,
 * sem causar enjoo ou distração visual durante as simulações.
 */
export default function PlanoDeFundoAnimado() {
  const location = useLocation();
  const isPerfil = location.pathname === '/perfil';
  const isLoginOrCadastro = location.pathname === '/login' || location.pathname === '/cadastro';

  // O login e cadastro ja possuem seus proprios cards e particulas
  if (isLoginOrCadastro) return null;

  if (isPerfil) {
    // Fundo dedicado dark para o Perfil (elegante, com contraste alto e sem poluicao branca)
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0A0D14]">
        <div 
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: 'radial-gradient(#BFFF00 1.2px, transparent 1.2px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[120px] animate-pulse-subtle" />
        <div 
          className="absolute top-1/3 -right-32 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse-subtle"
          style={{ animationDelay: '2s' }}
        />
        <div 
          className="absolute -bottom-32 left-1/4 w-[400px] h-[400px] bg-amber-400/10 rounded-full blur-[100px] animate-pulse-subtle"
          style={{ animationDelay: '3.5s' }}
        />
      </div>
    );
  }

  // Fundo sutil animado para o restante do sistema (Dashboard, Formulas, Questoes, Loja, Ranking)
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Grid de pontos suaves */}
      <div 
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: 'radial-gradient(#191A23 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      
      {/* Orbes de luz flutuantes e discretos (sem causar nauseas) */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand/20 rounded-full blur-[100px] animate-pulse-subtle" />
      <div 
        className="absolute top-1/2 -right-40 w-[420px] h-[420px] bg-cyan-300/20 rounded-full blur-[120px] animate-pulse-subtle"
        style={{ animationDelay: '2.5s' }}
      />
      <div 
        className="absolute -bottom-40 left-1/3 w-80 h-80 bg-yellow-300/20 rounded-full blur-[90px] animate-pulse-subtle"
        style={{ animationDelay: '4s' }}
      />
    </div>
  );
}
