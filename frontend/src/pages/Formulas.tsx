import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  FlaskConical,
  Wind,
  Flame,
  Zap,
  Atom,
  ArrowRight,
  Calculator,
  Sparkles,
  Download,
  CheckCircle2,
  LayoutGrid,
  ChevronDown,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Cinetica from './Cinetica';
import Maxwell from './Maxwell';
import Dsc from './Dsc';
import {
  calcularTermodinamicaLocal,
  exportarDadosCsv,
} from '../services/motorCientifico';
import { sanitizarUsuarioSemSenha } from '../services/api';
import { useI18n } from '../i18n/i18n';

/**
 * Aba Central Unificada de Formulas e Simulacoes!
 *
 * Comentario de dev junior:
 * Eu concentrei aqui os 5 blocos de equacoes da Fisico-Quimica (Cinetica, Maxwell-Boltzmann,
 * Energia de Ativacao, Calorimetria DSC e Termodinamica/Gases Ideais/Gibbs/Arrhenius).
 * Usando query params (?bloco=cinetica), o aluno consegue compartilhar o link direto para
 * a calculadora que esta estudando, e toda a interface se adapta automaticamente entre
 * Ingles (padrao) e Portugues!
 */
export type BlocoFormulaId = 'cinetica' | 'maxwell' | 'energia' | 'dsc' | 'termodinamica';

interface BlocoFormulaDef {
  id: BlocoFormulaId;
  numeroPt: string;
  numeroEn: string;
  nomePt: string;
  nomeEn: string;
  subtituloPt: string;
  subtituloEn: string;
  tagPt: string;
  tagEn: string;
  descricaoPt: string;
  descricaoEn: string;
  equacoes: string[];
  icone: any;
  cardClass: string;
  textClass: string;
  badgeClass: string;
}

