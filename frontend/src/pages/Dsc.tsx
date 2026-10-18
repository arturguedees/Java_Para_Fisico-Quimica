import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Flame,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  HelpCircle,
  Activity,
  Printer,
  Lightbulb,
  BarChart3,
  Download,
  LayoutGrid,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Navbar from '../components/Navbar';
import { obterDsc, ganharXpUsuarioApi, sanitizarUsuarioSemSenha } from '../services/api';
import { exportarDadosCsv, type ResultadoDsc } from '../services/motorCientifico';
import { useI18n } from '../i18n/i18n';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DscProps {
  embedded?: boolean;
  onUsuarioAtualizado?: (u: any) => void;
}

/**
 * Simulador de Calorimetria Exploratoria Diferencial (DSC) da Lisozima (HEWL).
 *
 * Comentario de dev junior:
 * Aqui a gente junta Biofisica Termodinamica com Calculo Numerico!
 * Como os 23 pontos experimentais da Lisozima tem espacamento nao-uniforme (2.5°C nas bordas
 * e 1.0°C perto do pico Tm = 65°C), nós interpolamos uma curva suave usando Spline Cubico Natural
 * (resolvendo o sistema tridiagonal pelo Algoritmo de Thomas) e integramos a entalpia (ΔH = ∫ ΔCp dT)
 * comparando a Regra do Trapezio com a Regra Composta de Simpson 1/3!
 */
