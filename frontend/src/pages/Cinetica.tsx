import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Info,
  HelpCircle,
  Sparkles,
  Activity,
  Printer,
  Download,
  LayoutGrid,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Navbar from '../components/Navbar';
import { obterCinetica, ganharXpUsuarioApi, sanitizarUsuarioSemSenha } from '../services/api';
import { exportarDadosCsv, type ResultadoCinetica } from '../services/motorCientifico';
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

interface CineticaProps {
  embedded?: boolean;
  onVoltarBlocos?: () => void;
  onUsuarioAtualizado?: (u: any) => void;
}

/**
 * Simulador Interativo de Cinetica Quimica (Ordem 0 e 1ª Ordem).
 *
 * Comentario de dev junior:
 * Aqui eu implementei a visualizacao das leis integradas de velocidade que aprendemos
 * em Fisico-Quimica:
 * - Ordem Zero: [A](t) = max(0, [A]0 - k*t) -> decaimento linear ate exaustao!
 * - Primeira Ordem: [A](t) = [A]0 * e^(-k*t) -> decaimento exponencial com meia-vida constante!
 * Tambem inclui um desafio gamificado que valida a resposta do estudante com tolerancia
 * relativa de 6% e concede XP + moedas!
 */
export default function Cinetica({ embedded = false, onUsuarioAtualizado }: CineticaProps) {
  const navigate = useNavigate();
  const { isEn } = useI18n();
  const [usuario, setUsuario] = useState<any>(null);

  // Parametros de Simulacao
  const [ordem, setOrdem] = useState<number>(1);
  const [k, setK] = useState<number>(0.15);
  const [a0, setA0] = useState<number>(2.0);
  const [tempoMax, setTempoMax] = useState<number>(25);
  const [cenario, setCenario] = useState<string>('padrao');
  const [escalaFixaY, setEscalaFixaY] = useState<boolean>(true);

  // Dados calculados
  const [resultadoBruto, setResultadoBruto] = useState<ResultadoCinetica | null>(null);
  const [dadosGrafico, setDadosGrafico] = useState<any>(null);
  const [meiaVida, setMeiaVida] = useState<number | null>(null);
  const [tempoVida, setTempoVida] = useState<number | null>(null);
  const [segundaMeiaVida, setSegundaMeiaVida] = useState<number | null>(null);
  const [terceiraMeiaVida, setTerceiraMeiaVida] = useState<number | null>(null);
  const [tempoConsumoTotal, setTempoConsumoTotal] = useState<number | null>(null);

  // Desafio Embutido
  const [respostaUsuario, setRespostaUsuario] = useState<string>('');
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro' | null; msg: string }>({
    tipo: null,
    msg: '',
  });
  const [resolvido, setResolvido] = useState<boolean>(false);

  const aplicarCenario = (tipo: string) => {
    setCenario(tipo);
    setFeedback({ tipo: null, msg: '' });
    if (tipo === 'padrao') {
      setOrdem(1);
      setK(0.15);
      setA0(2.0);
      setTempoMax(25);
    } else if (tipo === 'ozonio') {
      setOrdem(1);
      setK(0.28);
      setA0(1.5);
      setTempoMax(20);
    } else if (tipo === 'poluente') {
      setOrdem(1);
      setK(0.04);
      setA0(3.0);
      setTempoMax(60);
    } else if (tipo === 'catalise_zero') {
      setOrdem(0);
      setK(0.12);
      setA0(3.0);
      setTempoMax(30);
    }
  };

  useEffect(() => {
    const data = localStorage.getItem('usuario');
    if (!data && !embedded) {
      navigate('/login');
    } else if (data) {
      const u = sanitizarUsuarioSemSenha(JSON.parse(data));
      setUsuario(u);
      if (u.exerciciosResolvidos && u.exerciciosResolvidos.includes('cin_lab_01')) {
        setResolvido(true);
      }
    }
  }, [navigate, embedded]);

  useEffect(() => {
    calcularCinetica();
  }, [ordem, k, a0, tempoMax, isEn]);

  const calcularCinetica = async () => {
    const { dados } = await obterCinetica(a0, k, ordem, tempoMax);
    setResultadoBruto(dados);
    setMeiaVida(dados.meiaVida);
    setTempoVida(dados.tempoVida ?? null);
    setSegundaMeiaVida(dados.segundaMeiaVida ?? null);
    setTerceiraMeiaVida(dados.terceiraMeiaVida ?? null);
    setTempoConsumoTotal(dados.tempoConsumoTotal ?? null);

    // Pontos XY reais para uso de escala linear precisa e marcacao exata da Meia-Vida (t½)
    const serieA = dados.tempo.map((t, i) => ({ x: t, y: dados.concentracaoA[i] }));
    const serieB = dados.tempo.map((t, i) => ({ x: t, y: dados.concentracaoB[i] }));
    const pontoMeiaVida =
      dados.meiaVida <= tempoMax
        ? [{ x: dados.meiaVida, y: a0 / 2.0 }]
        : [];

    setDadosGrafico({
      datasets: [
        {
          label: isEn ? '[A] Reactant (mol/L)' : '[A] Reagente (mol/L)',
          data: serieA,
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.14)',
          fill: true,
          pointRadius: 0,
          borderWidth: 3,
          tension: ordem === 0 ? 0 : 0.25,
        },
        {
          label: isEn ? '[B] Product (mol/L)' : '[B] Produto (mol/L)',
          data: serieB,
          borderColor: '#06b6d4',
          backgroundColor: 'transparent',
          borderDash: [6, 4],
          pointRadius: 0,
          borderWidth: 2.5,
          tension: ordem === 0 ? 0 : 0.25,
        },
        {
          label: isEn
            ? `Half-Life t½ (${dados.meiaVida.toFixed(2)} s, ${(a0 / 2).toFixed(2)} mol/L)`
            : `Meia-Vida t½ (${dados.meiaVida.toFixed(2)} s, ${(a0 / 2).toFixed(2)} mol/L)`,
          data: pontoMeiaVida,
          borderColor: '#191A23',
          backgroundColor: '#facc15',
          pointRadius: 7,
          pointHoverRadius: 9,
          pointBorderWidth: 2.5,
          showLine: false,
        },
      ],
    });
  };

  const handleExportarCsv = () => {
    if (!resultadoBruto) return;
    const linhas = resultadoBruto.tempo.map((t, idx) => [
      t,
      resultadoBruto.concentracaoA[idx],
      resultadoBruto.concentracaoB[idx],
    ]);
    exportarDadosCsv(
      `cinetica_ordem_${ordem}_k_${k}.csv`,
      ['Tempo_s', 'Concentracao_A_mol_L', 'Concentracao_B_mol_L'],
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

    if (!meiaVida) return;

    const erroRelativo = Math.abs((valor - meiaVida) / meiaVida);
    if (erroRelativo <= 0.06) {
      const jaResolvidoAntes = resolvido;
      setResolvido(true);
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // ignore
      }

      setFeedback({
        tipo: 'sucesso',
        msg: jaResolvidoAntes
          ? isEn
            ? `Correct! For these parameters, the half-life is ${meiaVida.toFixed(2)} seconds.`
            : `Correto! Para estes parâmetros, o tempo de meia-vida é ${meiaVida.toFixed(2)} segundos.`
          : isEn
          ? `Awesome! The calculated half-life is ${meiaVida.toFixed(2)} seconds. You earned +60 XP and +60 Coins!`
          : `Incrível! O tempo de meia-vida calculado é ${meiaVida.toFixed(2)} segundos. Você conquistou +60 XP e +60 Moedas!`,
      });

      if (usuario && !jaResolvidoAntes) {
        try {
          const atualizado = sanitizarUsuarioSemSenha(
            await ganharXpUsuarioApi(usuario.id, 60, 'cin_lab_01')
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
          ? `Incorrect. For order ${ordem} reaction: ${
              ordem === 1
                ? `use t½ = ln(2) / k = 0.6931 / ${k} ≈ ${(Math.LN2 / k).toFixed(2)} s`
                : `use t½ = [A]₀ / (2k) = ${a0} / (2 × ${k}) ≈ ${(a0 / (2 * k)).toFixed(2)} s`
            }.`
          : `Incorreto. Para reação de ordem ${ordem}: ${
              ordem === 1
                ? `use t½ = ln(2) / k = 0.6931 / ${k} ≈ ${(Math.LN2 / k).toFixed(2)} s`
                : `use t½ = [A]₀ / (2k) = ${a0} / (2 × ${k}) ≈ ${(a0 / (2 * k)).toFixed(2)} s`
            }.`,
      });
    }
  };

  const unidadeK = ordem === 0 ? 'mol/(L·s)' : 's⁻¹';

  const conteudo = (
    <div className="space-y-8">
      {/* Barra de retorno quando acessado via rota direta */}
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
            <FlaskConical className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-dark text-white border-2 border-dark rounded-md text-xs font-black uppercase tracking-widest shadow-neo-sm">
              <Activity className="w-4 h-4 stroke-[3]" />
              <span>{isEn ? 'BLOCK 01 • KINETIC STUDY' : 'BLOCO 01 • ESTUDO CINÉTICO'}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-dark tracking-tighter uppercase font-display leading-tight">
              {isEn ? 'Chemical Kinetics & Decay' : 'Cinética Química e Decaimento'}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-widest">
          <button
            onClick={handleExportarCsv}
            className="px-4 py-3 bg-white hover:bg-brand-light border-4 border-dark text-dark shadow-neo-sm hover:-translate-y-0.5 transition-all flex items-center space-x-2 cursor-pointer"
            title={
              isEn
                ? 'Download CSV spreadsheet with all 101 simulated points'
                : 'Baixar planilha CSV com os 101 pontos simulados'
            }
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>{isEn ? 'Export CSV' : 'Exportar CSV'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-3 bg-white hover:bg-yellow-300 border-4 border-dark text-dark shadow-neo-sm hover:-translate-y-0.5 transition-all flex items-center space-x-2 cursor-pointer"
            title={isEn ? 'Generate/Print Lab Report' : 'Gerar/Imprimir Relatório de Laboratório'}
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>{isEn ? 'PDF Report' : 'Relatório PDF'}</span>
          </button>
          <span className="btn-quantum-primary px-5 py-3 border-4 shadow-neo-sm">
            {isEn ? `Order ${ordem}` : `Ordem ${ordem}`}
          </span>
        </div>
      </div>

      {/* Barra de Cenarios Experimentais do Paper ACS */}
      <div className="bg-white border-4 border-dark rounded-2xl p-5 shadow-neo space-y-3">
        <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-dark">
          <Sparkles className="w-4 h-4 text-brand fill-dark stroke-[2.5]" />
          <span>
            {isEn
              ? 'Laboratory Scenarios (Inspired by the J. Chem. Educ. Paper):'
              : 'Cenários de Laboratório (Inspirados no Paper J. Chem. Educ.):'}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => aplicarCenario('padrao')}
            className={`p-3.5 border-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all text-left cursor-pointer ${
              cenario === 'padrao'
                ? 'bg-brand border-dark shadow-neo-sm -translate-y-0.5'
                : 'bg-white border-dark/40 hover:border-dark text-dark/70 hover:text-dark'
            }`}
          >
            <div className="text-dark font-extrabold text-sm">
              {isEn ? 'General Reaction (1st Order)' : 'Reação Geral (1ª Ordem)'}
            </div>
            <div className="text-[11px] text-dark/60 font-mono mt-1">k = 0.15 s⁻¹ • [A]₀ = 2.0 M</div>
          </button>

          <button
            type="button"
            onClick={() => aplicarCenario('ozonio')}
            className={`p-3.5 border-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all text-left cursor-pointer ${
              cenario === 'ozonio'
                ? 'bg-brand border-dark shadow-neo-sm -translate-y-0.5'
                : 'bg-white border-dark/40 hover:border-dark text-dark/70 hover:text-dark'
            }`}
          >
            <div className="text-dark font-extrabold text-sm">
              {isEn ? 'Stratospheric Ozone (O₃)' : 'Ozônio Estratosférico (O₃)'}
            </div>
            <div className="text-[11px] text-dark/60 font-mono mt-1">
              {isEn ? 'k = 0.28 s⁻¹ • Fast decay' : 'k = 0.28 s⁻¹ • Rápido decaimento'}
            </div>
          </button>

          <button
            type="button"
            onClick={() => aplicarCenario('poluente')}
            className={`p-3.5 border-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all text-left cursor-pointer ${
              cenario === 'poluente'
                ? 'bg-brand border-dark shadow-neo-sm -translate-y-0.5'
                : 'bg-white border-dark/40 hover:border-dark text-dark/70 hover:text-dark'
            }`}
          >
            <div className="text-dark font-extrabold text-sm">
              {isEn ? 'Gaseous Pollutant (N₂O₅)' : 'Poluente Gasoso (N₂O₅)'}
            </div>
            <div className="text-[11px] text-dark/60 font-mono mt-1">
              {isEn ? 'k = 0.04 s⁻¹ • Long e-folding' : 'k = 0.04 s⁻¹ • e-folding longo'}
            </div>
          </button>

          <button
            type="button"
            onClick={() => aplicarCenario('catalise_zero')}
            className={`p-3.5 border-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all text-left cursor-pointer ${
              cenario === 'catalise_zero'
                ? 'bg-brand border-dark shadow-neo-sm -translate-y-0.5'
                : 'bg-white border-dark/40 hover:border-dark text-dark/70 hover:text-dark'
            }`}
          >
            <div className="text-dark font-extrabold text-sm">
              {isEn ? 'Surface Catalysis (0th Order)' : 'Catálise Superficial (Ordem 0)'}
            </div>
            <div className="text-[11px] text-dark/60 font-mono mt-1">
              {isEn ? 'k = 0.12 M/s • Constant rate' : 'k = 0.12 M/s • Taxa constante'}
            </div>
          </button>
        </div>
      </div>

      {/* Grade de Trabalho */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Parametros de Controle */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border-4 border-dark rounded-3xl p-6 space-y-5 shadow-neo">
            <h2 className="text-lg font-black uppercase text-dark border-b-2 border-dark/20 pb-3 flex items-center justify-between font-display">
              <span>{isEn ? 'Reaction Controls' : 'Controles da Reação'}</span>
              <Info className="w-5 h-5 text-dark stroke-[2.5]" />
            </h2>

            {/* Seletor de Ordem */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-dark block">
                {isEn ? 'Reaction Order' : 'Ordem da Reação'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOrdem(0);
                    setFeedback({ tipo: null, msg: '' });
                  }}
                  className={`py-3 px-3 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
                    ordem === 0
                      ? 'btn-quantum-primary border-dark shadow-neo-sm'
                      : 'bg-white text-dark border-dark/40 hover:border-dark'
                  }`}
                >
                  {isEn ? 'Zero Order (0)' : 'Ordem Zero (0)'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrdem(1);
                    setFeedback({ tipo: null, msg: '' });
                  }}
                  className={`py-3 px-3 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
                    ordem === 1
                      ? 'btn-quantum-primary border-dark shadow-neo-sm'
                      : 'bg-white text-dark border-dark/40 hover:border-dark'
                  }`}
                >
                  {isEn ? '1st Order (1)' : '1ª Ordem (1)'}
                </button>
              </div>
            </div>

            {/* Constante k */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                <span className="text-dark">{isEn ? 'Rate Constant (k)' : 'Constante de Velocidade (k)'}</span>
                <span className="text-dark font-mono bg-yellow-300 px-2 py-0.5 border border-dark rounded">
                  {k.toFixed(2)} {unidadeK}
                </span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.8"
                step="0.01"
                value={k}
                onChange={e => {
                  setK(parseFloat(e.target.value));
                  setFeedback({ tipo: null, msg: '' });
                }}
                className="w-full accent-dark h-2.5 bg-slate-200 border border-dark rounded-lg cursor-pointer"
              />
            </div>

            {/* Concentracao Inicial */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                <span className="text-dark">
                  {isEn ? 'Initial Concentration [A]₀' : 'Concentração Inicial [A]₀'}
                </span>
                <span className="text-dark font-mono bg-brand px-2 py-0.5 border border-dark rounded">
                  {a0.toFixed(1)} mol/L
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="5.0"
                step="0.1"
                value={a0}
                onChange={e => {
                  setA0(parseFloat(e.target.value));
                  setFeedback({ tipo: null, msg: '' });
                }}
                className="w-full accent-dark h-2.5 bg-slate-200 border border-dark rounded-lg cursor-pointer"
              />
            </div>

            {/* Tempo Maximo */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                <span className="text-dark">{isEn ? 'Time Window' : 'Janela de Tempo'}</span>
                <span className="text-dark font-mono bg-slate-100 px-2 py-0.5 border border-dark rounded">
                  {tempoMax} s
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={tempoMax}
                onChange={e => setTempoMax(parseInt(e.target.value))}
                className="w-full accent-dark h-2.5 bg-slate-200 border border-dark rounded-lg cursor-pointer"
              />
            </div>

            {/* Resultados Fisicos Calculados */}
            <div className="pt-4 border-t-2 border-dark/20 space-y-2.5 bg-brand/30 p-4 rounded-2xl border-2 border-dark">
              <span className="text-xs font-black text-dark uppercase tracking-wider block">
                {isEn ? 'Calculated Physicochemical Properties' : 'Propriedades Físico-Químicas Calculadas'}
              </span>

              <div className="flex justify-between text-xs font-black uppercase items-center">
                <span className="text-dark/80">{isEn ? '1st Half-Life (t½):' : '1ª Meia-Vida (t½):'}</span>
                <span className="text-dark font-mono bg-yellow-300 px-2 py-0.5 border border-dark rounded shadow-neo-sm">
                  {meiaVida !== null ? `${meiaVida.toFixed(2)} s` : '-'}
                </span>
              </div>

              {ordem === 1 && tempoVida !== null && (
                <div className="flex justify-between text-xs font-black uppercase items-center">
                  <span className="text-dark/80">{isEn ? 'Lifetime (τ = 1/k):' : 'Tempo de Vida (τ = 1/k):'}</span>
                  <span className="text-dark font-mono bg-white px-2 py-0.5 border border-dark rounded shadow-neo-sm">
                    {tempoVida.toFixed(2)} s
                  </span>
                </div>
              )}

              {ordem === 0 && (
                <>
                  <div className="flex justify-between text-xs font-black uppercase items-center">
                    <span className="text-dark/80">
                      {isEn ? '2nd Half-Life (25% of [A]₀):' : '2ª Meia-Vida (25% de [A]₀):'}
                    </span>
                    <span className="text-dark font-mono bg-white px-2 py-0.5 border border-dark rounded shadow-neo-sm">
                      {segundaMeiaVida ? `${segundaMeiaVida.toFixed(2)} s` : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-black uppercase items-center">
                    <span className="text-dark/80">
                      {isEn ? '3rd Half-Life (12.5% of [A]₀):' : '3ª Meia-Vida (12.5% de [A]₀):'}
                    </span>
                    <span className="text-dark font-mono bg-white px-2 py-0.5 border border-dark rounded shadow-neo-sm">
                      {terceiraMeiaVida ? `${terceiraMeiaVida.toFixed(2)} s` : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-black uppercase items-center pt-1 border-t border-dark/20">
                    <span className="text-dark">
                      {isEn ? 'Total Exhaustion ([A] = 0):' : 'Exaustão Total ([A] = 0):'}
                    </span>
                    <span className="text-white font-mono bg-dark px-2 py-0.5 border border-dark rounded shadow-neo-sm">
                      {tempoConsumoTotal ? `${tempoConsumoTotal.toFixed(2)} s` : '-'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Grafico Cientifico */}
        <div className="lg:col-span-8 quantum-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-neo">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-dark/10 pb-3 mb-4">
              <h3 className="text-lg font-extrabold text-dark uppercase font-display">
                {isEn ? 'Molar Concentration vs. Time' : 'Concentração Molar vs. Tempo'}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
                <span className="flex items-center space-x-1.5 text-indigo-700">
                  <span className="w-3 h-3 rounded-full bg-indigo-600 border border-dark"></span>
                  <span>{isEn ? '[A] Reactant' : '[A] Reagente'}</span>
                </span>
                <span className="flex items-center space-x-1.5 text-cyan-700">
                  <span className="w-3 h-3 rounded-full bg-cyan-500 border border-dark"></span>
                  <span>{isEn ? '[B] Product' : '[B] Produto'}</span>
                </span>
                <span className="flex items-center space-x-1.5 text-dark">
                  <span className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-dark"></span>
                  <span>{isEn ? 't½ Point' : 'Ponto t½'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setEscalaFixaY(!escalaFixaY)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-brand border border-dark rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer"
                  title={
                    isEn
                      ? 'Toggle fixed vertical scale (5.0 M) or auto-scale'
                      : 'Alternar entre escala vertical fixa (5.0 M) ou auto-escala'
                  }
                >
                  {escalaFixaY
                    ? isEn
                      ? 'Y-Axis: Fixed (5M)'
                      : 'Eixo Y: Fixo (5M)'
                    : isEn
                    ? 'Y-Axis: Auto'
                    : 'Eixo Y: Auto'}
                </button>
              </div>
            </div>

            <div className="h-80 sm:h-96 w-full">
              {dadosGrafico ? (
                <Line
                  data={dadosGrafico}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: { duration: 180 },
                    scales: {
                      x: {
                        type: 'linear',
                        min: 0,
                        max: tempoMax,
                        grid: { color: 'rgba(226, 232, 240, 0.8)' },
                        ticks: { color: '#334155', font: { family: 'JetBrains Mono', size: 11 } },
                        title: {
                          display: true,
                          text: isEn ? 'Elapsed Time t (s)' : 'Tempo Decorrido t (s)',
                          color: '#191A23',
                          font: { weight: 'bold', size: 12 },
                        },
                      },
                      y: {
                        type: 'linear',
                        min: 0,
                        max: escalaFixaY ? Math.max(5.0, a0) : undefined,
                        grid: { color: 'rgba(226, 232, 240, 0.8)' },
                        ticks: { color: '#334155', font: { family: 'JetBrains Mono', size: 11 } },
                        title: {
                          display: true,
                          text: isEn ? 'Concentration [C] (mol/L)' : 'Concentração [C] (mol/L)',
                          color: '#191A23',
                          font: { weight: 'bold', size: 12 },
                        },
                      },
                    },
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: '#191A23',
                        titleColor: '#BFFF00',
                        bodyColor: '#ffffff',
                        padding: 10,
                        cornerRadius: 10,
                        callbacks: {
                          title: items =>
                            `${isEn ? 'Time' : 'Tempo'}: ${Number(items[0]?.parsed?.x ?? 0).toFixed(2)} s`,
                          label: item => `${item.dataset.label}: ${Number(item.parsed.y).toFixed(3)} mol/L`,
                        },
                      },
                    },
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                  {isEn ? 'Calculating curve points...' : 'Calculando pontos da curva...'}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border-2 border-dark/20 text-xs text-dark font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              {isEn ? 'Integrated law:' : 'Equação integrada:'}{' '}
              <strong className="text-dark bg-brand px-2 py-0.5 rounded border border-dark">
                {ordem === 1 ? '[A](t) = [A]₀ · e^(-k·t)' : '[A](t) = max(0, [A]₀ - k·t)'}
              </strong>
            </div>
            <div>
              {isEn ? 'Half-Life:' : 'Meia-Vida:'}{' '}
              <strong className="text-dark bg-yellow-300 px-2 py-0.5 rounded border border-dark">
                {ordem === 1 ? 't½ = ln(2) / k' : 't½ = [A]₀ / (2·k)'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Exercicio Pratico do Modulo */}
      <section className="quantum-card rounded-3xl p-6 sm:p-8 space-y-4 shadow-neo">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-dark/15 pb-3">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-dark stroke-[2.5]" />
            <h3 className="text-xl font-black text-dark uppercase font-display">
              {isEn
                ? 'Practical Challenge: Half-Life Calculation (t½)'
                : 'Desafio Prático: Cálculo de Meia-Vida (t½)'}
            </h3>
          </div>
          <span className="text-xs font-black text-dark bg-yellow-300 px-3.5 py-1 rounded-full border-2 border-dark shadow-neo-sm">
            {isEn ? 'REWARD: +60 XP & COINS' : 'RECOMPENSA: +60 XP & MOEDAS'}
          </span>
        </div>

        <p className="text-sm text-dark/90 font-medium leading-relaxed">
          {isEn ? (
            <>
              Using the parameters selected above (
              <strong className="text-dark font-black font-mono">
                k = {k} {unidadeK}
              </strong>{' '}
              and <strong className="text-dark font-black font-mono">[A]₀ = {a0} mol/L</strong> for an{' '}
              <strong className="text-dark font-black">Order {ordem}</strong> reaction), calculate the{' '}
              <strong>Half-Life (t½)</strong> in seconds:
            </>
          ) : (
            <>
              Com os parâmetros selecionados acima (
              <strong className="text-dark font-black font-mono">
                k = {k} {unidadeK}
              </strong>{' '}
              e <strong className="text-dark font-black font-mono">[A]₀ = {a0} mol/L</strong> em reação de{' '}
              <strong className="text-dark font-black">Ordem {ordem}</strong>), calcule o{' '}
              <strong>Tempo de Meia-Vida (t½)</strong> em segundos:
            </>
          )}
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <input
            type="number"
            step="0.01"
            value={respostaUsuario}
            onChange={e => setRespostaUsuario(e.target.value)}
            placeholder={isEn ? 'Enter your value (e.g., 4.62)' : 'Digite seu valor (ex: 4.62)'}
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
