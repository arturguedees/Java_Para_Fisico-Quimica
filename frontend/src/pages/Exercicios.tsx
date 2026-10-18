import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Award,
  Zap,
  Check,
  Lightbulb,
  BookOpen,
  HelpCircle,
  Activity,
  Wind,
  Thermometer,
  Cpu,
  Layers,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Navbar from '../components/Navbar';
import TextoExpansivel from '../components/TextoExpansivel';
import { useNotificacao } from '../components/NotificacaoToast';
import {
  listarExerciciosApi,
  validarExercicioApi,
  ganharXpUsuarioApi,
  descontarPontosUsuarioApi,
  obterDicaExercicioApi,
  sanitizarUsuarioSemSenha,
} from '../services/api';
import { traduzirModulo, traduzirNivel, useI18n } from '../i18n/i18n';

interface Exercicio {
  id: string;
  titulo: string;
  modulo: string;
  nivel: string;
  enunciado: string;
  tipo: 'NUMERICO' | 'MULTIPLA_ESCOLHA';
  opcoes: string[];
  recompensaXp: number;
  recompensaPontos: number;
}

const MODULOS_CATALOGO = [
  {
    id: 'CINETICA',
    numero: '01',
    tituloPt: 'Cinética Química Integrada',
    tituloEn: 'Integrated Chemical Kinetics',
    subtituloPt: 'Ordens de reação (0ª, 1ª e 2ª ordem), meia-vida t½ e Arrhenius',
    subtituloEn: 'Reaction orders (0th, 1st, 2nd order), half-life t½ & Arrhenius',
    descricaoPt:
      'Estudo quantitativo de decaimentos e consumo de reagentes, tempos característicos (τ), meia-vida e dependência da velocidade com a temperatura através da equação de Arrhenius.',
    descricaoEn:
      'Quantitative study of decay and reactant depletion, characteristic lifetimes (τ), half-life, and rate temperature dependence via the integrated Arrhenius equation.',
    topicosPt: ['Decaimento Exponencial', 'Meia-Vida t½', 'Arrhenius', 'Energia de Ativação'],
    topicosEn: ['Exponential Decay', 'Half-Life t½', 'Arrhenius', 'Activation Energy'],
    tagCor: 'bg-cyan-100 text-cyan-900 border-cyan-800',
    icone: Activity,
  },
  {
    id: 'MAXWELL',
    numero: '02',
    tituloPt: 'Distribuição de Maxwell-Boltzmann',
    tituloEn: 'Maxwell-Boltzmann Distribution',
    subtituloPt: 'Velocidades moleculares em gases ideais e acústica térmica',
    subtituloEn: 'Molecular speeds in ideal gases and thermal acoustics',
    descricaoPt:
      'Cálculo e interpretação probabilística das velocidades mais provável (v_mp), média e quadrática média (v_rms), comparação de massas molares e velocidade adiabática do som.',
    descricaoEn:
      'Probabilistic calculation and interpretation of most probable (v_mp), average, and root-mean-square (v_rms) speeds, molar mass ratios, and adiabatic sound speed.',
    topicosPt: ['Velocidade v_mp', 'v_rms', 'Velocidade do Som c', 'Teoria Cinética'],
    topicosEn: ['Most Probable Speed', 'v_rms', 'Speed of Sound c', 'Kinetic Theory'],
    tagCor: 'bg-amber-100 text-amber-900 border-amber-800',
    icone: Wind,
  },
  {
    id: 'DSC',
    numero: '03',
    tituloPt: 'Calorimetria Exploratória Diferencial (DSC)',
    tituloEn: 'Differential Scanning Calorimetry (DSC)',
    subtituloPt: 'Termodinâmica conformacional de biopolímeros (Lisozima HEWL)',
    subtituloEn: 'Conformational biopolymer thermodynamics (Lysozyme HEWL)',
    descricaoPt:
      'Análise de curvas térmicas reais de desnaturação proteica, pico Tm, largura à meia-altura (ΔT½), capacidade calorífica de excesso e cálculo da entalpia calorimétrica (ΔH_cal).',
    descricaoEn:
      'Analysis of real experimental protein denaturation curves, Tm peak, full width at half maximum (ΔT½), excess heat capacity, and calorimetric transition enthalpy (ΔH_cal).',
    topicosPt: ['Pico Térmico Tm', 'Entalpia ΔH_cal', 'Largura ΔT½', 'Desnaturação HEWL'],
    topicosEn: ['Thermal Peak Tm', 'Enthalpy ΔH_cal', 'FWHM ΔT½', 'HEWL Unfolding'],
    tagCor: 'bg-purple-100 text-purple-900 border-purple-800',
    icone: Thermometer,
  },
  {
    id: 'AVANCADO',
    numero: '04',
    tituloPt: 'Métodos Numéricos & Termodinâmica',
    tituloEn: 'Numerical Methods & Thermodynamics',
    subtituloPt: 'Simpson 1/3, Spline Cúbico, Gibbs e Entropia de Transição',
    subtituloEn: 'Simpson 1/3, Cubic Spline, Gibbs & Transition Entropy',
    descricaoPt:
      'Quadratura numérica e interpolação contínua em malhas não-uniformes, variação de energia livre de Gibbs padrão (ΔG°), trabalho isotérmico reversível e entropia conformacional.',
    descricaoEn:
      'Numerical quadrature & continuous interpolation on non-uniform grids, standard Gibbs free energy change (ΔG°), reversible isothermal work, and conformational entropy.',
    topicosPt: ['Spline Cúbico', 'Regra de Simpson', 'Energia Livre ΔG°', 'Entropia ΔS'],
    topicosEn: ['Cubic Spline', "Simpson's Rule", 'Gibbs Energy ΔG°', 'Entropy ΔS'],
    tagCor: 'bg-emerald-100 text-emerald-900 border-emerald-800',
    icone: Cpu,
  },
];

