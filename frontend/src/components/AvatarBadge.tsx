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
    corGradiente: 'bg-white',
    corTexto: 'text-dark',
    corSombra: 'shadow-neo-sm'
  },
  {
    id: 'avatar_quantum',
    nome: 'Insígnia de Planck',
    descricao: 'Símbolo da física quântica e quantização da energia.',
    preco: 150,
    nivelMinimo: 2,
    simbolo: 'ℏ',
    subtitulo: 'CONSTANTE DE PLANCK',
    corGradiente: 'bg-brand',
    corTexto: 'text-dark',
    corSombra: 'shadow-neo-sm'
  },
  {
    id: 'avatar_fire',
    nome: 'Insígnia de Termodinâmica',
    descricao: 'Domínio em entalpia, conservação de energia e calorimetria.',
    preco: 300,
    nivelMinimo: 3,
    simbolo: 'ΔH',
    subtitulo: 'VARIAÇÃO ENTÁLPICA',
    corGradiente: 'bg-rose-400',
    corTexto: 'text-dark',
    corSombra: 'shadow-neo-sm'
  },
  {
    id: 'avatar_cyber',
    nome: 'Insígnia de Boltzmann',
    descricao: 'Dedicada aos estudos de entropia e velocidade dos gases.',
    preco: 500,
    nivelMinimo: 4,
    simbolo: 'kB',
    subtitulo: 'CONSTANTE DE BOLTZMANN',
    corGradiente: 'bg-yellow-300',
    corTexto: 'text-dark',
    corSombra: 'shadow-neo-sm'
  },
  {
    id: 'avatar_supernova',
    nome: 'Insígnia de Bohr',
    descricao: 'Reconhecimento pela resolução precisa de modelos atômicos.',
    preco: 800,
    nivelMinimo: 5,
    simbolo: 'Ψ',
    subtitulo: 'FUNÇÃO DE ONDA',
    corGradiente: 'bg-purple-400',
    corTexto: 'text-dark',
    corSombra: 'shadow-neo-sm'
  },
  {
    id: 'avatar_void',
    nome: 'Insígnia de Marie Curie',
    descricao: 'Homenagem aos estudos avançados em transformações moleculares.',
    preco: 1200,
    nivelMinimo: 6,
    simbolo: 'Ra',
    subtitulo: 'QUÍMICA AVANÇADA',
    corGradiente: 'bg-emerald-400',
    corTexto: 'text-dark',
    corSombra: 'shadow-neo-sm'
  },
  {
    id: 'avatar_nobel',
    nome: 'Láurea de Excelência',
    descricao: 'A mais alta distinção de estudo na disciplina.',
    preco: 2000,
    nivelMinimo: 7,
    simbolo: 'Ω',
    subtitulo: 'HONRA MÁXIMA',
    corGradiente: 'bg-dark',
    corTexto: 'text-yellow-300',
    corSombra: 'shadow-neo-sm'
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
    sm: 'w-10 h-10 text-base',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-20 h-20 text-3xl',
    '2xl': 'w-28 h-28 text-5xl',
  };

  return (
    <div className="relative inline-flex items-center justify-center select-none font-mono group perspective-1000">
      {/* Corpo da Insígnia Brutalista com Animação Suave */}
      <div
        className={`${sizeClasses[size]} relative ${avatar.corGradiente} ${avatar.corTexto} font-black flex items-center justify-center shadow-neo group-hover:shadow-neo-hover group-hover:-translate-y-2 group-hover:-rotate-6 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] border-4 border-dark`}
      >
        <span className="tracking-tighter transform group-hover:scale-110 transition-transform duration-500 ease-out">{avatar.simbolo}</span>
      </div>
    </div>
  );
}
