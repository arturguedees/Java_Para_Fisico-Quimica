import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Wind,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  HelpCircle,
  Activity,
  Printer,
  Download,
  LayoutGrid,
  Zap,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Navbar from '../components/Navbar';
import {
  ganharXpUsuarioApi,
  sanitizarUsuarioSemSenha,
} from '../services/api';
import {
  exportarDadosCsv,
  calcularDensidadeVelocidadeMB,
  calcularMaxwellLocal,
  compararGasesLocal,
  type ResultadoMaxwell,
} from '../services/motorCientifico';
import { useNotificacao } from '../components/NotificacaoToast';
import { traduzirGas, useI18n } from '../i18n/i18n';
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

interface MaxwellProps {
  embedded?: boolean;
  modoInicial?: 'velocidade' | 'energia';
  onUsuarioAtualizado?: (u: any) => void;
}

/**
 * Simulador da Distribuicao de Maxwell-Boltzmann e Energia Cinetica f(E).
 *
 * Comentario de dev junior:
 * Esse modulo e um dos meus favoritos porque mostra visualmente a Teoria Cinetica dos Gases!
 * Quando aumentamos a temperatura T ou escolhemos um gas mais leve (como Helio ou Hidrogenio),
 * a curva de velocidade f(v) se desloca para a direita e fica mais achatada (pois a integral total
 * sob a curva continua sendo 1, ou seja, 100% das moleculas).
 * Ja no modo de Energia f(E), podemos ver o Principio da Equiparticao de Energia em acao!
 */