export default function Exercicios() {
  const navigate = useNavigate();
  const { lang, isEn } = useI18n();
  const notificacao = useNotificacao();
  const [usuario, setUsuario] = useState<any>(null);
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [moduloAtivo, setModuloAtivo] = useState<string | null>(null);
  const [filtroNivel, setFiltroNivel] = useState<string>('TODOS');
  const [mostrarTooltipAjuda, setMostrarTooltipAjuda] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estado das respostas e dicas
  const [respostas, setRespostas] = useState<{ [key: string]: any }>({});
  const [feedbacks, setFeedbacks] = useState<{ [key: string]: any }>({});
  const [processando, setProcessando] = useState<{ [key: string]: boolean }>({});
  const [dicas, setDicas] = useState<{ [key: string]: { formula?: string; resolucao?: string } }>({});
  const [desbloqueandoDica, setDesbloqueandoDica] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const data = localStorage.getItem('usuario');
    if (!data) {
      navigate('/login');
    } else {
      const u = sanitizarUsuarioSemSenha(JSON.parse(data));
      setUsuario(u);
    }
  }, [navigate]);

  useEffect(() => {
    carregarExercicios();
  }, [lang]);

  const carregarExercicios = async () => {
    try {
      setLoading(true);
      const data = await listarExerciciosApi(lang);
      setExercicios(data);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao carregar questões:', err);
      setLoading(false);
    }
  };

  const dispararConfetes = () => {
    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
      });
    } catch {
      // ignore
    }
  };

  const handleResponder = async (exercicio: Exercicio) => {
    const resposta = respostas[exercicio.id];
    if (resposta === undefined || resposta === '') {
      notificacao.aviso(isEn ? 'Please type or select an answer before submitting.' : 'Digite ou selecione uma resposta antes de confirmar.');
      return;
    }

    setProcessando(prev => ({ ...prev, [exercicio.id]: true }));

    try {
      const resultado = await validarExercicioApi(exercicio.id, resposta, lang);
      setFeedbacks(prev => ({ ...prev, [exercicio.id]: resultado }));

      if (resultado.correto) {
        dispararConfetes();
        notificacao.sucesso(
          isEn
            ? `Correct answer! +${resultado.xpGanho} XP and +${resultado.pontosGanhos} Coins earned!`
            : `Resposta correta! Você ganhou +${resultado.xpGanho} XP e +${resultado.pontosGanhos} Moedas!`
        );

        if (usuario) {
          const userAtualizado = sanitizarUsuarioSemSenha(
            await ganharXpUsuarioApi(usuario.id, resultado.xpGanho, exercicio.id)
          );
          setUsuario(userAtualizado);
          localStorage.setItem('usuario', JSON.stringify(userAtualizado));
        }
      } else {
        notificacao.erro(
          isEn
            ? 'Incorrect result. Check the hint or adjust your calculation.'
            : 'Resultado incorreto. Veja a dica ou revise os valores do cálculo.'
        );
      }
    } catch (err) {
      console.error('Erro ao validar resposta:', err);
      notificacao.erro(isEn ? 'Failed to validate answer.' : 'Erro ao processar a validação.');
    } finally {
      setProcessando(prev => ({ ...prev, [exercicio.id]: false }));
    }
  };

  const handleDesbloquearDica = async (
    exercicioId: string,
    tipo: 'formula' | 'resolucao',
    custo: number
  ) => {
    if (!usuario) {
      notificacao.aviso(
        isEn
          ? 'Please log in to use your coins and unlock hints.'
          : 'Faça login para utilizar suas moedas e desbloquear dicas.'
      );
      return;
    }

    if ((usuario.pontos || 0) < custo) {
      notificacao.aviso(
        isEn
          ? `Insufficient coins! You need ${custo} PTS to unlock this hint.`
          : `Saldo insuficiente! Você precisa de ${custo} PTS para desbloquear esta dica.`
      );
      return;
    }

    setDesbloqueandoDica(prev => ({ ...prev, [`${exercicioId}_${tipo}`]: true }));

    try {
      const userAtualizado = sanitizarUsuarioSemSenha(
        await descontarPontosUsuarioApi(usuario.id, custo)
      );
      setUsuario(userAtualizado);
      localStorage.setItem('usuario', JSON.stringify(userAtualizado));

      const resDica = await obterDicaExercicioApi(exercicioId, tipo, lang);

      setDicas(prev => ({
        ...prev,
        [exercicioId]: {
          ...prev[exercicioId],
          [tipo]: resDica.dica,
        },
      }));

      notificacao.info(
        isEn
          ? `Hint unlocked! (-${custo} PTS deducted)`
          : `Dica desbloqueada com sucesso! (-${custo} PTS debitados)`
      );
    } catch (err: any) {
      console.error('Erro ao desbloquear dica:', err);
      notificacao.erro(
        isEn ? 'Could not unlock the hint right now.' : 'Não foi possível desbloquear a dica no momento.'
      );
    } finally {
      setDesbloqueandoDica(prev => ({ ...prev, [`${exercicioId}_${tipo}`]: false }));
    }
  };

  const exerciciosResolvidosSet = new Set(
    usuario?.exerciciosResolvidos ? usuario.exerciciosResolvidos.split(',').filter(Boolean) : []
  );

  // Estatisticas por modulo
  const questoesPorModulo = (modId: string) => exercicios.filter(e => e.modulo === modId);
  const resolvidasPorModulo = (modId: string) =>
    questoesPorModulo(modId).filter(e => exerciciosResolvidosSet.has(e.id)).length;

  const totalRespondidosGeral = Array.from(exerciciosResolvidosSet).length;
  const totalGeralQuestoes = exercicios.length || 1;
  const taxaConclusaoGeral = Math.min(100, Math.round((totalRespondidosGeral / totalGeralQuestoes) * 100));

  // Questoes filtradas dentro do modulo ativo
  const questoesDoModuloAtivo = exercicios.filter(ex => {
    if (ex.modulo !== moduloAtivo) return false;
    if (filtroNivel === 'TODOS') return true;
    return ex.nivel.toUpperCase() === filtroNivel.toUpperCase();
  });

  const moduloInfoAtivo = MODULOS_CATALOGO.find(m => m.id === moduloAtivo);
  const letras = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="min-h-screen pb-24">
      <Navbar usuario={usuario} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 space-y-10">

        {/* ========================================================================= */}
        {/* TELA 1: SELECAO DE MODULOS DE APRENDIZAGEM (Estilo Foto 4)                 */}
        {/* ========================================================================= */}
        {!moduloAtivo && (
          <div className="space-y-10">
            {/* Cabecalho Principal */}
            <div className="quantum-card bg-brand p-6 sm:p-10 shadow-neo">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-white border-2 border-dark rounded-full text-xs font-black text-dark shadow-neo-sm uppercase tracking-widest">
                    <Zap className="w-4 h-4 text-dark fill-dark" />
                    <span>
                      {isEn ? 'SPECIALIZED EXERCISE MODULES' : 'MÓDULOS ESPECIALIZADOS DE EXERCÍCIOS'}
                    </span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-black text-dark tracking-tighter uppercase font-display leading-tight">
                    {isEn ? 'Problem Solving & Mastery' : 'Caderno de Exercícios & Desafios'}
                  </h1>
                  <p className="text-dark/90 text-base font-medium max-w-xl">
                    {isEn
                      ? 'Choose a learning module below to practice the physical-chemistry calculations, earn XP, and unlock new scientific titles.'
                      : 'Selecione um módulo abaixo para abrir seu banco de questões especializado, acumular XP e conquistar novos títulos científicos.'}
                  </p>
                </div>

                {/* Widget de Progresso Geral */}
                <div className="bg-white border-4 border-dark rounded-2xl p-5 min-w-[260px] shadow-neo">
                  <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider mb-2 text-dark">
                    <span>{isEn ? 'Overall Progress' : 'Progresso Geral'}</span>
                    <span className="font-mono text-lg">{taxaConclusaoGeral}%</span>
                  </div>
                  <div className="w-full bg-white border-2 border-dark h-3.5 rounded-full overflow-hidden mb-2 shadow-inner-sm">
                    <div
                      className="bg-brand border-r-2 border-dark h-full transition-all duration-700 ease-out"
                      style={{ width: `${taxaConclusaoGeral}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-dark/80">
                    <span>{totalRespondidosGeral} / {totalGeralQuestoes} {isEn ? 'solved' : 'resolvidas'}</span>
                    <span className="text-dark bg-yellow-300 px-2 py-0.5 rounded border border-dark">
                      {exercicios.reduce((acc, q) => acc + q.recompensaXp, 0)} XP
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid dos 4 Blocos de Modulos (Inspirado na Foto 4 do usuario) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {MODULOS_CATALOGO.map(mod => {
                const IconeModulo = mod.icone;
                const totalMod = questoesPorModulo(mod.id).length;
                const resolvidasMod = resolvidasPorModulo(mod.id);
                const percMod = totalMod > 0 ? Math.round((resolvidasMod / totalMod) * 100) : 0;
                const xpTotalMod = questoesPorModulo(mod.id).reduce((acc, q) => acc + q.recompensaXp, 0);

                return (
                  <div
                    key={mod.id}
                    onClick={() => {
                      setModuloAtivo(mod.id);
                      setFiltroNivel('TODOS');
                    }}
                    className="quantum-card bg-white p-7 sm:p-8 flex flex-col justify-between group cursor-pointer hover:-translate-y-1.5 transition-all duration-300 shadow-neo hover:shadow-neo-hover border-4 border-dark rounded-3xl"
                  >
                    <div className="space-y-5">
                      {/* Cabecalho do Card */}
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-dark text-white rounded-md text-xs font-black font-mono tracking-widest uppercase border-2 border-dark">
                          {isEn ? 'MODULE' : 'MÓDULO'} {mod.numero}
                        </span>

                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider border-2 border-dark bg-yellow-300 text-dark shadow-neo-sm">
                          <Award className="w-3.5 h-3.5" />
                          <span>{resolvidasMod}/{totalMod} {isEn ? 'Completed' : 'Resolvidas'}</span>
                        </span>
                      </div>

                      {/* Icone e Titulo */}
                      <div className="flex items-start space-x-4">
                        <div className="p-3.5 rounded-2xl bg-brand border-2 border-dark shadow-neo-sm group-hover:scale-110 transition-transform">
                          <IconeModulo className="w-7 h-7 text-dark stroke-[2.5]" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-2xl font-black text-dark tracking-tight uppercase font-display leading-tight group-hover:text-cyan-900 transition-colors">
                            {isEn ? mod.tituloEn : mod.tituloPt}
                          </h2>
                          <p className="text-xs font-bold text-dark/70 uppercase tracking-wider mt-1">
                            {isEn ? mod.subtituloEn : mod.subtituloPt}
                          </p>
                        </div>
                      </div>

                      {/* Descricao */}
                      <p className="text-sm font-medium text-dark/85 leading-relaxed">
                        {isEn ? mod.descricaoEn : mod.descricaoPt}
                      </p>

                      {/* Tags de Conteudo Abordado */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {(isEn ? mod.topicosEn : mod.topicosPt).map(tag => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 bg-slate-100 border border-dark rounded-lg text-xs font-bold text-dark uppercase tracking-tight"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Barra de Progresso do Modulo */}
                      <div className="pt-2">
                        <div className="flex justify-between text-xs font-black uppercase text-dark mb-1">
                          <span>{isEn ? 'Progress' : 'Progresso do Módulo'}</span>
                          <span>{percMod}%</span>
                        </div>
                        <div className="w-full bg-slate-100 border-2 border-dark h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-brand h-full border-r-2 border-dark transition-all duration-500"
                            style={{ width: `${percMod}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Botao de Acao */}
                    <div className="pt-6 mt-6 border-t-2 border-dark/20 flex items-center justify-between">
                      <span className="text-xs font-black text-dark uppercase tracking-wider">
                        +{xpTotalMod} XP / +{xpTotalMod} PTS
                      </span>
                      <button
                        type="button"
                        className="btn-quantum-primary px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center space-x-2 shadow-neo-sm group-hover:shadow-neo transition-all"
                      >
                        <span>{isEn ? 'Open Questions' : 'Acessar Questões'}</span>
                        <ChevronRight className="w-4 h-4 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TELA 2: LISTAGEM DE QUESTOES DO MODULO SELECIONADO                         */}
        {/* ========================================================================= */}
        {moduloAtivo && moduloInfoAtivo && (
          <div className="space-y-8 animate-fade-in">
            {/* Barra de Topo Ergonomica com Botao de Voltar aos Modulos */}
            <div className="quantum-card bg-brand p-6 sm:p-8 shadow-neo">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-4 border-dark">
                <button
                  type="button"
                  onClick={() => setModuloAtivo(null)}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white hover:bg-dark hover:text-white border-2 border-dark rounded-xl text-xs font-black uppercase tracking-widest text-dark shadow-neo-sm hover:shadow-neo transition-all cursor-pointer self-start"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[3]" />
                  <span>{isEn ? '← Back to Modules' : '← Voltar aos Módulos'}</span>
                </button>

                {/* Badge de Progresso do Modulo */}
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setMostrarTooltipAjuda(!mostrarTooltipAjuda)}
                      className="p-2 bg-white border-2 border-dark rounded-xl text-dark shadow-neo-sm hover:bg-yellow-200 transition-colors"
                      title={isEn ? 'Module guidance & hints info' : 'Explicação de regras e dicas'}
                    >
                      <HelpCircle className="w-5 h-5 stroke-[2.5]" />
                    </button>

                    {/* Tooltip Interativo Explicativo */}
                    {mostrarTooltipAjuda && (
                      <div className="absolute right-0 top-12 z-30 w-72 sm:w-80 bg-white border-4 border-dark rounded-2xl p-4 shadow-neo text-xs space-y-2 text-dark font-medium animate-slide-up">
                        <div className="font-black uppercase tracking-wider flex items-center space-x-1.5 text-xs border-b-2 border-dark pb-2">
                          <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span>{isEn ? 'How Exercises Work' : 'Instruções do Módulo'}</span>
                        </div>
                        <p>
                          {isEn
                            ? '• Type numerical answers or click multiple-choice options.'
                            : '• Digite valores numéricos exatos ou clique na alternativa correta.'}
                        </p>
                        <p>
                          {isEn
                            ? '• Spend 20 Coins to reveal the core theoretical formula.'
                            : '• Gaste 20 Moedas para revelar a fórmula essencial do cálculo.'}
                        </p>
                        <p>
                          {isEn
                            ? '• Spend 40 Coins to see the step-by-step resolution structure.'
                            : '• Gaste 40 Moedas para ver a rota de resolução completa armada.'}
                        </p>
                        <p className="font-bold text-dark">
                          {isEn
                            ? '• Earn XP and Coins with every completed exercise!'
                            : '• Ganhe XP e Moedas a cada exercício concluído com sucesso!'}
                        </p>
                      </div>
                    )}
                  </div>

                  <span className="px-4 py-2 bg-dark text-white rounded-xl text-xs font-black uppercase tracking-wider border-2 border-dark shadow-neo-sm">
                    {resolvidasPorModulo(moduloAtivo)} / {questoesPorModulo(moduloAtivo).length}{' '}
                    {isEn ? 'Solved' : 'Resolvidas'}
                  </span>
                </div>
              </div>

              {/* Titulo do Modulo Ativo */}
              <div className="pt-6 space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-dark/70 font-mono">
                  {isEn ? 'ACTIVE MODULE' : 'MÓDULO ATIVO'} {moduloInfoAtivo.numero}
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-dark tracking-tighter uppercase font-display leading-tight">
                  {isEn ? moduloInfoAtivo.tituloEn : moduloInfoAtivo.tituloPt}
                </h1>
                <p className="text-dark/90 text-sm font-medium max-w-2xl">
                  {isEn ? moduloInfoAtivo.descricaoEn : moduloInfoAtivo.descricaoPt}
                </p>
              </div>

              {/* Filtro por Nivel de Dificuldade */}
              <div className="mt-6 pt-6 border-t-2 border-dark/20 flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-black text-dark uppercase tracking-wider mr-2">
                  {isEn ? 'Difficulty:' : 'Dificuldade:'}
                </span>
                {[
                  { id: 'TODOS', labelPt: 'Todos os Níveis', labelEn: 'All Levels' },
                  { id: 'Iniciante', labelPt: 'Iniciante', labelEn: 'Beginner' },
                  { id: 'Intermediário', labelPt: 'Intermediário', labelEn: 'Intermediate' },
                  { id: 'Avançado', labelPt: 'Avançado', labelEn: 'Advanced' },
                ].map(nv => (
                  <button
                    key={nv.id}
                    onClick={() => setFiltroNivel(nv.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
                      filtroNivel.toUpperCase() === nv.id.toUpperCase()
                        ? 'bg-dark text-white border-dark shadow-neo-sm scale-105'
                        : 'bg-white hover:bg-yellow-200 text-dark border-dark'
                    }`}
                  >
                    {isEn ? nv.labelEn : nv.labelPt}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de Questoes */}
            {questoesDoModuloAtivo.length === 0 ? (
              <div className="quantum-card bg-white p-10 text-center space-y-3 shadow-neo border-4 border-dark rounded-3xl">
                <p className="text-dark font-black uppercase text-base">
                  {isEn ? 'No questions match this difficulty filter.' : 'Nenhuma questão encontrada com este filtro de nível.'}
                </p>
                <button
                  onClick={() => setFiltroNivel('TODOS')}
                  className="btn-quantum-primary px-4 py-2 rounded-xl text-xs font-black uppercase"
                >
                  {isEn ? 'Show All' : 'Mostrar Todos'}
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {questoesDoModuloAtivo.map((ex, index) => {
                  const isResolvido =
                    exerciciosResolvidosSet.has(ex.id) || feedbacks[ex.id]?.correto;
                  const fb = feedbacks[ex.id];

                  return (
                    <article
                      key={ex.id}
                      className={`rounded-3xl p-6 sm:p-8 space-y-6 transition-all duration-300 border-4 border-dark ${
                        isResolvido
                          ? 'bg-brand shadow-neo'
                          : 'bg-white shadow-neo hover:-translate-y-1 hover:shadow-neo-hover'
                      }`}
                    >
                      {/* Cabecalho da Questao */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-dark/20">
                        <div className="flex flex-wrap items-center gap-2.5 text-xs font-black uppercase tracking-wider">
                          <span className="px-3 py-1.5 bg-dark text-white rounded-md font-mono shadow-neo-sm border-2 border-dark">
                            {isEn ? 'QUESTION' : 'QUESTÃO'} {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="px-3 py-1.5 bg-white text-dark rounded-md border-2 border-dark shadow-neo-sm">
                            {traduzirModulo(ex.modulo, lang)}
                          </span>
                          <span className="px-3 py-1.5 bg-yellow-300 text-dark rounded-md border-2 border-dark shadow-neo-sm">
                            {isEn ? 'LEVEL' : 'NÍVEL'} {traduzirNivel(ex.nivel, lang)}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {isResolvido ? (
                            <span className="inline-flex items-center space-x-2 px-3 py-1.5 bg-dark text-white border-2 border-dark rounded-md text-xs font-black uppercase tracking-widest shadow-neo-sm">
                              <CheckCircle2 className="w-4 h-4 text-brand stroke-[2.5]" />
                              <span>{isEn ? 'COMPLETED' : 'CONCLUÍDO'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-2 px-3 py-1.5 bg-white text-dark border-2 border-dark rounded-md text-xs font-black uppercase tracking-widest shadow-neo-sm">
                              <Award className="w-4 h-4 text-dark stroke-[2.5]" />
                              <span>
                                +{ex.recompensaXp} XP / +{ex.recompensaPontos} PTS
                              </span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Titulo e Enunciado com TextoExpansivel (Item 14) */}
                      <div className="space-y-3">
                        <h3 className="text-2xl sm:text-3xl font-black text-dark tracking-tight uppercase font-display leading-tight">
                          {ex.titulo}
                        </h3>
                        <TextoExpansivel
                          texto={ex.enunciado}
                          limiteCaracteres={220}
                          className="text-dark text-base sm:text-lg leading-relaxed font-medium"
                        />
                      </div>

                      {/* Central de Dicas Progressivas (Sem Alert!) */}
                      <div className="space-y-3 pt-2">
                        <div className="flex flex-wrap items-center gap-3">
                          {!dicas[ex.id]?.formula && (
                            <button
                              type="button"
                              onClick={() => handleDesbloquearDica(ex.id, 'formula', 20)}
                              disabled={desbloqueandoDica[`${ex.id}_formula`] || isResolvido}
                              className="px-4 py-2 bg-yellow-300 hover:bg-yellow-400 border-2 border-dark rounded-xl text-xs font-black uppercase tracking-wider text-dark shadow-neo-sm hover:-translate-y-0.5 transition-all flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                              title={
                                isEn
                                  ? 'Spend 20 coins to reveal the essential formula'
                                  : 'Gaste 20 moedas para revelar a fórmula essencial'
                              }
                            >
                              <Lightbulb className="w-4 h-4 text-dark stroke-[2.5]" />
                              <span>
                                {desbloqueandoDica[`${ex.id}_formula`]
                                  ? isEn
                                    ? 'Unlocking...'
                                    : 'Desbloqueando...'
                                  : isEn
                                  ? 'Reveal Formula (-20 PTS)'
                                  : 'Revelar Fórmula (-20 PTS)'}
                              </span>
                            </button>
                          )}

                          {!dicas[ex.id]?.resolucao && (
                            <button
                              type="button"
                              onClick={() => handleDesbloquearDica(ex.id, 'resolucao', 40)}
                              disabled={desbloqueandoDica[`${ex.id}_resolucao`] || isResolvido}
                              className="px-4 py-2 bg-orange-300 hover:bg-orange-400 border-2 border-dark rounded-xl text-xs font-black uppercase tracking-wider text-dark shadow-neo-sm hover:-translate-y-0.5 transition-all flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                              title={
                                isEn
                                  ? 'Spend 40 coins to see the step-by-step solution route'
                                  : 'Gaste 40 moedas para ver a rota de resolução passo-a-passo'
                              }
                            >
                              <BookOpen className="w-4 h-4 text-dark stroke-[2.5]" />
                              <span>
                                {desbloqueandoDica[`${ex.id}_resolucao`]
                                  ? isEn
                                    ? 'Unlocking...'
                                    : 'Desbloqueando...'
                                  : isEn
                                  ? 'Step-by-Step (-40 PTS)'
                                  : 'Passo-a-Passo (-40 PTS)'}
                              </span>
                            </button>
                          )}
                        </div>

                        {/* Exibicao da Formula Desbloqueada */}
                        {dicas[ex.id]?.formula && (
                          <div className="p-4 bg-yellow-100 border-2 border-dark rounded-xl text-dark text-sm space-y-1 shadow-neo-sm animate-slide-up">
                            <div className="flex items-center space-x-2 font-black uppercase tracking-wider text-xs">
                              <Lightbulb className="w-4 h-4 text-dark stroke-[2.5]" />
                              <span>{isEn ? 'Theoretical Formula Hint:' : 'Dica Teórica de Fórmula:'}</span>
                            </div>
                            <p className="font-mono font-bold text-xs sm:text-sm pl-6">
                              {dicas[ex.id].formula}
                            </p>
                          </div>
                        )}

                        {/* Exibicao do Passo a Passo Desbloqueado */}
                        {dicas[ex.id]?.resolucao && (
                          <div className="p-4 bg-orange-100 border-2 border-dark rounded-xl text-dark text-sm space-y-1 shadow-neo-sm animate-slide-up">
                            <div className="flex items-center space-x-2 font-black uppercase tracking-wider text-xs">
                              <BookOpen className="w-4 h-4 text-dark stroke-[2.5]" />
                              <span>{isEn ? 'Step-by-Step Setup:' : 'Passo-a-Passo Armado:'}</span>
                            </div>
                            <p className="font-mono font-bold text-xs sm:text-sm pl-6">
                              {dicas[ex.id].resolucao}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Area de Resposta (Numerico ou Multipla Escolha) */}
                      <div className="pt-4">
                        {ex.tipo === 'NUMERICO' ? (
                          <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                              <input
                                type="number"
                                step="any"
                                value={respostas[ex.id] ?? ''}
                                onChange={e =>
                                  setRespostas({ ...respostas, [ex.id]: e.target.value })
                                }
                                disabled={isResolvido}
                                placeholder={
                                  isEn ? 'Enter the exact result...' : 'Digite o resultado exato...'
                                }
                                className="px-5 py-3 bg-white border-4 border-dark rounded-xl text-base text-dark placeholder-dark/40 focus:outline-none focus:border-brand disabled:opacity-60 sm:w-80 font-mono font-black shadow-neo-sm transition-all"
                              />
                              <button
                                onClick={() => handleResponder(ex)}
                                disabled={
                                  isResolvido ||
                                  processando[ex.id] ||
                                  respostas[ex.id] === undefined ||
                                  respostas[ex.id] === ''
                                }
                                className="btn-quantum-primary px-6 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer shadow-neo"
                              >
                                <span>
                                  {isResolvido
                                    ? isEn
                                      ? 'Completed'
                                      : 'Concluído'
                                    : processando[ex.id]
                                    ? isEn
                                      ? 'Validating...'
                                      : 'Validando...'
                                    : isEn
                                    ? 'Submit'
                                    : 'Confirmar'}
                                </span>
                                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {ex.opcoes.map((op, idx) => {
                              const isSelected = respostas[ex.id] === idx;
                              return (
                                <label
                                  key={idx}
                                  className={`group relative flex items-start space-x-4 p-5 rounded-2xl border-4 font-black cursor-pointer transition-all duration-200 select-none ${
                                    isSelected
                                      ? 'border-dark bg-dark text-white shadow-neo-sm translate-x-1'
                                      : 'border-dark bg-white text-dark hover:bg-brand hover:shadow-neo-sm hover:translate-x-1'
                                  } ${isResolvido ? 'cursor-default' : ''}`}
                                >
                                  <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 transition-all duration-200 border-2 ${
                                      isSelected
                                        ? 'bg-brand border-brand text-dark scale-110'
                                        : 'bg-white text-dark border-dark group-hover:bg-dark group-hover:text-white'
                                    }`}
                                  >
                                    {isSelected ? (
                                      <Check className="w-5 h-5 stroke-[3]" />
                                    ) : (
                                      letras[idx] || idx + 1
                                    )}
                                  </div>
                                  <div className="flex-1 leading-relaxed pt-1 text-base uppercase font-display tracking-tight">
                                    {op}
                                  </div>
                                  <input
                                    type="radio"
                                    name={`opcao_${ex.id}`}
                                    value={idx}
                                    checked={isSelected}
                                    onChange={() => setRespostas({ ...respostas, [ex.id]: idx })}
                                    disabled={isResolvido}
                                    className="sr-only"
                                  />
                                </label>
                              );
                            })}

                            <div className="pt-4">
                              <button
                                onClick={() => handleResponder(ex)}
                                disabled={
                                  isResolvido ||
                                  processando[ex.id] ||
                                  respostas[ex.id] === undefined
                                }
                                className="btn-quantum-primary px-8 py-4 rounded-xl text-sm font-black uppercase tracking-widest disabled:opacity-50 flex items-center justify-center space-x-2 shadow-neo cursor-pointer"
                              >
                                <span>
                                  {isResolvido
                                    ? isEn
                                      ? 'Completed'
                                      : 'Concluído'
                                    : processando[ex.id]
                                    ? isEn
                                      ? 'Validating...'
                                      : 'Validando...'
                                    : isEn
                                    ? 'Confirm Option'
                                    : 'Confirmar Opção'}
                                </span>
                                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Feedback e Gabarito com TextoExpansivel (Item 14) */}
                        {fb && (
                          <div
                            className={`mt-6 p-6 rounded-2xl border-4 text-base space-y-4 animate-slide-up font-medium ${
                              fb.correto
                                ? 'bg-brand border-dark text-dark shadow-neo'
                                : 'bg-rose-400 border-dark text-dark shadow-neo'
                            }`}
                          >
                            <div className="flex items-center space-x-3 font-black text-xl uppercase tracking-tighter font-display">
                              {fb.correto ? (
                                <CheckCircle2 className="w-8 h-8 text-dark flex-shrink-0 animate-bounce stroke-[3]" />
                              ) : (
                                <AlertCircle className="w-8 h-8 text-dark flex-shrink-0 animate-pulse stroke-[3]" />
                              )}
                              <span>{fb.mensagem}</span>
                            </div>
                            {fb.explicacao && (
                              <div className="pt-4 border-t-4 border-dark/20 text-sm sm:text-base leading-relaxed text-dark">
                                <strong className="text-dark block mb-2 font-black uppercase tracking-widest text-sm">
                                  {isEn ? 'Answer Key & Detailed Explanation:' : 'Gabarito e Explicação Detalhada:'}
                                </strong>
                                <TextoExpansivel
                                  texto={fb.explicacao}
                                  limiteCaracteres={200}
                                  className="font-bold"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
