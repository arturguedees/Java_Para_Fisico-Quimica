import React from 'react';

export interface AvatarDef {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  nivelMinimo: number;
  simbolo: string;
  subtitulo: string;
}

export const AVATARES_CATALOGO: AvatarDef[] = [
  {
    id: 'avatar_default',
    nome: 'Insígnia de Iniciação',
    descricao: 'Concedida aos estudantes ao iniciarem seus estudos na plataforma.',
    preco: 0,
    nivelMinimo: 1,
    simbolo: 'α',
    subtitulo: 'NÍVEL 01 • INICIANTE'
  },
  {
    id: 'avatar_quantum',
    nome: 'Insígnia de Planck',
    descricao: 'Símbolo da física quântica e quantização de energia.',
    preco: 150,
    nivelMinimo: 2,
    simbolo: 'ℏ',
    subtitulo: 'CONSTANTE DE PLANCK'
  },
  {
    id: 'avatar_fire',
    nome: 'Insígnia de Termodinâmica',
    descricao: 'Domínio em entalpia, conservação de energia e calorimetria.',
    preco: 300,
    nivelMinimo: 3,
    simbolo: 'ΔH',
    subtitulo: 'VARIAÇÃO ENTÁLPICA'
  },
  {
    id: 'avatar_cyber',
    nome: 'Insígnia de Boltzmann',
    descricao: 'Dedicada aos estudos de entropia e velocidade dos gases.',
    preco: 500,
    nivelMinimo: 4,
    simbolo: 'kB',
    subtitulo: 'CONSTANTE DE BOLTZMANN'
  },
  {
    id: 'avatar_supernova',
    nome: 'Insígnia de Bohr',
    descricao: 'Reconhecimento pela resolução precisa de modelos atômicos.',
    preco: 800,
    nivelMinimo: 5,
    simbolo: 'Ψ',
    subtitulo: 'FUNÇÃO DE ONDA'
  },
  {
    id: 'avatar_void',
    nome: 'Insígnia de Marie Curie',
    descricao: 'Homenagem aos estudos avançados em transformações moleculares.',
    preco: 1200,
    nivelMinimo: 6,
    simbolo: 'Ra',
    subtitulo: 'QUÍMICA AVANÇADA'
  },
  {
    id: 'avatar_nobel',
    nome: 'Láurea de Excelência',
    descricao: 'A mais alta distinção de estudo na disciplina.',
    preco: 2000,
    nivelMinimo: 7,
    simbolo: 'Ω',
    subtitulo: 'HONRA MÁXIMA'
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
    sm: 'w-8 h-8 text-sm border',
    md: 'w-11 h-11 text-base border-[1.5px]',
    lg: 'w-16 h-16 text-xl border-2',
    xl: 'w-20 h-20 text-3xl border-2',
    '2xl': 'w-28 h-28 text-4xl border-2',
  };

  return (
    <div className="relative inline-flex items-center justify-center select-none font-mono">
      <div
        className={`${sizeClasses[size]} rounded-xl bg-blue-50 border-blue-200 text-blue-700 font-bold flex items-center justify-center shadow-sm hover:border-blue-400 transition-colors duration-200`}
      >
        <span className="font-bold">{avatar.simbolo}</span>
      </div>
    </div>
  );
}
