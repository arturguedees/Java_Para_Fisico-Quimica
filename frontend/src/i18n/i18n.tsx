import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Contexto de Internacionalizacao (i18n) que eu criei pro sistema funcionar em Ingles (padrao)
 * e Portugues, conforme o professor pediu!
 * Também desenhei as bandeiras dos EUA e do Brasil em SVG puro pra colocar dentro das opcoes do seletor.
 */

export type Language = 'en' | 'pt';

export const LANG_STORAGE_KEY = 'lab_quantico_lang';

// Funcao auxiliar pra ler o idioma atual mesmo fora de componentes React (ex: dentro do api.ts)
export function obterIdiomaAtual(): Language {
  if (typeof window === 'undefined') return 'en';
  try {
    const salvo = localStorage.getItem(LANG_STORAGE_KEY);
    if (salvo === 'pt' || salvo === 'en') {
      return salvo;
    }
  } catch {
    // Se o localStorage estiver bloqueado, usa ingles como default
  }
  return 'en'; // Ingles e o idioma padrao que o professor pediu!
}

/**
 * Icone vetorial SVG da Bandeira dos Estados Unidos (para a opcao English)
 */
export function FlagUS({ className = 'w-5 h-3.5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 20"
      className={`${className} rounded-[3px] border border-dark/80 shrink-0 shadow-[1px_1px_0px_#191A23]`}
      aria-label="United States Flag"
    >
      <rect width="28" height="20" fill="#FFFFFF" />
      {/* Listras vermelhas */}
      <rect y="0" width="28" height="1.54" fill="#B22234" />
      <rect y="3.08" width="28" height="1.54" fill="#B22234" />
      <rect y="6.15" width="28" height="1.54" fill="#B22234" />
      <rect y="9.23" width="28" height="1.54" fill="#B22234" />
      <rect y="12.31" width="28" height="1.54" fill="#B22234" />
      <rect y="15.38" width="28" height="1.54" fill="#B22234" />
      <rect y="18.46" width="28" height="1.54" fill="#B22234" />
      {/* Cantao azul com estrelas */}
      <rect width="12" height="10.77" fill="#3C3B6E" />
      <g fill="#FFFFFF">
        <circle cx="2.2" cy="2.0" r="0.65" />
        <circle cx="4.7" cy="2.0" r="0.65" />
        <circle cx="7.2" cy="2.0" r="0.65" />
        <circle cx="9.7" cy="2.0" r="0.65" />
        <circle cx="3.4" cy="3.8" r="0.65" />
        <circle cx="5.9" cy="3.8" r="0.65" />
        <circle cx="8.4" cy="3.8" r="0.65" />
        <circle cx="2.2" cy="5.5" r="0.65" />
        <circle cx="4.7" cy="5.5" r="0.65" />
        <circle cx="7.2" cy="5.5" r="0.65" />
        <circle cx="9.7" cy="5.5" r="0.65" />
        <circle cx="3.4" cy="7.2" r="0.65" />
        <circle cx="5.9" cy="7.2" r="0.65" />
        <circle cx="8.4" cy="7.2" r="0.65" />
        <circle cx="2.2" cy="8.9" r="0.65" />
        <circle cx="4.7" cy="8.9" r="0.65" />
        <circle cx="7.2" cy="8.9" r="0.65" />
        <circle cx="9.7" cy="8.9" r="0.65" />
      </g>
    </svg>
  );
}

/**
 * Icone vetorial SVG da Bandeira do Brasil (para a opcao Portugues)
 */