export const BLOCOS_FORMULAS: BlocoFormulaDef[] = [
  {
    id: 'cinetica',
    numeroPt: 'BLOCO 01',
    numeroEn: 'BLOCK 01',
    nomePt: 'Cinética Química (Ordem 0 e 1)',
    nomeEn: 'Chemical Kinetics (0th & 1st Order)',
    subtituloPt: 'Velocidade de Reação & Meia-Vida',
    subtituloEn: 'Reaction Rate & Half-Life',
    tagPt: 'Decaimento Temporal',
    tagEn: 'Time Decay',
    descricaoPt:
      'Calcule a evolução temporal de reagentes [A] e produtos [B], meias-vidas (1ª, 2ª, 3ª t½), tempo de exaustão total e tempo de vida químico (e-folding τ).',
    descricaoEn:
      'Calculate the time evolution of reactants [A] and products [B], half-lives (1st, 2nd, 3rd t½), total exhaustion time, and chemical lifetime (e-folding τ).',
    equacoes: ['[A](t) = [A]₀ · e⁻ᵏᵗ', '[A](t) = max(0, [A]₀ - kt)', 't₁/₂ = ln(2)/k', 'τ = 1/k'],
    icone: FlaskConical,
    cardClass: 'quantum-card',
    textClass: 'text-dark',
    badgeClass: 'bg-brand text-dark border-dark',
  },
  {
    id: 'maxwell',
    numeroPt: 'BLOCO 02',
    numeroEn: 'BLOCK 02',
    nomePt: 'Distribuição de Maxwell-Boltzmann',
    nomeEn: 'Maxwell-Boltzmann Distribution',
    subtituloPt: 'Velocidades Moleculares & Som nos Gases',
    subtituloEn: 'Molecular Speeds & Speed of Sound',
    tagPt: 'Teoria Cinética',
    tagEn: 'Kinetic Theory',
    descricaoPt:
      'Simule a densidade de probabilidade f(v), velocidades notáveis (v_mp, v_m, v_rms), velocidade do som (c), integral em intervalo [v₁, v₂] e comparação de 5 gases.',
    descricaoEn:
      'Simulate probability density f(v), characteristic speeds (v_mp, v_m, v_rms), speed of sound (c), interval integral [v₁, v₂], and 5-gas comparison.',
    equacoes: ['v_mp = √(2RT/M)', 'v_m = √(8RT/πM)', 'v_rms = √(3RT/M)', 'c = √(γRT/M)'],
    icone: Wind,
    cardClass: 'quantum-card',
    textClass: 'text-dark',
    badgeClass: 'bg-cyan-200 text-dark border-dark',
  },
  {
    id: 'energia',
    numeroPt: 'BLOCO 03',
    numeroEn: 'BLOCK 03',
    nomePt: 'Energia Cinética & Ativação (Ea)',
    nomeEn: 'Kinetic Energy & Activation (Ea)',
    subtituloPt: 'Distribuição f(E) & Fração Reativa',
    subtituloEn: 'f(E) Distribution & Reactive Fraction',
    tagPt: 'Barreira Térmica',
    tagEn: 'Thermal Barrier',
    descricaoPt:
      'Analise a distribuição de energia translacional f(E) e integre numericamente por Simpson 1/3 a fração de moléculas que superam a Energia de Ativação (E ≥ Ea).',
    descricaoEn:
      "Analyze the translational energy distribution f(E) and numerically integrate via Simpson's 1/3 rule the fraction of molecules overcoming Activation Energy (E ≥ Ea).",
    equacoes: ['f(E) = 2√(E/π)(1/RT)³ᐟ²·e⁻ᴱ/ᴿᵀ', 'f(E ≥ Ea) = ∫ f(E) dE'],
    icone: Zap,
    cardClass: 'quantum-card',
    textClass: 'text-dark',
    badgeClass: 'bg-yellow-300 text-dark border-dark',
  },
  {
    id: 'dsc',
    numeroPt: 'BLOCO 04',
    numeroEn: 'BLOCK 04',
    nomePt: 'Calorimetria DSC & Integração',
    nomeEn: 'DSC Calorimetry & Integration',
    subtituloPt: 'Desnaturação Térmica da Lisozima',
    subtituloEn: 'Lysozyme Thermal Denaturation',
    tagPt: 'Métodos Numéricos',
    tagEn: 'Numerical Methods',
    descricaoPt:
      'Interpolação por Spline Cúbico Natural dos 23 pontos experimentais da Lisozima (HEWL) e integração de entalpia (ΔH_cal) por Trapézio e Simpson 1/3 Composto.',
    descricaoEn:
      "Natural Cubic Spline interpolation of the 23 experimental Lysozyme (HEWL) points and enthalpy integration (ΔH_cal) via Trapezoidal and Composite Simpson's 1/3 rules.",
    equacoes: ['ΔH_cal = ∫ ΔCp dT', 'Simpson 1/3 + Spline', 'Tm = 65.0 °C'],
    icone: Flame,
    cardClass: 'quantum-card-dark',
    textClass: 'text-white',
    badgeClass: 'bg-brand text-dark border-white',
  },
  {
    id: 'termodinamica',
    numeroPt: 'BLOCO 05',
    numeroEn: 'BLOCK 05',
    nomePt: 'Gases Ideais, Gibbs & Arrhenius',
    nomeEn: 'Ideal Gases, Gibbs & Arrhenius',
    subtituloPt: 'Isotermas PV=nRT, ΔG° e Constante k(T)',
    subtituloEn: 'PV=nRT Isotherms, ΔG° & Rate Constant k(T)',
    tagPt: 'Equações Fundamentais',
    tagEn: 'Core Equations',
    descricaoPt:
      'Calculadora multifuncional das equações fundamentais: Lei dos Gases Ideais (PV = nRT), Energia Livre de Gibbs (ΔG° = ΔH° - TΔS° = -RT ln K) e Equação de Arrhenius.',
    descricaoEn:
      'Multifunctional calculator for core equations: Ideal Gas Law (PV = nRT), Gibbs Free Energy (ΔG° = ΔH° - TΔS° = -RT ln K), and the Arrhenius Equation.',
    equacoes: ['P·V = n·R·T', 'ΔG° = ΔH° - T·ΔS°', 'ΔG° = -R·T·ln(K)', 'k = A·e⁻ᴱᵃ/ᴿᵀ'],
    icone: Atom,
    cardClass: 'quantum-card',
    textClass: 'text-dark',
    badgeClass: 'bg-cyan-300 text-dark border-dark',
  },
];