export default function Dsc({ embedded = false, onUsuarioAtualizado }: DscProps) {
  const navigate = useNavigate();
  const { isEn } = useI18n();
  const [usuario, setUsuario] = useState<any>(null);

  // Controles de Janela de Integracao
  const [tMin, setTMin] = useState<number>(40.0);
  const [tMax, setTMax] = useState<number>(90.0);

  // Dados
  const [dadosAnalise, setDadosAnalise] = useState<ResultadoDsc | null>(null);
  const [dadosGrafico, setDadosGrafico] = useState<any>(null);

  // Desafio
  const [respostaUsuario, setRespostaUsuario] = useState<string>('');
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro' | null; msg: string }>({
    tipo: null,
    msg: '',
  });
  const [resolvido, setResolvido] = useState<boolean>(false);

  useEffect(() => {
    const data = localStorage.getItem('usuario');
    if (!data && !embedded) {
      navigate('/login');
    } else if (data) {
      const u = sanitizarUsuarioSemSenha(JSON.parse(data));
      setUsuario(u);
      if (u.exerciciosResolvidos && u.exerciciosResolvidos.includes('dsc_lab_01')) {
        setResolvido(true);
      }
    }
  }, [navigate, embedded]);

  useEffect(() => {
    carregarDsc();
  }, [tMin, tMax, isEn]);

  const carregarDsc = async () => {
    const { dados } = await obterDsc(tMin, tMax);
    setDadosAnalise(dados);

    const serieSpline = dados.curvaTemperatura.map((t, i) => ({
      x: t,
      y: dados.curvaCp[i],
    }));

    const serieAreaIntegrada = dados.curvaTemperatura.map((t, i) => ({
      x: t,
      y: t >= dados.tMinIntegracao && t <= dados.tMaxIntegracao ? dados.curvaCp[i] : null,
    }));

    const serieDiscretos = dados.pontosDiscretosTemperatura.map((t, i) => ({
      x: t,
      y: dados.pontosDiscretosCp[i],
    }));

    const pontoPicoTm = [
      { x: dados.temperaturaTransicaoTm, y: dados.capacidadeCalorificaMaxima },
    ];

    setDadosGrafico({
      datasets: [
        {
          label: isEn
            ? 'Natural Cubic Spline ΔCp (kJ/(mol·K))'
            : 'Spline Cúbico Natural ΔCp (kJ/(mol·K))',
          data: serieSpline,
          borderColor: '#e11d48',
          backgroundColor: 'transparent',
          fill: false,
          pointRadius: 0,
          borderWidth: 3,
          tension: 0.25,
        },
        {
          label: isEn
            ? `Integrated Area ΔH [${dados.tMinIntegracao.toFixed(0)}°C - ${dados.tMaxIntegracao.toFixed(
                0
              )}°C]: ${dados.entalpiaSimpsonSpline.toFixed(2)} kJ/mol`
            : `Área Integrada ΔH [${dados.tMinIntegracao.toFixed(0)}°C - ${dados.tMaxIntegracao.toFixed(
                0
              )}°C]: ${dados.entalpiaSimpsonSpline.toFixed(2)} kJ/mol`,
          data: serieAreaIntegrada,
          borderColor: 'rgba(225, 29, 72, 0.4)',
          backgroundColor: 'rgba(225, 29, 72, 0.20)',
          fill: true,
          pointRadius: 0,
          borderWidth: 1,
          tension: 0.25,
        },
        {
          label: isEn
            ? 'Experimental HEWL Data (23 points)'
            : 'Dados Experimentais HEWL (23 pontos)',
          data: serieDiscretos,
          borderColor: '#191A23',
          backgroundColor: '#ffffff',
          pointRadius: 4.5,
          pointHoverRadius: 7,
          pointBorderWidth: 2,
          showLine: false,
        },
        {
          label: isEn
            ? `Transition Peak Tm (${dados.temperaturaTransicaoTm.toFixed(1)} °C)`
            : `Pico de Transição Tm (${dados.temperaturaTransicaoTm.toFixed(1)} °C)`,
          data: pontoPicoTm,
          borderColor: '#191A23',
          backgroundColor: '#facc15',
          pointRadius: 8,
          pointHoverRadius: 10,
          pointBorderWidth: 2.5,
          showLine: false,
        },
      ],
    });
  };

  const handleExportarCsv = () => {
    if (!dadosAnalise) return;
    const linhas = dadosAnalise.pontosDiscretosTemperatura.map((t, i) => [
      t,
      dadosAnalise.pontosDiscretosCp[i],
    ]);
    exportarDadosCsv(
      'calorimetria_dsc_lisozima_hewl.csv',
      ['Temperatura_Celsius', 'Delta_Cp_kJ_mol_K'],
      linhas
    );
  };

  const verificarDesafio = async () => {
    if (!respostaUsuario.trim()) return;

    const valor = parseFloat(respostaUsuario);
    if (isNaN(valor)) {
      setFeedback({
        tipo: 'erro',
        msg: isEn ? 'Please enter a valid number.' : 'Digite um número válido.',
      });
      return;
    }

    if (!dadosAnalise) return;

    const tmEsperado = dadosAnalise.temperaturaTransicaoTm;
    const erro = Math.abs((valor - tmEsperado) / tmEsperado);

    if (erro <= 0.03) {
      const jaResolvidoAntes = resolvido;
      setResolvido(true);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.7 },
        });
      } catch {
        // ignore
      }

      setFeedback({
        tipo: 'sucesso',
        msg: jaResolvidoAntes
          ? isEn
            ? `Correct! The Lysozyme thermal denaturation peak Tm occurs at exactly ${tmEsperado.toFixed(1)} °C.`
            : `Correto! O pico de desnaturação térmica Tm da Lisozima ocorre exatamente a ${tmEsperado.toFixed(1)} °C.`
          : isEn
          ? `Extraordinary! The Lysozyme denaturation peak Tm occurs at ${tmEsperado.toFixed(1)} °C. You earned +85 XP and +85 Coins!`
          : `Extraordinário! O pico de desnaturação Tm da Lisozima ocorre a ${tmEsperado.toFixed(1)} °C. Você ganhou +85 XP e +85 Moedas!`,
      });

      if (usuario && !jaResolvidoAntes) {
        try {
          const atualizado = sanitizarUsuarioSemSenha(
            await ganharXpUsuarioApi(usuario.id, 85, 'dsc_lab_01')
          );
          setUsuario(atualizado);
          localStorage.setItem('usuario', JSON.stringify(atualizado));
          if (onUsuarioAtualizado) onUsuarioAtualizado(atualizado);
        } catch (e) {
          console.error('Erro ao pontuar', e);
        }
      }
    } else {
      setFeedback({
        tipo: 'erro',
        msg: isEn
          ? 'Incorrect value. Study tip: look at the yellow marker at the top of the ΔCp curve (10.80 kJ/(mol·K) at T = 65.0 °C).'
          : 'Valor incorreto. Dica de estudo: observe o marcador amarelo no topo da curva de ΔCp (10.80 kJ/(mol·K) em T = 65.0 °C).',
      });
    }
  };

  const difPercentual =
    dadosAnalise && dadosAnalise.entalpiaSimpsonSpline > 0
      ? (Math.abs(dadosAnalise.entalpiaSimpsonSpline - dadosAnalise.entalpiaTrapezio) /
          dadosAnalise.entalpiaSimpsonSpline) *
        100.0
      : 0.0;

  const conteudo = (
    <div className="space-y-8">
      {!embedded && (
        <div className="flex items-center justify-between">
          <Link
            to="/formulas"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white border-2 border-dark rounded-xl text-xs font-black uppercase tracking-wider text-dark shadow-neo-sm hover:bg-brand transition-all"
          >
            <LayoutGrid className="w-4 h-4 stroke-[2.5]" />
            <span>
              {isEn ? '← Back to All Formula Blocks' : '← Voltar para Todos os Blocos de Fórmulas'}
            </span>
          </Link>
        </div>
      )}

      {/* Cabecalho */}
      <div className="quantum-card bg-brand p-6 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-neo">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-white border-4 border-dark text-dark flex items-center justify-center shadow-neo-sm transform hover:rotate-6 transition-all shrink-0">
            <Flame className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-dark text-white border-2 border-dark rounded-md text-xs font-black uppercase tracking-widest shadow-neo-sm">
              <Activity className="w-4 h-4 stroke-[3]" />
              <span>
                {isEn
                  ? 'BLOCK 04 • THERMAL ANALYSIS & DSC CALORIMETRY'
                  : 'BLOCO 04 • ANÁLISE TÉRMICA & CALORIMETRIA DSC'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-dark tracking-tighter uppercase font-display leading-tight">
              {isEn
                ? 'Differential Scanning Calorimetry'
                : 'Calorimetria Exploratória Diferencial'}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-widest">
          <button
            onClick={handleExportarCsv}
            className="px-4 py-3 bg-white hover:bg-brand-light border-4 border-dark text-dark shadow-neo-sm hover:-translate-y-0.5 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>{isEn ? 'Export CSV' : 'Exportar CSV'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-3 bg-white hover:bg-yellow-300 border-4 border-dark text-dark shadow-neo-sm hover:-translate-y-0.5 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>{isEn ? 'PDF Report' : 'Relatório PDF'}</span>
          </button>
          <span className="px-4 py-3 bg-white border-4 border-dark text-dark shadow-neo-sm">
            {isEn ? 'Lysozyme (HEWL)' : 'Lisozima (HEWL)'}
          </span>
        </div>
      </div>

      {/* Grade de Trabalho */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Painel de Resultados e Controles de Integracao */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border-4 border-dark rounded-3xl p-6 space-y-5 shadow-neo">
            <h2 className="text-lg font-black uppercase text-dark border-b-2 border-dark/20 pb-3 font-display">
              {isEn ? 'Thermodynamic Integration' : 'Integração Termodinâmica'}
            </h2>

            {dadosAnalise ? (
              <div className="space-y-4 text-xs">
                {/* Tm */}
                <div className="p-5 bg-rose-200 border-3 border-dark rounded-2xl space-y-1 shadow-neo-sm">
                  <span className="text-dark font-black uppercase text-xs block">
                    {isEn ? 'Thermal Transition Peak (Tm)' : 'Pico de Transição Térmica (Tm)'}
                  </span>
                  <span className="text-4xl text-dark font-black block font-display">
                    {dadosAnalise.temperaturaTransicaoTm.toFixed(1)} °C
                  </span>
                  <span className="text-dark/80 font-mono font-bold text-xs block">
                    {isEn
                      ? `Equivalent to ${(dadosAnalise.temperaturaTransicaoTm + 273.15).toFixed(2)} K`
                      : `Equivalente a ${(dadosAnalise.temperaturaTransicaoTm + 273.15).toFixed(2)} K`}
                  </span>
                </div>

                {/* Sliders de Janela de Integracao [Tmin, Tmax] */}
                <div className="p-4 bg-slate-50 border-2 border-dark rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black uppercase text-dark">
                      {isEn ? 'Integration Window' : 'Janela de Integração'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setTMin(40);
                        setTMax(90);
                      }}
                      className="text-[10px] font-black uppercase bg-white px-2 py-0.5 border border-dark rounded hover:bg-brand cursor-pointer"
                    >
                      {isEn ? 'Reset [40–90°C]' : 'Resetar [40–90°C]'}
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>{isEn ? 'Lower Bound (T₁):' : 'Limite Inferior (T₁):'}</span>
                      <span className="font-mono bg-white px-1.5 border border-dark rounded">
                        {tMin.toFixed(1)} °C
                      </span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="63"
                      step="0.5"
                      value={tMin}
                      onChange={e => setTMin(parseFloat(e.target.value))}
                      className="w-full accent-dark h-2 bg-slate-200 border border-dark rounded cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>{isEn ? 'Upper Bound (T₂):' : 'Limite Superior (T₂):'}</span>
                      <span className="font-mono bg-white px-1.5 border border-dark rounded">
                        {tMax.toFixed(1)} °C
                      </span>
                    </div>
                    <input
                      type="range"
                      min="67"
                      max="90"
                      step="0.5"
                      value={tMax}
                      onChange={e => setTMax(parseFloat(e.target.value))}
                      className="w-full accent-dark h-2 bg-slate-200 border border-dark rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Comparativo de Integracao */}
                <div className="space-y-2.5 bg-brand/30 p-4 rounded-2xl border-2 border-dark">
                  <span className="text-dark font-black uppercase block pb-1 tracking-wider text-xs">
                    {isEn ? 'Calorimetric Enthalpy (ΔH_cal)' : 'Entalpia Calorimétrica (ΔH_cal)'}
                  </span>

                  <div className="flex justify-between py-1.5 border-b-2 border-dark/20 font-black uppercase text-xs items-center">
                    <span className="text-dark/70">
                      {isEn ? 'Trapezoidal Rule:' : 'Regra do Trapézio:'}
                    </span>
                    <span className="text-dark font-mono bg-white px-2 py-0.5 border border-dark rounded shadow-neo-sm">
                      {dadosAnalise.entalpiaTrapezio.toFixed(2)} kJ/mol
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b-2 border-dark/20 font-black uppercase text-xs items-center">
                    <span className="text-dark/70">
                      {isEn ? "Simpson's 1/3 (Spline):" : 'Simpson 1/3 (Spline):'}
                    </span>
                    <span className="text-dark font-mono bg-yellow-300 px-2 py-0.5 border border-dark rounded shadow-neo-sm">
                      {dadosAnalise.entalpiaSimpsonSpline.toFixed(2)} kJ/mol
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-dark/15 text-dark text-xs font-black uppercase items-center">
                    <span>{isEn ? 'Numerical Divergence:' : 'Divergência Numérica:'}</span>
                    <span className="font-mono bg-white px-2 py-0.5 border border-dark rounded">
                      {difPercentual.toFixed(3)}%
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-dark/15 text-dark text-xs font-black uppercase items-center">
                    <span>{isEn ? "Van 't Hoff Enthalpy (ΔH_vH):" : "Entalpia Van 't Hoff (ΔH_vH):"}</span>
                    <span className="font-mono bg-white px-2 py-0.5 border border-dark rounded">
                      {dadosAnalise.entalpiaVantHoff.toFixed(2)} kJ/mol
                    </span>
                  </div>

                  <div className="flex justify-between py-1 text-dark text-xs font-black uppercase items-center">
                    <span>{isEn ? 'Max Peak ΔCp:' : 'Pico Máximo ΔCp:'}</span>
                    <span className="font-mono bg-white px-2 py-0.5 border border-dark rounded">
                      {dadosAnalise.capacidadeCalorificaMaxima.toFixed(2)} kJ/(mol·K)
                    </span>
                  </div>
                </div>

                <p className="text-xs text-dark/80 leading-relaxed pt-1 font-medium bg-white p-3 border-2 border-dark rounded-xl shadow-neo-sm flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-dark flex-shrink-0 mt-0.5" />
                  <span>
                    {isEn ? (
                      <>
                        <strong>Core Concept:</strong> The integral{' '}
                        <code className="font-mono font-bold">ΔH = ∫ ΔCp dT</code> measures the total thermal energy required to break the intramolecular bonds of Lysozyme during denaturation.
                      </>
                    ) : (
                      <>
                        <strong>Conceito Fundamental:</strong> A integral{' '}
                        <code className="font-mono font-bold">ΔH = ∫ ΔCp dT</code> mede a energia
                        necessária para romper as ligações intramoleculares da Lisozima durante a
                        desnaturação térmica.
                      </>
                    )}
                  </span>
                </p>
              </div>
            ) : (
              <div className="text-xs text-slate-500">
                {isEn ? 'Loading thermal data...' : 'Carregando dados térmicos...'}
              </div>
            )}
          </div>
        </div>

        {/* Grafico */}
        <div className="lg:col-span-8 quantum-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-neo">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-dark/10 pb-3 mb-4">
              <h3 className="text-lg font-extrabold text-dark uppercase font-display">
                {isEn
                  ? 'Thermal Denaturation Thermogram (HEWL)'
                  : 'Termograma de Desnaturação Térmica (HEWL)'}
              </h3>
              <span className="text-xs font-black px-3 py-1 bg-rose-100 text-dark rounded-lg border-2 border-dark shadow-neo-sm font-mono">
                ΔH = ∫ ΔCp dT • [{tMin.toFixed(0)}°C {isEn ? 'to' : 'a'} {tMax.toFixed(0)}°C]
              </span>
            </div>

            <div className="relative w-full h-80 sm:h-96 min-h-[320px]">
              {dadosGrafico ? (
                <Line
                  data={dadosGrafico}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    resizeDelay: 100,
                    animation: { duration: 0 },
                    scales: {
                      x: {
                        type: 'linear',
                        min: 40,
                        max: 90,
                        grid: { color: 'rgba(226, 232, 240, 0.8)' },
                        ticks: { color: '#334155', font: { family: 'JetBrains Mono', size: 11 } },
                        title: {
                          display: true,
                          text: isEn ? 'Temperature T (°C)' : 'Temperatura T (°C)',
                          color: '#191A23',
                          font: { weight: 'bold', size: 12 },
                        },
                      },
                      y: {
                        type: 'linear',
                        min: 0,
                        max: 12,
                        grid: { color: 'rgba(226, 232, 240, 0.8)' },
                        ticks: { color: '#334155', font: { family: 'JetBrains Mono', size: 11 } },
                        title: {
                          display: true,
                          text: isEn
                            ? 'Excess ΔCp (kJ·mol⁻¹·K⁻¹)'
                            : 'ΔCp em Excesso (kJ·mol⁻¹·K⁻¹)',
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
                      tooltip: {
                        backgroundColor: '#191A23',
                        titleColor: '#BFFF00',
                        bodyColor: '#ffffff',
                        padding: 10,
                        cornerRadius: 10,
                      },
                    },
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                  {isEn ? 'Calculating calorimetry curve...' : 'Calculando curva de calorimetria...'}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border-2 border-dark/20 text-xs text-dark flex items-start gap-2">
            <BarChart3 className="w-4 h-4 text-dark flex-shrink-0 mt-0.5" />
            <span>
              {isEn ? (
                <>
                  <strong>High-Precision Integration:</strong> Since the 23 experimental points have non-uniform spacing (2.5°C at the edges and 1.0°C near the peak Tm = 65°C), the engine builds a <strong>Natural Cubic Spline</strong> ($C^2$ continuous) before integrating via Composite Simpson&apos;s 1/3 Rule.
                </>
              ) : (
                <>
                  <strong>Integração de Alta Precisão:</strong> Como os 23 pontos experimentais têm
                  espaçamento variável (2.5°C nas bordas e 1.0°C perto do pico Tm = 65°C), o sistema
                  constrói um <strong>Spline Cúbico Natural</strong> ($C^2$ contínuo) antes de integrar
                  pela Regra Composta de Simpson 1/3.
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Exercicio de Fixacao */}
      <section className="quantum-card rounded-3xl p-6 sm:p-8 space-y-4 shadow-neo">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-dark/15 pb-3">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-dark stroke-[2.5]" />
            <h3 className="text-xl font-black text-dark uppercase font-display">
              {isEn
                ? 'Quick Challenge: Transition Temperature (Tm)'
                : 'Desafio Rápido: Temperatura de Transição (Tm)'}
            </h3>
          </div>
          <span className="text-xs font-black text-dark bg-yellow-300 px-3.5 py-1 rounded-full border-2 border-dark shadow-neo-sm">
            {isEn ? 'REWARD: +85 XP & COINS' : 'RECOMPENSA: +85 XP & MOEDAS'}
          </span>
        </div>

        <p className="text-sm text-dark/90 font-medium leading-relaxed">
          {isEn ? (
            <>
              Based on the experimental Lysozyme (HEWL) curve above, at what{' '}
              <strong>Transition Temperature (Tm in °C)</strong> does the maximum heat capacity peak (ΔCp = 10.80 kJ/(mol·K)) occur?
            </>
          ) : (
            <>
              Com base na curva experimental da Lisozima (HEWL) acima, em qual{' '}
              <strong>Temperatura de Transição (Tm em °C)</strong> ocorre o pico máximo de absorção de
              calor (ΔCp = 10.80 kJ/(mol·K))?
            </>
          )}
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <input
            type="number"
            step="0.5"
            value={respostaUsuario}
            onChange={e => setRespostaUsuario(e.target.value)}
            placeholder={isEn ? 'Enter temperature (e.g., 65.0)' : 'Digite a temperatura (ex: 65.0)'}
            className="px-4 py-3 bg-white border-3 border-dark rounded-xl text-sm text-dark font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand sm:w-72 shadow-neo-sm"
          />
          <button
            onClick={verificarDesafio}
            disabled={!respostaUsuario}
            className="btn-quantum-primary px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider disabled:opacity-50 flex items-center justify-center space-x-2 shadow-neo-sm cursor-pointer"
          >
            <span>
              {resolvido
                ? isEn
                  ? 'Test New Value'
                  : 'Testar Novo Valor'
                : isEn
                ? 'Submit Answer'
                : 'Confirmar Resposta'}
            </span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {feedback.tipo && (
          <div
            className={`p-4 rounded-2xl border-3 border-dark text-sm font-bold flex items-center space-x-3 animate-slide-up shadow-neo-sm ${
              feedback.tipo === 'sucesso' ? 'bg-brand text-dark' : 'bg-rose-300 text-dark'
            }`}
          >
            {feedback.tipo === 'sucesso' ? (
              <CheckCircle2 className="w-5 h-5 text-dark flex-shrink-0 stroke-[2.5]" />
            ) : (
              <AlertCircle className="w-5 h-5 text-dark flex-shrink-0 stroke-[2.5]" />
            )}
            <span>{feedback.msg}</span>
          </div>
        )}
      </section>
    </div>
  );

  if (embedded) {
    return conteudo;
  }

  return (
    <div className="min-h-screen pb-24">
      <Navbar usuario={usuario} />
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-10">{conteudo}</main>
    </div>
  );
}
