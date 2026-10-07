import React from 'react';

export interface AvatarDef {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  nivelMinimo: number;
  simbolo: string;
  subtitulo: string;
  corGradiente: string;
  corTexto: string;
  corSombra: string;
}

export const AVATARES_CATALOGO: AvatarDef[] = [
  {
    id: 'avatar_default',
    nome: 'Insígnia de Iniciação',
    descricao: 'Concedida aos estudantes ao iniciarem seus estudos na plataforma.',
    preco: 0,
    nivelMinimo: 1,
    simbolo: 'α',
    subtitulo: 'NÍVEL 01 • INICIANTE',
    corGradiente: 'from-blue-500 to-indigo-600',
    corTexto: 'text-blue-600',
    corSombra: 'shadow-blue-500/20'
  },
  {
    id: 'avatar_quantum',
    nome: 'Insígnia de Planck',
    descricao: 'Símbolo da física quântica e quantização da energia.',
    preco: 150,
    nivelMinimo: 2,
    simbolo: 'ℏ',
    subtitulo: 'CONSTANTE DE PLANCK',
    corGradiente: 'from-cyan-500 to-blue-600',
    corTexto: 'text-cyan-600',
    corSombra: 'shadow-cyan-500/25'
  },
  {
    id: 'avatar_fire',
    nome: 'Insígnia de Termodinâmica',
    descricao: 'Domínio em entalpia, conservação de energia e calorimetria.',
    preco: 300,
    nivelMinimo: 3,
    simbolo: 'ΔH',
    subtitulo: 'VARIAÇÃO ENTÁLPICA',
    corGradiente: 'from-amber-500 to-rose-600',
    corTexto: 'text-amber-600',
    corSombra: 'shadow-amber-500/25'
  },
  {
    id: 'avatar_cyber',
    nome: 'Insígnia de Boltzmann',
    descricao: 'Dedicada aos estudos de entropia e velocidade dos gases.',
    preco: 500,
    nivelMinimo: 4,
    simbolo: 'kB',
    subtitulo: 'CONSTANTE DE BOLTZMANN',
    corGradiente: 'from-indigo-500 to-purple-600',
    corTexto: 'text-indigo-600',
    corSombra: 'shadow-indigo-500/25'
  },
  {
    id: 'avatar_supernova',
    nome: 'Insígnia de Bohr',
    descricao: 'Reconhecimento pela resolução precisa de modelos atômicos.',
    preco: 800,
    nivelMinimo: 5,
    simbolo: 'Ψ',
    subtitulo: 'FUNÇÃO DE ONDA',
    corGradiente: 'from-purple-500 to-pink-600',
    corTexto: 'text-purple-600',
    corSombra: 'shadow-purple-500/25'
  },
  {
    id: 'avatar_void',
    nome: 'Insígnia de Marie Curie',
    descricao: 'Homenagem aos estudos avançados em transformações moleculares.',
    preco: 1200,
    nivelMinimo: 6,
    simbolo: 'Ra',
    subtitulo: 'QUÍMICA AVANÇADA',
    corGradiente: 'from-emerald-500 to-teal-600',
    corTexto: 'text-emerald-600',
    corSombra: 'shadow-emerald-500/25'
  },
  {
    id: 'avatar_nobel',
    nome: 'Láurea de Excelência',
    descricao: 'A mais alta distinção de estudo na disciplina.',
    preco: 2000,
    nivelMinimo: 7,
    simbolo: 'Ω',
    subtitulo: 'HONRA MÁXIMA',
    corGradiente: 'from-yellow-400 via-amber-500 to-orange-600',
    corTexto: 'text-amber-500',
    corSombra: 'shadow-amber-500/35'
  }
];

interface AvatarBadgeProps {
  avatarId?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export default function AvatarBadge({
  avatarId = 'avatar_default',
  size = 'md'
}: AvatarBadgeProps) {
  const avatar = AVATARES_CATALOGO.find(a => a.id === avatarId) || AVATARES_CATALOGO[0];

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm rounded-lg',
    md: 'w-11 h-11 text-base rounded-xl',
    lg: 'w-16 h-16 text-xl rounded-2xl',
    xl: 'w-20 h-20 text-3xl rounded-2xl',
    '2xl': 'w-28 h-28 text-4xl rounded-3xl',
  };

  return (
    <div className="relative inline-flex items-center justify-center select-none font-mono group">
      {/* Halo de luz no hover */}
      <div 
        className={`absolute inset-0 bg-gradient-to-tr ${avatar.corGradiente} opacity-20 group-hover:opacity-40 blur-md rounded-2xl transition-opacity duration-300`} 
      />
      
      {/* Corpo da Insígnia */}
      <div
        className={`${sizeClasses[size]} relative bg-gradient-to-tr ${avatar.corGradiente} text-white font-extrabold flex items-center justify-center shadow-md ${avatar.corSombra} group-hover:scale-105 group-hover:shadow-lg transition-all duration-200 border border-white/25`}
      >
        <span className="drop-shadow-sm tracking-tighter">{avatar.simbolo}</span>
      </div>
    </div>
  );
}
