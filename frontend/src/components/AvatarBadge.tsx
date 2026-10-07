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
    nome: 'Insígnia Básica de Laboratório',
    descricao: 'Credencial inaugural concedida a novos pesquisadores e estudantes.',
    preco: 0,
    nivelMinimo: 1,
    simbolo: 'α',
    subtitulo: 'NÍVEL 01 • INICIANTE'
  },
  {
    id: 'avatar_quantum',
    nome: 'Selo Quântico de Planck',
    descricao: 'Homenagem aos fundamentos da mecânica quântica e quantização de energia.',
    preco: 150,
    nivelMinimo: 2,
    simbolo: 'ℏ',
    subtitulo: 'CONSTANTE DE PLANCK'
  },
  {
    id: 'avatar_fire',
    nome: 'Ordem Termodinâmica de Carnot',
    descricao: 'Insígnia de domínio em ciclos térmicos, entalpia de reação e conservação de energia.',
    preco: 300,
    nivelMinimo: 3,
    simbolo: 'ΔH',
    subtitulo: 'VARIAÇÃO ENTÁLPICA'
  },
  {
    id: 'avatar_cyber',
    nome: 'Medalha Estatística de Boltzmann',
    descricao: 'Honraria dedicada à interpretação probabilística dos sistemas e entropia.',
    preco: 500,
    nivelMinimo: 4,
    simbolo: 'kB',
    subtitulo: 'ENTROPIA & ESTATÍSTICA'
  },
  {
    id: 'avatar_supernova',
    nome: 'Crest Espectroscópico de Bohr',
    descricao: 'Reconhecimento pela resolução precisa de modelos atômicos e transições eletrônicas.',
    preco: 800,
    nivelMinimo: 5,
    simbolo: 'Ψ',
    subtitulo: 'FUNÇÃO DE ONDA'
  },
  {
    id: 'avatar_void',
    nome: 'Selo Real de Marie Curie',
    descricao: 'Consagração máxima em transformações nucleares e radioatividade.',
    preco: 1200,
    nivelMinimo: 6,
    simbolo: 'Ra',
    subtitulo: 'PESQUISA AVANÇADA'
  },
  {
    id: 'avatar_nobel',
    nome: 'Láurea Suprema da Ciência',
    descricao: 'A mais alta distinção acadêmica outorgada por excelência investigativa.',
    preco: 2000,
    nivelMinimo: 7,
    simbolo: 'Ω',
    subtitulo: 'HONRA MÁXIMA'
  }
];

interface AvatarBadgeProps {
  avatarId?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showAnimation?: boolean;
}

export default function AvatarBadge({
  avatarId = 'avatar_default',
  size = 'md'
}: AvatarBadgeProps) {
  const avatar = AVATARES_CATALOGO.find(a => a.id === avatarId) || AVATARES_CATALOGO[0];

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs border-[1px]',
    md: 'w-10 h-10 text-sm border-[1px]',
    lg: 'w-14 h-14 text-lg border-[1.5px]',
    xl: 'w-20 h-20 text-2xl border-[1.5px]',
    '2xl': 'w-28 h-28 text-4xl border-[2px]',
  };

  return (
    <div className="relative inline-flex items-center justify-center select-none font-serif">
      <div
        className={`${sizeClasses[size]} rounded-none bg-[#13161b] border-[#2b303b] hover:border-[#c85a32] flex items-center justify-center text-[#e5e2dc] shadow-sm transition-colors duration-200`}
      >
        <span className="font-serif italic font-semibold text-[#c85a32]">{avatar.simbolo}</span>
      </div>
    </div>
  );
}