export function FlagBR({ className = 'w-5 h-3.5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 20"
      className={`${className} rounded-[3px] border border-dark/80 shrink-0 shadow-[1px_1px_0px_#191A23]`}
      aria-label="Bandeira do Brasil"
    >
      {/* Fundo verde */}
      <rect width="28" height="20" fill="#009B3A" />
      {/* Losango amarelo */}
      <polygon points="14,2.2 25.5,10 14,17.8 2.5,10" fill="#FEDF00" />
      {/* Circulo azul central */}
      <circle cx="14" cy="10" r="4.2" fill="#002776" />
      {/* Faixa branca */}
      <path
        d="M10.1,8.9 C12.6,8.1 15.6,8.5 17.9,10.3"
        stroke="#FFFFFF"
        strokeWidth="1.15"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Traduz os titulos academicos salvos no banco de dados (que ficam como chave em PT)
 * para o idioma que o usuario escolheu na tela.
 */
export function traduzirTitulo(titulo: string | undefined, lang: Language): string {
  if (!titulo) return lang === 'en' ? 'Thermodynamics Novice' : 'Iniciante da Termodinâmica';
  if (lang === 'pt') return titulo;

  const mapa: Record<string, string> = {
    Iniciante: 'Novice',
    'Iniciante da Termodinâmica': 'Thermodynamics Novice',
    'Aprendiz de Cinética': 'Kinetics Apprentice',
    'Pesquisador de Gases': 'Gas Researcher',
    'Mestre da Termodinâmica': 'Thermodynamics Master',
    'Alquimista Quântico': 'Quantum Alchemist',
    'Cientista Sênior': 'Senior Scientist',
    'Prêmio Nobel da Físico-Química': 'Physical Chemistry Nobel Laureate',
  };
  return mapa[titulo] || titulo;
}

/**
 * Traduz o nome dos gases retornados pela API ou pelo motor local
 */
export function traduzirGas(nomeOuChave: string | undefined, lang: Language): string {
  if (!nomeOuChave) return lang === 'en' ? 'Argon' : 'Argônio';
  if (lang === 'pt') return nomeOuChave;

  const mapa: Record<string, string> = {
    Argônio: 'Argon',
    ARGONIO: 'Argon',
    Oxigênio: 'Oxygen',
    OXIGENIO: 'Oxygen',
    Nitrogênio: 'Nitrogen',
    NITROGENIO: 'Nitrogen',
    Hélio: 'Helium',
    HELIO: 'Helium',
    Hidrogênio: 'Hydrogen',
    HIDROGENIO: 'Hydrogen',
    'Gás Personalizado': 'Custom Gas',
    CUSTOM: 'Custom Gas',
    'Argônio (Ar)': 'Argon (Ar)',
    'Oxigênio (O₂)': 'Oxygen (O₂)',
    'Nitrogênio (N₂)': 'Nitrogen (N₂)',
    'Hélio (He)': 'Helium (He)',
    'Hidrogênio (H₂)': 'Hydrogen (H₂)',
  };
  return mapa[nomeOuChave] || nomeOuChave;
}

/**
 * Traduz o nivel de dificuldade das questoes
 */
export function traduzirNivel(nivel: string | undefined, lang: Language): string {
  if (!nivel) return '';
  if (lang === 'pt') {
    const mapaPt: Record<string, string> = {
      Beginner: 'Iniciante',
      Intermediate: 'Intermediário',
      Advanced: 'Avançado',
    };
    return mapaPt[nivel] || nivel;
  }
  const mapaEn: Record<string, string> = {
    Iniciante: 'Beginner',
    Intermediário: 'Intermediate',
    Avançado: 'Advanced',
  };
  return mapaEn[nivel] || nivel;
}

/**
 * Traduz o codigo do modulo dos exercicios
 */
export function traduzirModulo(modulo: string | undefined, lang: Language): string {
  if (!modulo) return '';
  if (lang === 'pt') {
    const mapaPt: Record<string, string> = {
      CINETICA: 'CINÉTICA',
      MAXWELL: 'MAXWELL',
      DSC: 'DSC',
      AVANCADO: 'AVANÇADO',
    };
    return mapaPt[modulo] || modulo;
  }
  const mapaEn: Record<string, string> = {
    CINETICA: 'KINETICS',
    MAXWELL: 'MAXWELL',
    DSC: 'DSC',
    AVANCADO: 'ADVANCED',
  };
  return mapaEn[modulo] || modulo;
}

interface I18nContextType {
  lang: Language;
  setLang: (novo: Language) => void;
  isEn: boolean;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  setLang: () => {},
  isEn: true,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => obterIdiomaAtual());

  const setLang = (novo: Language) => {
    setLangState(novo);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, novo);
    } catch {
      // ignora erro de storage
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang === 'en' ? 'en-US' : 'pt-BR';
    document.title =
      lang === 'en'
        ? 'Quantum Lab — Computational Physical Chemistry Platform'
        : 'Lab Quântico — Plataforma de Estudos em Físico-Química';
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, isEn: lang === 'en' }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

/**
 * Seletor de Idioma com as bandeiras dos EUA (English) e do Brasil (Portugues) em cada opcao!
 * Fiz como um dropdown Neo-Brutalista customizado pq a tag <option> nativa do HTML nao aceita
 * renderizar icones SVG coloridos dentro dela na maioria dos navegadores.
 */
export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useI18n();
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fecharAoClicarFora = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    };
    document.addEventListener('mousedown', fecharAoClicarFora);
    return () => document.removeEventListener('mousedown', fecharAoClicarFora);
  }, []);

  const opcoes: Array<{
    codigo: Language;
    rotulo: string;
    rotuloCurto: string;
    pais: string;
    Flag: React.ComponentType<{ className?: string }>;
  }> = [
    {
      codigo: 'en',
      rotulo: 'English (US)',
      rotuloCurto: 'EN',
      pais: 'United States',
      Flag: FlagUS,
    },
    {
      codigo: 'pt',
      rotulo: 'Português (BR)',
      rotuloCurto: 'PT',
      pais: 'Brasil',
      Flag: FlagBR,
    },
  ];

  const atual = opcoes.find(o => o.codigo === lang) || opcoes[0];
  const FlagAtual = atual.Flag;

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        title={lang === 'en' ? 'Select Language (EN / PT)' : 'Selecionar Idioma (EN / PT)'}
        className="flex items-center space-x-2 px-3 py-1.5 bg-white hover:bg-brand border-2 border-dark rounded-xl text-xs font-black text-dark uppercase tracking-wider shadow-neo-sm hover:shadow-neo hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 cursor-pointer select-none"
      >
        <FlagAtual className="w-5 h-3.5" />
        <span>{compact ? atual.rotuloCurto : atual.rotulo}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-dark stroke-[2.5] transition-transform duration-150 ${
            aberto ? 'rotate-180' : ''
          }`}
        />
      </button>

      {aberto && (
        <div
          role="listbox"
          aria-label={lang === 'en' ? 'Language options' : 'Opções de idioma'}
          className="absolute right-0 mt-2 w-48 bg-white border-3 border-dark rounded-2xl shadow-neo overflow-hidden z-[100] animate-scale-in"
        >
          {opcoes.map(op => {
            const IconeBandeira = op.Flag;
            const selecionado = op.codigo === lang;
            return (
              <button
                key={op.codigo}
                type="button"
                role="option"
                aria-selected={selecionado}
                onClick={() => {
                  setLang(op.codigo);
                  setAberto(false);
                }}
                className={`w-full px-3.5 py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                  selecionado
                    ? 'bg-brand text-dark border-b-2 border-dark/20 last:border-b-0'
                    : 'bg-white text-dark hover:bg-slate-100 border-b-2 border-dark/10 last:border-b-0'
                }`}
              >
                <span className="flex items-center space-x-2.5">
                  <IconeBandeira className="w-5 h-3.5" />
                  <span>{op.rotulo}</span>
                </span>
                {selecionado && <Check className="w-4 h-4 text-dark stroke-[3]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