export default function Formulas() {
  const navigate = useNavigate();
  const { isEn } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const [usuario, setUsuario] = useState<any>(null);
  const calculadoraRef = useRef<HTMLDivElement>(null);

  const blocoParam = searchParams.get('bloco') as BlocoFormulaId | null;
  const [blocoAtivo, setBlocoAtivo] = useState<BlocoFormulaId>(
    blocoParam && ['cinetica', 'maxwell', 'energia', 'dsc', 'termodinamica'].includes(blocoParam)
      ? blocoParam
      : 'cinetica'
  );
  const [mostrarGradeCompleta, setMostrarGradeCompleta] = useState<boolean>(true);

  // Estado do Bloco 05 (Termodinamica, Gases Ideais e Arrhenius)
  const [molsN, setMolsN] = useState<number>(2.0);
  const [tempGasK, setTempGasK] = useState<number>(350);
  const [volumeL, setVolumeL] = useState<number>(10.0);
  const [deltaHKJ, setDeltaHKJ] = useState<number>(-45.0);
  const [deltaSJ, setDeltaSJ] = useState<number>(-110.0);
  const [fatorA, setFatorA] = useState<number>(1000);
  const [eaArrheniusKJ, setEaArrheniusKJ] = useState<number>(25.0);
  const [abaTermoGrafico, setAbaTermoGrafico] = useState<'boyle' | 'arrhenius'>('boyle');

  useEffect(() => {
    const data = localStorage.getItem('usuario');
    if (!data) {
      navigate('/login');
    } else {
      setUsuario(sanitizarUsuarioSemSenha(JSON.parse(data)));
    }
  }, [navigate]);

  useEffect(() => {
    if (
      blocoParam &&
      ['cinetica', 'maxwell', 'energia', 'dsc', 'termodinamica'].includes(blocoParam)
    ) {
      setBlocoAtivo(blocoParam);
    }
  }, [blocoParam]);

  const selecionarBloco = (id: BlocoFormulaId, rolarParaCalculadora: boolean = true) => {
    setBlocoAtivo(id);
    setSearchParams({ bloco: id });
    if (rolarParaCalculadora && calculadoraRef.current) {
      setTimeout(() => {
        calculadoraRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  };

  const resultadoTermo = calcularTermodinamicaLocal(
    molsN,
    tempGasK,
    volumeL,
    deltaHKJ,
    deltaSJ,
    fatorA,
    eaArrheniusKJ
  );

  const dadosGraficoTermo =
    abaTermoGrafico === 'boyle'
      ? {
          datasets: [
            {
              label: isEn
                ? `Isotherm P(V) at ${tempGasK} K (n = ${molsN} mol)`
                : `Isoterma P(V) a ${tempGasK} K (n = ${molsN} mol)`,
              data: resultadoTermo.volumesLitros.map((v, i) => ({
                x: v,
                y: resultadoTermo.pressoesAtm[i],
              })),
              borderColor: '#4f46e5',
              backgroundColor: 'rgba(79, 70, 229, 0.12)',
              fill: true,
              pointRadius: 0,
              borderWidth: 3,
              tension: 0.25,
            },
            {
              label: isEn
                ? `Current State (V = ${volumeL} L, P = ${resultadoTermo.pressaoCalculadaAtm.toFixed(2)} atm)`
                : `Estado Atual (V = ${volumeL} L, P = ${resultadoTermo.pressaoCalculadaAtm.toFixed(2)} atm)`,
              data: [{ x: volumeL, y: resultadoTermo.pressaoCalculadaAtm }],
              borderColor: '#191A23',
              backgroundColor: '#facc15',
              pointRadius: 8,
              pointHoverRadius: 10,
              pointBorderWidth: 2.5,
              showLine: false,
            },
            {
              label: isEn ? 'Reference Isotherm (300 K)' : 'Isoterma Referência (300 K)',
              data: resultadoTermo.volumesLitros.map((v, i) => ({
                x: v,
                y: resultadoTermo.pressoesRef300KAtm[i],
              })),
              borderColor: '#94a3b8',
              backgroundColor: 'transparent',
              borderDash: [6, 4],
              pointRadius: 0,
              borderWidth: 2,
              tension: 0.25,
            },
          ],
        }
      : {
          datasets: [
            {
              label: isEn
                ? `Arrhenius Rate k(T) [Ea = ${eaArrheniusKJ} kJ/mol]`
                : `Taxa de Arrhenius k(T) [Ea = ${eaArrheniusKJ} kJ/mol]`,
              data: resultadoTermo.temperaturasArrhenius.map((t, i) => ({
                x: t,
                y: resultadoTermo.taxasArrhenius[i],
              })),
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.14)',
              fill: true,
              pointRadius: 0,
              borderWidth: 3,
              tension: 0.25,
            },
            {
              label: isEn
                ? `Point at T = ${tempGasK} K (k = ${resultadoTermo.taxaArrheniusK.toExponential(2)} s⁻¹)`
                : `Ponto em T = ${tempGasK} K (k = ${resultadoTermo.taxaArrheniusK.toExponential(2)} s⁻¹)`,
              data: [{ x: tempGasK, y: resultadoTermo.taxaArrheniusK }],
              borderColor: '#191A23',
              backgroundColor: '#facc15',
              pointRadius: 8,
              pointHoverRadius: 10,
              pointBorderWidth: 2.5,
              showLine: false,
            },
          ],
        };

  return (
    <div className="min-h-screen pb-24">
      <Navbar usuario={usuario} />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 space-y-10">
        {/* Cabecalho da Aba Unificada de Formulas */}
        <section className="quantum-card bg-brand p-6 sm:p-10 shadow-neo border-4 border-dark">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-white border-2 border-dark rounded-full text-xs font-black text-dark shadow-neo-sm uppercase tracking-widest">
                <Calculator className="w-4 h-4 text-dark stroke-[2.5]" />
                <span>
                  {isEn
                    ? 'UNIFIED SIMULATION & EQUATION HUB'
                    : 'CENTRAL UNIFICADA DE SIMULAÇÕES & EQUAÇÕES'}
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-dark tracking-tighter uppercase font-display leading-none">
                {isEn
                  ? 'Physical Chemistry Formulas & Calculators'
                  : 'Fórmulas & Cálculos Físico-Químicos'}
              </h1>
              <p className="text-dark/90 text-sm sm:text-base font-bold max-w-3xl leading-relaxed">
                {isEn ? (
                  <>
                    All formulas, scientific calculators, and interactive charts in one unified hub. Click any{' '}
                    <strong>Formula Block</strong> below to launch real-time calculations.
                  </>
                ) : (
                  <>
                    Todas as fórmulas, calculadoras científicas e gráficos interativos da plataforma reunidos em uma única aba. Clique em qualquer <strong>Bloco de Fórmula</strong> abaixo para abrir seus cálculos em tempo real.
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setMostrarGradeCompleta(!mostrarGradeCompleta)}
                className="px-4 py-3 bg-white hover:bg-yellow-300 border-3 border-dark rounded-xl text-xs font-black uppercase tracking-wider text-dark shadow-neo-sm flex items-center space-x-2 cursor-pointer transition-all"
              >
                <LayoutGrid className="w-4 h-4 stroke-[2.5]" />
                <span>
                  {mostrarGradeCompleta
                    ? isEn
                      ? 'Compact Blocks'
                      : 'Compactar Blocos'
                    : isEn
                    ? 'Expand Blocks'
                    : 'Expandir Blocos'}
                </span>
              </button>
            </div>
          </div>

          {/* Grade de Blocos de Formulas (Opcoes Clicaveis) */}
          {mostrarGradeCompleta ? (
            <div className="mt-8 pt-6 border-t-4 border-dark grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {BLOCOS_FORMULAS.map(bloco => {
                const Icon = bloco.icone;
                const isSelecionado = blocoAtivo === bloco.id;
                const numero = isEn ? bloco.numeroEn : bloco.numeroPt;
                const nome = isEn ? bloco.nomeEn : bloco.nomePt;
                const subtitulo = isEn ? bloco.subtituloEn : bloco.subtituloPt;
                const tag = isEn ? bloco.tagEn : bloco.tagPt;
                const descricao = isEn ? bloco.descricaoEn : bloco.descricaoPt;

                return (
                  <button
                    key={bloco.id}
                    type="button"
                    onClick={() => selecionarBloco(bloco.id, true)}
                    className={`text-left rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 cursor-pointer border-4 ${
                      isSelecionado
                        ? 'bg-dark text-white border-dark shadow-[6px_6px_0px_0px_#FFFFFF] -translate-y-1'
                        : 'bg-white text-dark border-dark shadow-neo hover:-translate-y-1 hover:shadow-neo-hover'
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Topo do Bloco */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[11px] font-black font-mono px-2.5 py-1 rounded border-2 ${
                            isSelecionado
                              ? 'bg-brand text-dark border-brand'
                              : 'bg-yellow-300 text-dark border-dark'
                          }`}
                        >
                          {numero}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border-2 ${
                            isSelecionado
                              ? 'bg-white/15 text-brand border-brand/60'
                              : 'bg-slate-100 text-dark border-dark'
                          }`}
                        >
                          {tag}
                        </span>
                      </div>

                      {/* Icone e Nome do Bloco */}
                      <div className="flex items-center space-x-3.5">
                        <div
                          className={`w-12 h-12 rounded-xl border-3 flex items-center justify-center shrink-0 shadow-neo-sm ${
                            isSelecionado
                              ? 'bg-brand text-dark border-white'
                              : 'bg-brand text-dark border-dark'
                          }`}
                        >
                          <Icon className="w-6 h-6 stroke-[2.5]" />
                        </div>
                        <div>
                          <h2
                            className={`text-lg sm:text-xl font-black uppercase font-display leading-tight ${
                              isSelecionado ? 'text-white' : 'text-dark'
                            }`}
                          >
                            {nome}
                          </h2>
                          <span
                            className={`text-xs font-bold block mt-0.5 ${
                              isSelecionado ? 'text-brand' : 'text-dark/70'
                            }`}
                          >
                            {subtitulo}
                          </span>
                        </div>
                      </div>

                      {/* Descricao */}
                      <p
                        className={`text-xs leading-relaxed font-medium ${
                          isSelecionado ? 'text-slate-200' : 'text-dark/80'
                        }`}
                      >
                        {descricao}
                      </p>

                      {/* Pilulas de Formulas do Bloco */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {bloco.equacoes.map((eq, i) => (
                          <span
                            key={i}
                            className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded border ${
                              isSelecionado
                                ? 'bg-white/10 text-brand border-white/25'
                                : 'bg-slate-100 text-dark border-dark/40'
                            }`}
                          >
                            {eq}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div
                      className={`mt-5 pt-3.5 border-t-2 flex items-center justify-between text-xs font-black uppercase tracking-widest ${
                        isSelecionado
                          ? 'border-white/20 text-brand'
                          : 'border-dark/15 text-dark'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {isSelecionado ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                            <span>{isEn ? 'OPEN BELOW' : 'BLOCO ABERTO ABAIXO'}</span>
                          </>
                        ) : (
                          <span>{isEn ? 'CLICK TO OPEN' : 'CLICAR PARA ACESSAR'}</span>
                        )}
                      </span>
                      {isSelecionado ? (
                        <ChevronDown className="w-4 h-4 stroke-[3] animate-bounce" />
                      ) : (
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : null}

          {/* Barra Rapida de Troca de Bloco */}
          <div className="mt-6 pt-5 border-t-4 border-dark flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-dark mr-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 fill-dark" />
              <span>{isEn ? 'Quick Block Switch:' : 'Acesso Rápido aos Blocos:'}</span>
            </span>
            {BLOCOS_FORMULAS.map(b => {
              const Icon = b.icone;
              const ativo = blocoAtivo === b.id;
              const nomeCurto = (isEn ? b.nomeEn : b.nomePt).split('(')[0].trim();
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => selecionarBloco(b.id, false)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider border-2 flex items-center space-x-2 transition-all cursor-pointer ${
                    ativo
                      ? 'bg-dark text-brand border-dark shadow-neo-sm scale-105'
                      : 'bg-white text-dark border-dark hover:bg-yellow-300 shadow-neo-sm'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{nomeCurto}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Area do Bloco Selecionado */}
        <div ref={calculadoraRef} className="scroll-mt-24">
          {blocoAtivo === 'cinetica' && (
            <Cinetica embedded onUsuarioAtualizado={u => setUsuario(u)} />
          )}

          {blocoAtivo === 'maxwell' && (
            <Maxwell
              embedded
              modoInicial="velocidade"
              onUsuarioAtualizado={u => setUsuario(u)}
            />
          )}

          {blocoAtivo === 'energia' && (
            <Maxwell
              embedded
              modoInicial="energia"
              onUsuarioAtualizado={u => setUsuario(u)}
            />
          )}

          {blocoAtivo === 'dsc' && (
            <Dsc embedded onUsuarioAtualizado={u => setUsuario(u)} />
          )}

          {blocoAtivo === 'termodinamica' && (
            <div className="space-y-8">
              {/* Cabecalho do Bloco 05 */}
              <div className="quantum-card bg-brand p-6 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-neo">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-white border-4 border-dark text-dark flex items-center justify-center shadow-neo-sm shrink-0">
                    <Atom className="w-8 h-8 stroke-[2.5]" />
                  </div>
                  <div className="space-y-2">
                    <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-dark text-white border-2 border-dark rounded-md text-xs font-black uppercase tracking-widest shadow-neo-sm">
                      <span>
                        {isEn
                          ? 'BLOCK 05 • IDEAL GASES, GIBBS & ARRHENIUS'
                          : 'BLOCO 05 • GASES IDEAIS, GIBBS & ARRHENIUS'}
                      </span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-dark tracking-tighter uppercase font-display leading-tight">
                      {isEn
                        ? 'Fundamental Equations & Thermodynamics'
                        : 'Equações Fundamentais & Termodinâmica'}
                    </h2>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-widest">
                  <button
                    type="button"
                    onClick={() => {
                      const linhas = resultadoTermo.volumesLitros.map((v, i) => [
                        v,
                        resultadoTermo.pressoesAtm[i],
                      ]);
                      exportarDadosCsv(
                        `isoterma_gas_ideal_${tempGasK}K.csv`,
                        ['Volume_L', 'Pressao_atm'],
                        linhas
                      );
                    }}
                    className="px-4 py-3 bg-white hover:bg-yellow-300 border-4 border-dark text-dark shadow-neo-sm flex items-center space-x-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>{isEn ? 'Export CSV' : 'Exportar CSV'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAbaTermoGrafico('boyle')}
                    className={`px-4 py-3 border-4 cursor-pointer ${
                      abaTermoGrafico === 'boyle'
                        ? 'btn-quantum-primary border-dark shadow-neo-sm'
                        : 'bg-white text-dark border-dark'
                    }`}
                  >
                    {isEn ? 'PV = nRT Isotherms' : 'Isotermas PV = nRT'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAbaTermoGrafico('arrhenius')}
                    className={`px-4 py-3 border-4 cursor-pointer ${
                      abaTermoGrafico === 'arrhenius'
                        ? 'bg-yellow-300 text-dark border-dark shadow-neo-sm'
                        : 'bg-white text-dark border-dark'
                    }`}
                  >
                    {isEn ? 'Arrhenius Rate k(T)' : 'Taxa de Arrhenius k(T)'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Controles do Bloco 05 */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-white border-4 border-dark rounded-3xl p-6 space-y-5 shadow-neo">
                    <h3 className="text-lg font-black uppercase text-dark border-b-2 border-dark/20 pb-3 font-display">
                      {isEn ? '1. Ideal Gases (P·V = n·R·T)' : '1. Gases Ideais (P·V = n·R·T)'}
                    </h3>

                    <div className="space-y-3 text-xs font-black uppercase">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>{isEn ? 'Amount of Substance (n):' : 'Quantidade de Matéria (n):'}</span>
                          <span className="font-mono bg-brand px-2 py-0.5 border border-dark rounded">
                            {molsN.toFixed(1)} mol
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="10.0"
                          step="0.5"
                          value={molsN}
                          onChange={e => setMolsN(parseFloat(e.target.value))}
                          className="w-full accent-dark h-2 bg-slate-200 border border-dark rounded cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span>{isEn ? 'Temperature (T):' : 'Temperatura (T):'}</span>
                          <span className="font-mono bg-yellow-300 px-2 py-0.5 border border-dark rounded">
                            {tempGasK} K
                          </span>
                        </div>
                        <input
                          type="range"
                          min="150"
                          max="900"
                          step="25"
                          value={tempGasK}
                          onChange={e => setTempGasK(parseInt(e.target.value))}
                          className="w-full accent-dark h-2 bg-slate-200 border border-dark rounded cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span>{isEn ? 'Vessel Volume (V):' : 'Volume do Recipiente (V):'}</span>
                          <span className="font-mono bg-slate-100 px-2 py-0.5 border border-dark rounded">
                            {volumeL.toFixed(1)} L
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1.0"
                          max="30.0"
                          step="0.5"
                          value={volumeL}
                          onChange={e => setVolumeL(parseFloat(e.target.value))}
                          className="w-full accent-dark h-2 bg-slate-200 border border-dark rounded cursor-pointer"
                        />
                      </div>

                      <div className="p-3.5 bg-brand/30 border-2 border-dark rounded-2xl space-y-2">
                        <div className="flex justify-between">
                          <span>{isEn ? 'Pressure P = nRT/V:' : 'Pressão P = nRT/V:'}</span>
                          <span className="font-mono bg-white px-2 py-0.5 border border-dark rounded">
                            {resultadoTermo.pressaoCalculadaAtm.toFixed(2)} atm (
                            {resultadoTermo.pressaoCalculadaKPa.toFixed(1)} kPa)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{isEn ? 'Molar Internal Energy (3/2 RT):' : 'Energia Interna Molar (3/2 RT):'}</span>
                          <span className="font-mono bg-white px-2 py-0.5 border border-dark rounded">
                            {(resultadoTermo.energiaInternaMolarJ / 1000).toFixed(2)} kJ/mol
                          </span>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-lg font-black uppercase text-dark border-b-2 border-dark/20 pb-3 pt-2 font-display">
                      {isEn
                        ? '2. Gibbs (ΔG° = ΔH° - TΔS°) & Arrhenius'
                        : '2. Gibbs (ΔG° = ΔH° - TΔS°) & Arrhenius'}
                    </h3>

                    <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                      <div>
                        <label className="block mb-1 uppercase font-black">ΔH° (kJ/mol)</label>
                        <input
                          type="number"
                          step="5"
                          value={deltaHKJ}
                          onChange={e => setDeltaHKJ(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-slate-50 border-2 border-dark rounded-xl font-mono font-black"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 uppercase font-black">ΔS° (J/(mol·K))</label>
                        <input
                          type="number"
                          step="5"
                          value={deltaSJ}
                          onChange={e => setDeltaSJ(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-slate-50 border-2 border-dark rounded-xl font-mono font-black"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 uppercase font-black">
                          {isEn ? 'Factor A (s⁻¹)' : 'Fator A (s⁻¹)'}
                        </label>
                        <input
                          type="number"
                          step="100"
                          value={fatorA}
                          onChange={e => setFatorA(Math.max(1, parseFloat(e.target.value) || 100))}
                          className="w-full px-3 py-2 bg-slate-50 border-2 border-dark rounded-xl font-mono font-black"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 uppercase font-black">Ea (kJ/mol)</label>
                        <input
                          type="number"
                          step="2"
                          value={eaArrheniusKJ}
                          onChange={e =>
                            setEaArrheniusKJ(Math.max(1, parseFloat(e.target.value) || 10))
                          }
                          className="w-full px-3 py-2 bg-slate-50 border-2 border-dark rounded-xl font-mono font-black"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-100 border-2 border-dark rounded-2xl space-y-2 text-xs font-black uppercase">
                      <div className="flex justify-between items-center">
                        <span>{isEn ? `Free Energy ΔG° (${tempGasK} K):` : `Energia Livre ΔG° (${tempGasK} K):`}</span>
                        <span
                          className={`font-mono px-2 py-0.5 border border-dark rounded ${
                            resultadoTermo.espontaneo ? 'bg-brand text-dark' : 'bg-rose-300 text-dark'
                          }`}
                        >
                          {resultadoTermo.deltaGPadraoKJ.toFixed(2)} kJ/mol (
                          {resultadoTermo.espontaneo
                            ? isEn
                              ? 'Spontaneous'
                              : 'Espontâneo'
                            : isEn
                            ? 'Non-Spontaneous'
                            : 'Não-Espontâneo'}
                          )
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>{isEn ? 'Equilibrium Constant K:' : 'Constante de Equilíbrio K:'}</span>
                        <span className="font-mono bg-white px-2 py-0.5 border border-dark rounded">
                          {resultadoTermo.constanteEquilibrioK.toExponential(3)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>{isEn ? 'Arrhenius Constant k(T):' : 'Constante de Arrhenius k(T):'}</span>
                        <span className="font-mono bg-dark text-white px-2 py-0.5 border border-dark rounded">
                          {resultadoTermo.taxaArrheniusK.toExponential(3)} s⁻¹
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grafico do Bloco 05 */}
                <div className="lg:col-span-7 quantum-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-neo">
                  <div>
                    <div className="flex items-center justify-between border-b-2 border-dark/10 pb-3 mb-4">
                      <h3 className="text-lg font-extrabold text-dark uppercase font-display">
                        {abaTermoGrafico === 'boyle'
                          ? isEn
                            ? 'Boyle-Mariotte Isotherm (Pressure vs. Volume)'
                            : 'Isoterma de Boyle-Mariotte (Pressão vs. Volume)'
                          : isEn
                          ? 'Arrhenius Exponential Growth k(T)'
                          : 'Crescimento Exponencial de Arrhenius k(T)'}
                      </h3>
                      <span className="text-xs font-black px-3 py-1 bg-brand border-2 border-dark rounded-lg font-mono">
                        T = {tempGasK} K
                      </span>
                    </div>

                    <div className="relative w-full h-80 sm:h-96 min-h-[320px]">
                      <Line
                        data={dadosGraficoTermo}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          resizeDelay: 100,
                          animation: { duration: 0 },
                          scales: {
                            x: {
                              type: 'linear',
                              grid: { color: 'rgba(226, 232, 240, 0.8)' },
                              ticks: {
                                color: '#334155',
                                font: { family: 'JetBrains Mono', size: 11 },
                              },
                              title: {
                                display: true,
                                text:
                                  abaTermoGrafico === 'boyle'
                                    ? isEn
                                      ? 'Volume V (Liters)'
                                      : 'Volume V (Litros)'
                                    : isEn
                                    ? 'Absolute Temperature T (K)'
                                    : 'Temperatura Absoluta T (K)',
                                color: '#191A23',
                                font: { weight: 'bold', size: 12 },
                              },
                            },
                            y: {
                              type: 'linear',
                              min: 0,
                              grid: { color: 'rgba(226, 232, 240, 0.8)' },
                              ticks: {
                                color: '#334155',
                                font: { family: 'JetBrains Mono', size: 11 },
                              },
                              title: {
                                display: true,
                                text:
                                  abaTermoGrafico === 'boyle'
                                    ? isEn
                                      ? 'Pressure P (atm)'
                                      : 'Pressão P (atm)'
                                    : isEn
                                    ? 'Rate Constant k (s⁻¹)'
                                    : 'Constante de Velocidade k (s⁻¹)',
                                color: '#191A23',
                                font: { weight: 'bold', size: 12 },
                              },
                            },
                          },
                          plugins: {
                            legend: {
                              display: true,
                              position: 'top',
                              labels: {
                                boxWidth: 12,
                                font: { family: 'Inter', size: 11, weight: 'bold' as const },
                                color: '#191A23',
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border-2 border-dark/20 text-xs text-dark font-mono flex flex-wrap items-center justify-between gap-2">
                    <span>P·V = n·R·T</span>
                    <span>ΔG° = ΔH° - T·ΔS° = -R·T·ln(K)</span>
                    <span>k(T) = A · e^(-Ea / RT)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
