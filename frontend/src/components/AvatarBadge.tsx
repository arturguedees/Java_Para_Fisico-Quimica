import React from 'react';
import { User, Atom, Flame, Zap, Sun, Sparkles, Shield, Crown } from 'lucide-react';

export interface AvatarDef {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  nivelMinimo: number;
  icone: string;
  animacaoClasse: string;
  bordaGradiente: string;
  bgGradiente: string;
}

export const AVATARES_CATALOGO: AvatarDef[] = [
  {
    id: 'avatar_default',
    nome: 'Cientista Clássico',
    descricao: 'Avatar inicial com anel de foco e estabilidade atômica.',
    preco: 0,
    nivelMinimo: 1,
    icone: 'user',
    animacaoClasse: 'animate-pulse-glow',
    bordaGradiente: 'from-blue-500 to-indigo-600',
    bgGradiente: 'from-blue-900/60 to-indigo-950/80',
  },
  {
    id: 'avatar_quantum',
    nome: 'Fóton Quântico',
    descricao: 'Aura eletrodinâmica em órbita de spin contínuo.',
    preco: 150,
    nivelMinimo: 2,
    icone: 'atom',
    animacaoClasse: 'animate-quantum',
    bordaGradiente: 'from-cyan-400 via-blue-500 to-teal-300',
    bgGradiente: 'from-cyan-950/80 to-blue-900/80',
  },
  {
    id: 'avatar_fire',
    nome: 'Reator Termodinâmico',
    descricao: 'Chamas de alta entalpia e combustão exotérmica intensa.',
    preco: 300,
    nivelMinimo: 3,
    icone: 'flame',
    animacaoClasse: 'animate-flame',
    bordaGradiente: 'from-amber-400 via-orange-500 to-red-600',
    bgGradiente: 'from-orange-950/80 to-red-900/80',
  },
  {
    id: 'avatar_cyber',
    nome: 'Cyber Físico-Químico',
    descricao: 'Matriz holográfica de processamento molecular avançado.',
    preco: 500,
    nivelMinimo: 4,
    icone: 'zap',
    animacaoClasse: 'animate-cyber',
    bordaGradiente: 'from-emerald-400 via-teal-500 to-cyan-400',
    bgGradiente: 'from-emerald-950/80 to-slate-900/80',
  },
  {
    id: 'avatar_supernova',
    nome: 'Supernova Estelar',
    descricao: 'Fusão termonuclear no coração de uma estrela em colapso.',
    preco: 800,
    nivelMinimo: 5,
    icone: 'sun',
    animacaoClasse: 'animate-supernova',
    bordaGradiente: 'from-yellow-300 via-amber-500 to-orange-600',
    bgGradiente: 'from-yellow-950/80 to-amber-900/80',
  },
  {
    id: 'avatar_void',
    nome: 'Cristal de Matéria Escura',
    descricao: 'Flutuação de vácuo e energia de ponto zero do universo.',
    preco: 1200,
    nivelMinimo: 6,
    icone: 'sparkles',
    animacaoClasse: 'animate-void',
    bordaGradiente: 'from-purple-500 via-fuchsia-500 to-indigo-600',
    bgGradiente: 'from-purple-950/80 to-fuchsia-950/80',
  },
  {
    id: 'avatar_nobel',
    nome: 'Laureado Nobel',
    descricao: 'A mais prestigiada honraria da ciência contemporânea.',
    preco: 2000,
    nivelMinimo: 7,
    icone: 'crown',
    animacaoClasse: 'animate-spin-slow',
    bordaGradiente: 'from-amber-300 via-yellow-400 to-yellow-600',
    bgGradiente: 'from-yellow-900/90 to-amber-950/90',
  }
];

interface AvatarBadgeProps {
  avatarId?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showAnimation?: boolean;
}

export default function AvatarBadge({
  avatarId = 'avatar_default',
  size = 'md',
  showAnimation = true
}: AvatarBadgeProps) {
  const avatar = AVATARES_CATALOGO.find(a => a.id === avatarId) || AVATARES_CATALOGO[0];

  const sizeClasses = {
    sm: 'w-8 h-8 p-[1.5px]',
    md: 'w-12 h-12 p-[2px]',
    lg: 'w-16 h-16 p-[3px]',
    xl: 'w-24 h-24 p-[3.5px]',
    '2xl': 'w-32 h-32 p-[4px]',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16',
  };

  const renderIcon = () => {
    const s = iconSizes[size];
    switch (avatar.icone) {
      case 'atom': return <Atom className={`${s} text-cyan-300`} />;
      case 'flame': return <Flame className={`${s} text-orange-400`} />;
      case 'zap': return <Zap className={`${s} text-emerald-300`} />;
      case 'sun': return <Sun className={`${s} text-yellow-300`} />;
      case 'sparkles': return <Sparkles className={`${s} text-fuchsia-300`} />;
      case 'crown': return <Crown className={`${s} text-amber-300`} />;
      default: return <User className={`${s} text-blue-300`} />;
    }
  };

  return (
    <div className="relative inline-block select-none">
      {/* Moldura animada */}
      <div
        className={`rounded-full bg-gradient-to-tr ${avatar.bordaGradiente} ${sizeClasses[size]} ${
          showAnimation ? avatar.animacaoClasse : ''
        } transition-transform duration-300`}
      >
        {/* Fundo do Avatar */}
        <div
          className={`w-full h-full rounded-full bg-gradient-to-br ${avatar.bgGradiente} flex items-center justify-center backdrop-blur-md shadow-inner border border-white/20`}
        >
          {renderIcon()}
        </div>
      </div>
    </div>
  );
}