export default function Maxwell({
  embedded = false,
  modoInicial = 'velocidade',
  onUsuarioAtualizado,
}: MaxwellProps) {
  const navigate = useNavigate();
  const { lang, isEn } = useI18n();
  const [usuario, setUsuario] = useState<any>(null);

  // Parametros
  const [gasSelecionado, setGasSelecionado] = useState<string>('ARGONIO');
  const [temperatura, setTemperatura] = useState<number>(300);
  const [tipoGrafico, setTipoGrafico] = useState<'velocidade' | 'energia' | 'comparar'>(modoInicial);
  const [energiaAtivacaoKJ, setEnergiaAtivacaoKJ] = useState<number>(10.0);
  const [v1, setV1] = useState<number>(200);
  const [v2, setV2] = useState<number>(600);
  const [massaCustomG, setMassaCustomG] = useState<number>(44.01); // CO2 padrao
  const [gamaCustom, setGamaCustom] = useState<number>(1.30);
  const [escalaFixa, setEscalaFixa] = useState<boolean>(true);

  // Dados
  const [dadosGrafico, setDadosGrafico] = useState<any>(null);
  const [infoFisica, setInfoFisica] = useState<ResultadoMaxwell | null>(null);

  // Desafio
  const [respostaUsuario, setRespostaUsuario] = useState<string>('');
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro' | null; msg: string }>({
    tipo: null,
    msg: '',
  });
  const [resolvido, setResolvido] = useState<boolean>(false);

  const gases = [
    { chave: 'ARGONIO', nome: traduzirGas('ARGONIO', lang), massaG: '39.95 g/mol' },
    { chave: 'OXIGENIO', nome: traduzirGas('OXIGENIO', lang), massaG: '32.00 g/mol' },
    { chave: 'NITROGENIO', nome: traduzirGas('NITROGENIO', lang), massaG: '28.01 g/mol' },
    { chave: 'HELIO', nome: traduzirGas('HELIO', lang), massaG: '4.00 g/mol' },
    { chave: 'HIDROGENIO', nome: traduzirGas('HIDROGENIO', lang), massaG: '2.02 g/mol' },
    { chave: 'CUSTOM', nome: traduzirGas('CUSTOM', lang), massaG: `${massaCustomG.toFixed(1)} g/mol` },
  ];

  useEffect(() => {
    setTipoGrafico(modoInicial);
  }, [modoInicial]);

  useEffect(() => {
    const data = localStorage.getItem('usuario');
    if (!data && !embedded) {
      navigate('/login');
    } else if (data) {
      const u = sanitizarUsuarioSemSenha(JSON.parse(data));
      setUsuario(u);
      if (u.exerciciosResolvidos && u.exerciciosResolvidos.includes('max_lab_01')) {
        setResolvido(true);
      }
    }
  }, [navigate, embedded]);

  useEffect(() => {
    calcularMaxwell();
  }, [gasSelecionado, temperatura, tipoGrafico, energiaAtivacaoKJ, v1, v2, massaCustomG, gamaCustom, lang]);

  const calcularMaxwell = () => {
    // Calculo instantaneo local a 60fps sem fila de rede ou travamento de slider!
    const dados = calcularMaxwellLocal(
      gasSelecionado,
      temperatura,
      energiaAtivacaoKJ * 1000.0,
      v1,
      v2,
      gasSelecionado === 'CUSTOM' ? massaCustomG / 1000.0 : undefined,
      gasSelecionado === 'CUSTOM' ? gamaCustom : undefined
    );

    setInfoFisica(dados);
    const nomeGasTraduzido = traduzirGas(dados.gas, lang);

    if (tipoGrafico === 'comparar') {
      const comp = compararGasesLocal(temperatura);
      const cores = ['#4f46e5', '#06b6d4', '#f59e0b', '#10b981', '#e11d48'];
      setDadosGrafico({
        datasets: comp.series.map((serie, idx) => ({
          label: `${traduzirGas(serie.nome, lang)} (v_mp = ${serie.velocidadeMaisProvavel.toFixed(0)} m/s)`,
          data: comp.velocidades.map((v, i) => ({ x: v, y: serie.densidades[i] * 1000 })),
          borderColor: cores[idx % cores.length],
          backgroundColor: 'transparent',
          pointRadius: 0,
          borderWidth: 2.8,
          tension: 0.25,
        })),
      });
      return;
    }

    if (tipoGrafico === 'velocidade') {
      const m = dados.massaMolarKgPorMol;
      const vmp = dados.velocidadeMaisProvavel;
      const vm = dados.velocidadeMedia;
      const vrms = dados.velocidadeQuadraticaMedia;

      const seriePrincipal = dados.velocidades.map((v, i) => ({
        x: v,
        y: dados.densidadesVelocidade[i] * 1000.0, // em 10⁻³ s/m para leitura clara
      }));

      const serieRef300K = dados.velocidades.map((v, i) => ({
        x: v,
        y: (dados.densidadesVelocidadeRef300K?.[i] ?? 0) * 1000.0,
      }));

      const serieIntervalo = dados.velocidades.map((v, i) => ({
        x: v,
        y: v >= v1 && v <= v2 ? dados.densidadesVelocidade[i] * 1000.0 : null,
      }));

      const pontosNotaveis = [
        { x: vmp, y: calcularDensidadeVelocidadeMB(m, temperatura, vmp) * 1000.0 },
        { x: vm, y: calcularDensidadeVelocidadeMB(m, temperatura, vm) * 1000.0 },
        { x: vrms, y: calcularDensidadeVelocidadeMB(m, temperatura, vrms) * 1000.0 },
      ];

      const datasets: any[] = [
        {
          label: isEn
            ? `f(v) ${nomeGasTraduzido} at ${temperatura} K (×10⁻³ s/m)`
            : `f(v) ${nomeGasTraduzido} a ${temperatura} K (×10⁻³ s/m)`,
          data: seriePrincipal,
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.10)',
          fill: true,
          pointRadius: 0,
          borderWidth: 3,
          tension: 0.25,
        },
        {
          label: isEn
            ? `Interval [${v1} - ${v2} m/s]: ${(dados.probabilidadeIntervalo * 100).toFixed(1)}%`
            : `Intervalo [${v1} - ${v2} m/s]: ${(dados.probabilidadeIntervalo * 100).toFixed(1)}%`,
          data: serieIntervalo,
          borderColor: 'rgba(250, 204, 21, 0.9)',
          backgroundColor: 'rgba(250, 204, 21, 0.35)',
          fill: true,
          pointRadius: 0,
          borderWidth: 1.5,
          tension: 0.25,
        },
        {
          label: isEn
            ? 'Characteristic Speeds (v_mp, v_m, v_rms)'
            : 'Velocidades Notáveis (v_mp, v_m, v_rms)',
          data: pontosNotaveis,
          borderColor: '#191A23',
          backgroundColor: ['#facc15', '#22d3ee', '#f43f5e'],
          pointRadius: 6.5,
          pointHoverRadius: 9,
          pointBorderWidth: 2,
          showLine: false,
        },
      ];

      if (temperatura !== 300) {
        datasets.push({
          label: isEn
            ? `Reference ${nomeGasTraduzido} at 300 K`
            : `Referência ${nomeGasTraduzido} a 300 K`,
          data: serieRef300K,
          borderColor: '#94a3b8',
          backgroundColor: 'transparent',
          borderDash: [6, 4],
          pointRadius: 0,
          borderWidth: 2,
          tension: 0.25,
        });
      }

      setDadosGrafico({ datasets });
    } else {
      // Grafico de Energia Cinetica f(E) em (kJ/mol)⁻¹ vs E (kJ/mol)
      const serieEnergia = dados.energias.map((eJ, i) => ({
        x: eJ / 1000.0,
        y: dados.densidadesEnergia[i] * 1000.0, // (kJ/mol)⁻¹
      }));

      const serieEnergiaRef300 = dados.energias.map((eJ, i) => ({
        x: eJ / 1000.0,
        y: (dados.densidadesEnergiaRef300K?.[i] ?? 0) * 1000.0,
      }));

      const serieAcimaEa = dados.energias.map((eJ, i) => {
        const eKJ = eJ / 1000.0;
        return {
          x: eKJ,
          y: eKJ >= energiaAtivacaoKJ ? dados.densidadesEnergia[i] * 1000.0 : null,
        };
      });

      const datasets: any[] = [
        {
          label: isEn
            ? `f(E) at ${temperatura} K ((kJ/mol)⁻¹)`
            : `f(E) a ${temperatura} K ((kJ/mol)⁻¹)`,
          data: serieEnergia,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.10)',
          fill: true,
          pointRadius: 0,
          borderWidth: 3,
          tension: 0.25,
        },
        {
          label: isEn
            ? `Molecules with E ≥ Ea (${energiaAtivacaoKJ.toFixed(1)} kJ/mol): ${(
                dados.fracaoAcimaEa * 100
              ).toFixed(2)}%`
            : `Moléculas com E ≥ Ea (${energiaAtivacaoKJ.toFixed(1)} kJ/mol): ${(
                dados.fracaoAcimaEa * 100
              ).toFixed(2)}%`,
          data: serieAcimaEa,
          borderColor: '#e11d48',
          backgroundColor: 'rgba(225, 29, 72, 0.35)',
          fill: true,
          pointRadius: 0,
          borderWidth: 2,
          tension: 0.25,
        },
      ];

      if (temperatura !== 300) {
        datasets.push({
          label: isEn ? 'Reference f(E) at 300 K' : 'Referência f(E) a 300 K',
          data: serieEnergiaRef300,
          borderColor: '#94a3b8',
          backgroundColor: 'transparent',
          borderDash: [6, 4],
          pointRadius: 0,
          borderWidth: 2,
          tension: 0.25,
        });
      }

      setDadosGrafico({ datasets });
    }
  };

  const handleExportarCsv = () => {
    if (!infoFisica) return;
    if (tipoGrafico === 'energia') {
      const linhas = infoFisica.energias.map((e, i) => [
        e / 1000.0,
        infoFisica.densidadesEnergia[i] * 1000.0,
      ]);
      exportarDadosCsv(
        `maxwell_energia_${temperatura}K.csv`,
        ['Energia_kJ_mol', 'Densidade_fE_inv_kJ_mol'],
        linhas
      );
    } else {
      const linhas = infoFisica.velocidades.map((v, i) => [
        v,
        infoFisica.densidadesVelocidade[i],
      ]);
      exportarDadosCsv(
        `maxwell_velocidade_${gasSelecionado}_${temperatura}K.csv`,
        ['Velocidade_m_s', 'Densidade_Probabilidade_s_m'],
        linhas
      );
    }
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

    if (!infoFisica) return;

    const vmpEsperada = infoFisica.velocidadeMaisProvavel;
    const erro = Math.abs((valor - vmpEsperada) / vmpEsperada);
    const nomeGas = traduzirGas(infoFisica.gas, lang);

    if (erro <= 0.05) {
      const jaResolvidoAntes = resolvido;
      setResolvido(true);
      try {
        confetti({
          particleCount: 75,
          spread: 65,
          origin: { y: 0.7 },
        });
      } catch {
        // ignore
      }

      setFeedback({
        tipo: 'sucesso',
        msg: jaResolvidoAntes
          ? isEn
            ? `Correct! The most probable speed for ${nomeGas} at ${temperatura} K is ${vmpEsperada.toFixed(1)} m/s.`
            : `Correto! A velocidade mais provável para ${nomeGas} a ${temperatura} K é ${vmpEsperada.toFixed(1)} m/s.`
          : isEn
          ? `Sensational! The most probable speed is ${vmpEsperada.toFixed(1)} m/s. You earned +75 XP and +75 Coins!`
          : `Sensacional! A velocidade mais provável é ${vmpEsperada.toFixed(1)} m/s. Você recebeu +75 XP e +75 Moedas!`,
      });

      if (usuario && !jaResolvidoAntes) {
        try {
          const atualizado = sanitizarUsuarioSemSenha(
            await ganharXpUsuarioApi(usuario.id, 75, 'max_lab_01')
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
          ? `Incorrect value. Golden tip: v_mp = √(2 · R · T / M) = √(2 × 8.3145 × ${temperatura} / ${infoFisica.massaMolarKgPorMol.toFixed(5)}) ≈ ${vmpEsperada.toFixed(1)} m/s.`
          : `Valor incorreto. Dica de ouro: v_mp = √(2 · R · T / M) = √(2 × 8.3145 × ${temperatura} / ${infoFisica.massaMolarKgPorMol.toFixed(5)}) ≈ ${vmpEsperada.toFixed(1)} m/s.`,
      });
    }
  };

  const maxEixoX = escalaFixa
    ? tipoGrafico === 'energia'
      ? 35
      : tipoGrafico === 'comparar'
      ? 4500
      : infoFisica && infoFisica.massaMolarKgPorMol < 0.01
      ? 5500
      : 2200
    : undefined;

  const maxEixoY = escalaFixa
    ? tipoGrafico === 'energia'
      ? 0.35
      : tipoGrafico === 'comparar'
      ? 2.2
      : infoFisica && infoFisica.massaMolarKgPorMol < 0.01
      ? 0.9
      : 2.5
    : undefined;

  const nomeGasAtual = infoFisica ? traduzirGas(infoFisica.gas, lang) : traduzirGas('ARGONIO', lang);

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
          <div className="w-16 h-16 bg-white border-4 border-dark text-dark flex items-center justify-center shadow-neo-sm transform hover:-rotate-6 transition-all shrink-0">
            <Wind className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-dark text-white border-2 border-dark rounded-md text-xs font-black uppercase tracking-widest shadow-neo-sm">
              <Activity className="w-4 h-4 stroke-[3]" />
              <span>
                {tipoGrafico === 'energia'
                  ? isEn
                    ? 'BLOCK 03 • KINETIC ENERGY & Ea BARRIER'
                    : 'BLOCO 03 • ENERGIA CINÉTICA & BARREIRA Ea'
                  : isEn
                  ? 'BLOCK 02 • GAS THERMODYNAMICS'
                  : 'BLOCO 02 • TERMODINÂMICA DOS GASES'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-dark tracking-tighter uppercase font-display leading-tight">
              {tipoGrafico === 'energia'
                ? isEn
                  ? 'Kinetic Energy f(E) & Fraction Above Ea'
                  : 'Energia Cinética f(E) & Fração Acima de Ea'
                : isEn
                ? 'Maxwell-Boltzmann Distribution'
                : 'Distribuição de Maxwell-Boltzmann'}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs font-black uppercase tracking-widest">
          <button
            onClick={handleExportarCsv}
            className="px-4 py-3 bg-white hover:bg-brand-light border-4 border-dark text-dark shadow-neo-sm hover:-translate-y-0.5 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-3 bg-white hover:bg-yellow-300 border-4 border-dark text-dark shadow-neo-sm hover:-translate-y-0.5 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>PDF</span>
          </button>
          <button
            onClick={() => setTipoGrafico('velocidade')}
            className={`px-4 py-3 border-4 transition-all cursor-pointer ${
              tipoGrafico === 'velocidade'
                ? 'btn-quantum-primary shadow-neo-sm border-dark'
                : 'bg-white text-dark border-dark hover:bg-slate-50'
            }`}
          >
            {isEn ? 'Speeds f(v)' : 'Velocidades f(v)'}
          </button>
          <button
            onClick={() => setTipoGrafico('comparar')}
            className={`px-4 py-3 border-4 transition-all cursor-pointer flex items-center space-x-1.5 ${
              tipoGrafico === 'comparar'
                ? 'bg-cyan-300 text-dark border-dark shadow-neo-sm'
                : 'bg-white text-dark border-dark hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4 stroke-[2.5]" />
            <span>{isEn ? 'Compare 5 Gases' : 'Comparar 5 Gases'}</span>
          </button>
          <button
            onClick={() => setTipoGrafico('energia')}
            className={`px-4 py-3 border-4 transition-all cursor-pointer flex items-center space-x-1.5 ${
              tipoGrafico === 'energia'
                ? 'bg-yellow-300 text-dark border-dark shadow-neo-sm'
                : 'bg-white text-dark border-dark hover:bg-slate-50'
            }`}
          >
            <Zap className="w-4 h-4 stroke-[2.5]" />
            <span>{isEn ? 'Energy f(E) & Ea' : 'Energia f(E) & Ea'}</span>
          </button>
        </div>
      </div>

      {/* Grade de Trabalho */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Painel de Controle */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border-4 border-dark rounded-3xl p-6 space-y-5 shadow-neo">
            <h2 className="text-lg font-black uppercase text-dark border-b-2 border-dark/20 pb-3 font-display">
              {isEn ? 'Thermodynamic Parameters' : 'Parâmetros Termodinâmicos'}
            </h2>

            {/* Lista de Gases */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-dark block">
                {isEn ? 'Study Gases (ACS Paper)' : 'Gases de Estudo (Paper ACS)'}
              </label>
              <div className="space-y-2">
                {gases.map(g => (
                  <button
                    key={g.chave}
                    type="button"
                    onClick={() => {
                      setGasSelecionado(g.chave);
                      setFeedback({ tipo: null, msg: '' });
                    }}
                    className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-between border-2 transition-all cursor-pointer ${
                      gasSelecionado === g.chave
                        ? 'bg-brand border-dark text-dark shadow-neo-sm translate-x-1'
                        : 'bg-white text-dark border-dark/40 hover:border-dark hover:bg-slate-50'
                    }`}
                  >
                    <span>{g.nome}</span>
                    <span className="font-mono text-[11px] bg-dark text-white px-2 py-0.5 rounded">
                      {g.massaG}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Controles de Gas Personalizado */}
            {gasSelecionado === 'CUSTOM' && (
              <div className="p-3.5 bg-yellow-100 border-2 border-dark rounded-2xl space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-dark block">
                  {isEn ? 'Configure Custom Gas' : 'Configurar Gás Personalizado'}
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-dark block mb-1">
                      {isEn ? 'Molar Mass (g/mol)' : 'Massa (g/mol)'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="300"
                      step="0.5"
                      value={massaCustomG}
                      onChange={e => setMassaCustomG(Math.max(1, parseFloat(e.target.value) || 28))}
                      className="w-full px-2.5 py-1.5 bg-white border-2 border-dark rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-dark block mb-1">
                      {isEn ? 'Adiabatic Index γ' : 'Coef. Adiabático γ'}
                    </label>
                    <input
                      type="number"
                      min="1.05"
                      max="1.70"
                      step="0.01"
                      value={gamaCustom}
                      onChange={e =>
                        setGamaCustom(Math.max(1.05, Math.min(1.7, parseFloat(e.target.value) || 1.4)))
                      }
                      className="w-full px-2.5 py-1.5 bg-white border-2 border-dark rounded-lg font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Slider de Temperatura */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                <span className="text-dark">{isEn ? 'Absolute Temperature (T)' : 'Temperatura Absoluta (T)'}</span>
                <span className="text-dark font-mono bg-yellow-300 px-2 py-0.5 border border-dark rounded">
                  {temperatura} K ({(temperatura - 273.15).toFixed(0)} °C)
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="1200"
                step="25"
                value={temperatura}
                onChange={e => {
                  setTemperatura(parseInt(e.target.value));
                  setFeedback({ tipo: null, msg: '' });
                }}
                className="w-full accent-dark h-2.5 bg-slate-200 border border-dark rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-dark/60 font-mono font-bold">
                <span>100 K (-173°C)</span>
                <span>300 K (Ref)</span>
                <span>1200 K (927°C)</span>
              </div>
            </div>

            {/* Controle de Energia de Ativacao Ea (no modo energia) */}
            {tipoGrafico === 'energia' && (
              <div className="space-y-2 p-3.5 bg-rose-50 border-2 border-dark rounded-2xl">
                <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                  <span className="text-dark">{isEn ? 'Activation Energy (Ea)' : 'Energia de Ativação (Ea)'}</span>
                  <span className="text-white font-mono bg-rose-600 px-2 py-0.5 border border-dark rounded">
                    {energiaAtivacaoKJ.toFixed(1)} kJ/mol
                  </span>
                </div>
                <input
                  type="range"
                  min="2.0"
                  max="30.0"
                  step="0.5"
                  value={energiaAtivacaoKJ}
                  onChange={e => setEnergiaAtivacaoKJ(parseFloat(e.target.value))}
                  className="w-full accent-rose-600 h-2.5 bg-white border border-dark rounded-lg cursor-pointer"
                />
                {infoFisica && (
                  <div className="pt-1 space-y-1.5 text-xs font-black uppercase">
                    <div className="flex justify-between items-center">
                      <span className="text-dark/80">
                        {isEn ? 'Fraction E ≥ Ea (Simpson):' : 'Fração com E ≥ Ea (Simpson):'}
                      </span>
                      <span className="font-mono bg-white px-2 py-0.5 border border-dark rounded text-rose-700">
                        {(infoFisica.fracaoAcimaEa * 100).toFixed(2)}% (
                        {infoFisica.fracaoAcimaEa.toExponential(2)})
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-dark/80">
                        {isEn ? 'Most Probable Energy (½RT):' : 'Energia Mais Provável (½RT):'}
                      </span>
                      <span className="font-mono bg-white px-2 py-0.5 border border-dark rounded text-dark">
                        {(infoFisica.energiaMaisProvavel / 1000).toFixed(2)} kJ/mol
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-dark/80">
                        {isEn ? 'Mean Kinetic Energy (3/2 RT):' : 'Energia Cinética Média (3/2 RT):'}
                      </span>
                      <span className="font-mono bg-yellow-300 px-2 py-0.5 border border-dark rounded text-dark">
                        {(infoFisica.energiaCineticaMedia / 1000).toFixed(2)} kJ/mol
                      </span>
                    </div>
                    <p className="text-[11px] font-bold normal-case text-dark/75 pt-1 leading-snug">
                      {isEn
                        ? 'Note (Equipartition): f(E) depends exclusively on temperature T, being identical for all ideal gases regardless of molar mass M.'
                        : 'Nota (Equipartição): f(E) depende exclusivamente da temperatura T, sendo idêntica para todos os gases ideais independentemente da massa molar M.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Controle de Probabilidade no Intervalo [v1, v2] (no modo velocidade) */}
            {tipoGrafico === 'velocidade' && (
              <div className="space-y-2 p-3.5 bg-amber-50 border-2 border-dark rounded-2xl">
                <span className="text-xs font-black uppercase tracking-wider text-dark block">
                  {isEn
                    ? 'Probability Integral P(v₁ ≤ v ≤ v₂)'
                    : 'Integral de Probabilidade P(v₁ ≤ v ≤ v₂)'}
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-dark/70 block">
                      {isEn ? 'v₁ min (m/s)' : 'v₁ mín (m/s)'}
                    </label>
                    <input
                      type="number"
                      step="50"
                      min="0"
                      max={v2 - 50}
                      value={v1}
                      onChange={e => setV1(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-2 py-1 bg-white border-2 border-dark rounded font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-dark/70 block">
                      {isEn ? 'v₂ max (m/s)' : 'v₂ máx (m/s)'}
                    </label>
                    <input
                      type="number"
                      step="50"
                      min={v1 + 50}
                      max="5000"
                      value={v2}
                      onChange={e => setV2(Math.max(v1 + 10, parseInt(e.target.value) || 500))}
                      className="w-full px-2 py-1 bg-white border-2 border-dark rounded font-mono font-bold"
                    />
                  </div>
                </div>
                {infoFisica && (
                  <div className="pt-1 flex justify-between items-center text-xs font-black uppercase">
                    <span className="text-dark/80">
                      {isEn ? 'Fraction in interval:' : 'Fração no intervalo:'}
                    </span>
                    <span className="font-mono bg-yellow-300 px-2 py-0.5 border border-dark rounded">
                      {(infoFisica.probabilidadeIntervalo * 100).toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Velocidades Notaveis Calculadas */}
            {infoFisica && (
              <div className="pt-4 border-t-2 border-dark/20 space-y-2.5 bg-brand/30 p-4 rounded-2xl border-2 border-dark text-xs">
                <span className="text-xs font-black text-dark uppercase tracking-wider block pb-1">
                  {isEn
                    ? `Characteristic Speeds — ${nomeGasAtual}`
                    : `Velocidades Notáveis — ${nomeGasAtual}`}
                </span>

                <div className="flex justify-between font-black uppercase items-center">
                  <span className="text-dark/80 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-dark inline-block"></span>
                    {isEn ? 'v_mp (Most Probable):' : 'v_mp (Mais Provável):'}
                  </span>
                  <span className="text-dark font-mono bg-white px-2 py-0.5 border border-dark rounded shadow-neo-sm">
                    {infoFisica.velocidadeMaisProvavel.toFixed(1)} m/s
                  </span>
                </div>

                <div className="flex justify-between font-black uppercase items-center">
                  <span className="text-dark/80 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 border border-dark inline-block"></span>
                    {isEn ? 'v_m (Mean Speed):' : 'v_m (Velocidade Média):'}
                  </span>
                  <span className="text-dark font-mono bg-white px-2 py-0.5 border border-dark rounded shadow-neo-sm">
                    {infoFisica.velocidadeMedia.toFixed(1)} m/s
                  </span>
                </div>

                <div className="flex justify-between font-black uppercase items-center">
                  <span className="text-dark/80 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-dark inline-block"></span>
                    {isEn ? 'v_rms (Root-Mean-Square):' : 'v_rms (Quadrática Média):'}
                  </span>
                  <span className="text-dark font-mono bg-white px-2 py-0.5 border border-dark rounded shadow-neo-sm">
                    {infoFisica.velocidadeQuadraticaMedia.toFixed(1)} m/s
                  </span>
                </div>

                <div className="flex justify-between pt-2 border-t-2 border-dark/20 text-dark font-black uppercase bg-yellow-300 -mx-4 -mb-4 p-3 rounded-b-xl border-x-0 border-b-0 items-center">
                  <span>{isEn ? 'Speed of Sound (c):' : 'Velocidade do Som (c):'}</span>
                  <span className="font-mono bg-dark text-white px-2 py-0.5 rounded shadow-neo-sm">
                    {infoFisica.velocidadeDoSom.toFixed(1)} m/s
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Grafico */}
        <div className="lg:col-span-8 quantum-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-neo">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-dark/10 pb-3 mb-4">
              <h3 className="text-lg font-extrabold text-dark uppercase font-display">
                {tipoGrafico === 'velocidade'
                  ? isEn
                    ? 'Molecular Speed Distribution f(v)'
                    : 'Distribuição de Velocidades Moleculares f(v)'
                  : tipoGrafico === 'comparar'
                  ? isEn
                    ? `Simultaneous Comparison of 5 Gases at ${temperatura} K`
                    : `Comparativo Simultâneo dos 5 Gases a ${temperatura} K`
                  : isEn
                  ? 'Kinetic Energy Distribution f(E) & Ea Barrier'
                  : 'Distribuição de Energia Cinética f(E) & Barreira Ea'}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEscalaFixa(!escalaFixa)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-brand border border-dark rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer"
                  title={
                    isEn
                      ? 'Toggle fixed physical window (highlights thermal shift) or auto-scale'
                      : 'Alternar entre janela física fixa (evidencia deslocamento térmico) ou auto-escala'
                  }
                >
                  {escalaFixa
                    ? isEn
                      ? 'Axes: Fixed'
                      : 'Eixos: Fixos'
                    : isEn
                    ? 'Axes: Auto'
                    : 'Eixos: Auto'}
                </button>
                <span className="text-xs font-black px-3 py-1 bg-brand text-dark rounded-lg border-2 border-dark shadow-neo-sm font-mono">
                  {tipoGrafico === 'comparar'
                    ? isEn
                      ? `5 Gases • ${temperatura} K`
                      : `5 Gases • ${temperatura} K`
                    : `${nomeGasAtual} • ${temperatura} K`}
                </span>
              </div>
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
                        min: 0,
                        max: maxEixoX,
                        grid: { color: 'rgba(226, 232, 240, 0.8)' },
                        ticks: { color: '#334155', font: { family: 'JetBrains Mono', size: 11 } },
                        title: {
                          display: true,
                          text:
                            tipoGrafico === 'energia'
                              ? isEn
                                ? 'Translational Kinetic Energy E (kJ/mol)'
                                : 'Energia Cinética Translacional E (kJ/mol)'
                              : isEn
                              ? 'Molecular Speed v (m/s)'
                              : 'Velocidade Molecular v (m/s)',
                          color: '#191A23',
                          font: { weight: 'bold', size: 12 },
                        },
                      },
                      y: {
                        type: 'linear',
                        min: 0,
                        suggestedMax: maxEixoY,
                        grid: { color: 'rgba(226, 232, 240, 0.8)' },
                        ticks: { color: '#334155', font: { family: 'JetBrains Mono', size: 11 } },
                        title: {
                          display: true,
                          text:
                            tipoGrafico === 'energia'
                              ? isEn
                                ? 'Density f(E) [(kJ/mol)⁻¹]'
                                : 'Densidade f(E) [(kJ/mol)⁻¹]'
                              : isEn
                              ? 'Density f(v) [×10⁻³ (s/m)]'
                              : 'Densidade f(v) [×10⁻³ (s/m)]',
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
                  {isEn ? 'Calculating thermal curve...' : 'Calculando curva térmica...'}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border-2 border-dark/20 text-xs text-dark leading-relaxed">
            {tipoGrafico === 'energia' ? (
              isEn ? (
                <span>
                  <strong>Kinetic Interpretation (Arrhenius):</strong> The shaded red area to the right of{' '}
                  <strong>Ea = {energiaAtivacaoKJ.toFixed(1)} kJ/mol</strong> corresponds to{' '}
                  <strong>{((infoFisica?.fracaoAcimaEa ?? 0) * 100).toFixed(2)}%</strong> of molecules. Raising temperature T causes the high-energy tail to grow exponentially!
                </span>
              ) : (
                <span>
                  <strong>Interpretação Cinética (Arrhenius):</strong> A área vermelha sombreada à
                  direita de <strong>Ea = {energiaAtivacaoKJ.toFixed(1)} kJ/mol</strong> corresponde a{' '}
                  <strong>{((infoFisica?.fracaoAcimaEa ?? 0) * 100).toFixed(2)}%</strong> das
                  moléculas. Ao elevar a temperatura T, a cauda de alta energia cresce
                  exponencialmente!
                </span>
              )
            ) : isEn ? (
              <span>
                <strong>True Physical Behavior:</strong> With the fixed speed window and the dashed 300 K reference curve, notice how increasing T or decreasing molar mass M shifts the peak (v_mp) to the right and flattens the curve height to preserve unit total probability area (∫ f(v) dv = 1).
              </span>
            ) : (
              <span>
                <strong>Comportamento Físico Real:</strong> Com a janela de velocidade física fixa e
                a curva tracejada de referência a 300 K, observe como o aumento de T ou a redução da
                massa molar M desloca o pico (v_mp) para a direita e achata a altura da
                curva para conservar a área total unitária (∫ f(v) dv = 1).
              </span>
            )}
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
                ? 'Quick Challenge: Most Probable Speed (v_mp)'
                : 'Desafio Rápido: Velocidade Mais Provável (v_mp)'}
            </h3>
          </div>
          <span className="text-xs font-black text-dark bg-yellow-300 px-3.5 py-1 rounded-full border-2 border-dark shadow-neo-sm">
            {isEn ? 'REWARD: +75 XP & COINS' : 'RECOMPENSA: +75 XP & MOEDAS'}
          </span>
        </div>

        <p className="text-sm text-dark/90 font-medium leading-relaxed">
          {isEn ? (
            <>
              For <strong className="text-dark font-black">{nomeGasAtual}</strong> at the selected temperature of{' '}
              <strong className="text-dark font-black font-mono">{temperatura} K</strong>, what is the{' '}
              <strong>Most Probable Speed (v_mp in m/s)</strong>?
            </>
          ) : (
            <>
              Para o gás <strong className="text-dark font-black">{nomeGasAtual}</strong> na
              temperatura selecionada de{' '}
              <strong className="text-dark font-black font-mono">{temperatura} K</strong>, qual é a{' '}
              <strong>Velocidade Mais Provável (v_mp em m/s)</strong>?
            </>
          )}
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <input
            type="number"
            step="0.1"
            value={respostaUsuario}
            onChange={e => setRespostaUsuario(e.target.value)}
            placeholder={isEn ? 'Enter speed (e.g., 353.4)' : 'Digite a velocidade (ex: 353.4)'}
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
