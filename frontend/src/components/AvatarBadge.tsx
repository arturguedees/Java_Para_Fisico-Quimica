import React from 'react';
import { type Language } from '../i18n/i18n';

/**
 * Componente que desenha as Insignias Cientificas da loja e do perfil.
 * Coloquei os textos em Portugues e Ingles no catalogo pra traduzir automatico!
 */
export interface AvatarDef {
  id: string;
  nome: string;
  nomeEn: string;
  descricao: string;
  descricaoEn: string;
  preco: number;
  nivelMinimo: number;
  simbolo: string;
  subtitulo: string;
  subtituloEn: string;
  corGradiente: string;
  corTexto: string;
  corSombra: string;
}

export const AVATARES_CATALOGO: AvatarDef[] = [
  {
    id: 'avatar_default',
    nome: 'Insígnia de Iniciação',
    nomeEn: 'Initiation Badge',
    descricao: 'Concedida aos estudantes ao iniciarem seus estudos na plataforma.',
    descricaoEn: 'Awarded to students upon starting their studies on the platform.',
    preco: 0,
    nivelMinimo: 1,
    simbolo: 'α',
    subtitulo: 'NÍVEL 01 • INICIANTE',
    subtituloEn: 'LEVEL 01 • NOVICE',
    corGradiente: 'bg-white',
    corTexto: 'text-dark',
    corSombra: 'shadow-neo-sm',
  },
  {
    id: 'avatar_quantum',
    nome: 'Insígnia de Planck',
    nomeEn: 'Planck Quantum Badge',
    descricao: 'Símbolo da física quântica e quantização da energia.',
    descricaoEn: 'Symbol of quantum physics and energy quantization.',
    preco: 150,
    nivelMinimo: 2,
    simbolo: 'ℏ',
    subtitulo: 'CONSTANTE DE PLANCK',
    subtituloEn: 'PLANCK CONSTANT',
    corGradiente: 'bg-brand',
    corTexto: 'text-dark',
    corSombra: 'shadow-neo-sm',
  },
  {
    id: 'avatar_fire',
    nome: 'Insígnia de Termodinâmica',
    nomeEn: 'Thermodynamics Badge',
    descricao: 'Domínio em entalpia, conservação de energia e calorimetria.',
    descricaoEn: 'Mastery in enthalpy, energy conservation, and calorimetry.',
    preco: 300,
    nivelMinimo: 3,
    simbolo: 'ΔH',
    subtitulo: 'VARIAÇÃO ENTÁLPICA',
    subtituloEn: 'ENTHALPY CHANGE',
    corGradiente: 'bg-rose-400',
    corTexto: 'text-dark',
    corSombra: 'shadow-neo-sm',
  },
  {
    id: 'avatar_cyber',
    nome: 'Insígnia de Boltzmann',
    nomeEn: 'Boltzmann Kinetic Badge',
    descricao: 'Dedicada aos estudos de entropia e velocidade dos gases.',
    descricaoEn: 'Dedicated to entropy and molecular gas speed distribution studies.',
    preco: 500,
    nivelMinimo: 4,
    simbolo: 'kB',
    subtitulo: 'CONSTANTE DE BOLTZMANN',
    subtituloEn: 'BOLTZMANN CONSTANT',
    corGradiente: 'bg-yellow-300',
    corTexto: 'text-dark',
    corSombra: 'shadow-neo-sm',
  },
  {
    id: 'avatar_supernova',
    nome: 'Insígnia de Bohr',
    nomeEn: 'Bohr Wavefunction Badge',
    descricao: 'Reconhecimento pela resolução precisa de modelos atômicos.',
    descricaoEn: 'Recognition for accurate resolution of atomic and quantum models.',
    preco: 800,
    nivelMinimo: 5,
    simbolo: 'Ψ',
    subtitulo: 'FUNÇÃO DE ONDA',
    subtituloEn: 'WAVE FUNCTION',
    corGradiente: 'bg-purple-400',
    corTexto: 'text-dark',
    corSombra: 'shadow-neo-sm',
  },
  {
    id: 'avatar_void',
    nome: 'Insígnia de Marie Curie',
    nomeEn: 'Marie Curie Radium Badge',
    descricao: 'Homenagem aos estudos avançados em transformações moleculares.',
    descricaoEn: 'Tribute to advanced studies in molecular transformations and kinetics.',
    preco: 1200,
    nivelMinimo: 6,
    simbolo: 'Ra',
    subtitulo: 'QUÍMICA AVANÇADA',
    subtituloEn: 'ADVANCED CHEMISTRY',
    corGradiente: 'bg-emerald-400',
    corTexto: 'text-dark',
    corSombra: 'shadow-neo-sm',
  },
  {
    id: 'avatar_nobel',
    nome: 'Láurea de Excelência',
    nomeEn: 'Laurel of Excellence',
    descricao: 'A mais alta distinção de estudo na disciplina.',
    descricaoEn: 'The highest academic distinction in Physical Chemistry.',
    preco: 2000,
    nivelMinimo: 7,
    simbolo: 'Ω',
    subtitulo: 'HONRA MÁXIMA',
    subtituloEn: 'HIGHEST HONOR',
    corGradiente: 'bg-dark',
    corTexto: 'text-yellow-300',
    corSombra: 'shadow-neo-sm',
  },
];

export function obterNomeAvatar(avatar: AvatarDef, lang: Language): string {
  return lang === 'en' ? avatar.nomeEn : avatar.nome;
}

export function obterDescricaoAvatar(avatar: AvatarDef, lang: Language): string {
  return lang === 'en' ? avatar.descricaoEn : avatar.descricao;
}

interface AvatarBadgeProps {
  avatarId?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export default function AvatarBadge({
  avatarId = 'avatar_default',
  size = 'md',
}: AvatarBadgeProps) {
  // Se vier algum id antigo (tipo avatar_curie ou avatar_boltzmann), mapeia pros equivalentes do catalogo
  const idNormalizado =
    avatarId === 'avatar_curie'
      ? 'avatar_void'
      : avatarId === 'avatar_boltzmann'
      ? 'avatar_cyber'
      : avatarId === 'avatar_planck'
      ? 'avatar_quantum'
      : avatarId;

  const avatar = AVATARES_CATALOGO.find(a => a.id === idNormalizado) || AVATARES_CATALOGO[0];

  const sizeClasses = {
    sm: 'w-10 h-10 text-base',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-20 h-20 text-3xl',
    '2xl': 'w-28 h-28 text-5xl',
  };

  return (
    <div className="relative inline-flex items-center justify-center select-none font-mono group perspective-1000">
      {/* Quadradinho Neo-Brutalista com simbolo fisico-quimico no centro */}
      <div
        className={`${sizeClasses[size]} relative ${avatar.corGradiente} ${avatar.corTexto} font-black flex items-center justify-center shadow-neo group-hover:shadow-neo-hover group-hover:-translate-y-2 group-hover:-rotate-6 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] border-4 border-dark`}
      >
        <span className="tracking-tighter transform group-hover:scale-110 transition-transform duration-500 ease-out">
          {avatar.simbolo}
        </span>
      </div>
    </div>
  );
}
