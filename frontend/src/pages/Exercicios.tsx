import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ArrowRight, Filter, Award, Zap, Check, Lightbulb, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import Navbar from '../components/Navbar';
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

/**
 * Caderno de Exercicios Interativo com Economia de Dicas Progressivas.
 *
 * Comentario de dev junior:
 * Aqui o aluno coloca em pratica a teoria de Cinetica, Maxwell-Boltzmann e Calorimetria DSC!
 * Sempre que ele troca o idioma na barra superior (EUA/Brasil), o useEffect recarrega o
 * catalogo de questoes no idioma escolhido (passando ?lang=en ou ?lang=pt para o backend/fallback).
 * Tambem criei um sistema de dicas progressivas: o estudante pode gastar 20 PTS para ver a formula
 * ou 40 PTS para ver a resolucao passo a passo antes de responder!
 */
export default function Exercicios() {
  const navigate = useNavigate();
  const { lang, isEn } = useI18n();
  const [usuario, setUsuario] = useState<any>(null);
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [filtroModulo, setFiltroModulo] = useState<string>('TODOS');
  const [loading, setLoading] = useState(true);

  // Estado das respostas
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
        colors: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'],
      });
    } catch (e) {
      // Ignorar se confetti falhar
    }
  };

  const handleResponder = async (exercicio: Exercicio) => {
    const resposta = respostas[exercicio.id];
    if (resposta === undefined || resposta === '') return;

    setProcessando(prev => ({ ...prev, [exercicio.id]: true }));

    try {
      const resultado = await validarExercicioApi(exercicio.id, resposta, lang);
      setFeedbacks(prev => ({ ...prev, [exercicio.id]: resultado }));

      if (resultado.correto) {
        dispararConfetes();

        if (usuario) {
          const userAtualizado = sanitizarUsuarioSemSenha(
            await ganharXpUsuarioApi(usuario.id, resultado.xpGanho, exercicio.id)
          );
          setUsuario(userAtualizado);
          localStorage.setItem('usuario', JSON.stringify(userAtualizado));
        }
      }
    } catch (err) {
      console.error('Erro ao validar resposta:', err);
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
      alert(
        isEn
          ? 'Please log in to use your coins and unlock hints.'
          : 'Faça login para utilizar suas moedas e desbloquear dicas.'
      );
      return;
    }

    if (usuario.pontos < custo) {
      alert(
        isEn
          ? `Insufficient balance! You need ${custo} PTS to unlock this hint.`
          : `Saldo insuficiente! Você precisa de ${custo} PTS para desbloquear esta dica.`
      );
      return;
    }

    setDesbloqueandoDica(prev => ({ ...prev, [`${exercicioId}_${tipo}`]: true }));

    try {
      // 1. Desconta os pontos do usuario
      const userAtualizado = sanitizarUsuarioSemSenha(
        await descontarPontosUsuarioApi(usuario.id, custo)
      );
      setUsuario(userAtualizado);
      localStorage.setItem('usuario', JSON.stringify(userAtualizado));

      // 2. Busca a dica correspondente no idioma ativo
      const resDica = await obterDicaExercicioApi(exercicioId, tipo, lang);

      setDicas(prev => ({
        ...prev,
        [exercicioId]: {
          ...prev[exercicioId],
          [tipo]: resDica.dica,
        },
      }));
    } catch (err: any) {
      console.error('Erro ao desbloquear dica:', err);
      alert(
        isEn
          ? 'Could not unlock the hint right now.'
          : 'Não foi possível desbloquear a dica no momento.'
      );
    } finally {
      setDesbloqueandoDica(prev => ({ ...prev, [`${exercicioId}_${tipo}`]: false }));
    }
  };

  const exerciciosResolvidosSet = new Set(
    usuario?.exerciciosResolvidos ? usuario.exerciciosResolvidos.split(',').filter(Boolean) : []
  );

  const exerciciosFiltrados = exercicios.filter(ex => {
    if (filtroModulo === 'TODOS') return true;
    return ex.modulo === filtroModulo;
  });

  // Conta quantos exercicios do catalogo foram resolvidos
  const idsCatalogo = new Set(exercicios.map(e => e.id));
  const totalRespondidos = Array.from(exerciciosResolvidosSet).filter(id =>
    idsCatalogo.size > 0 ? idsCatalogo.has(id as string) : true
  ).length;
  const totalGeral = exercicios.length || 1;
  const taxaConclusao = Math.min(100, Math.round((totalRespondidos / totalGeral) * 100));

  const letras = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="min-h-screen pb-24">
      <Navbar usuario={usuario} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 space-y-10">
        {/* Cabecalho Interativo com Barra de Progresso do Banco */}
        <div className="quantum-card bg-brand p-6 sm:p-10 shadow-neo">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-white border-2 border-dark rounded-full text-xs font-black text-dark shadow-neo-sm uppercase tracking-widest">
                <Zap className="w-4 h-4 text-dark fill-dark" />
                <span>
                  {isEn ? 'QUESTION BANK & TRAINING' : 'BANCO DE QUESTÕES & TREINAMENTO'}
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-dark tracking-tighter uppercase font-display leading-tight">
                {isEn ? 'Exercise Workbook' : 'Caderno de Exercícios'}
              </h1>
              <p className="text-dark/90 text-base font-medium max-w-lg">
                {isEn
                  ? 'Solve physical chemistry problems, earn XP, and unlock new pioneer badges!'
                  : 'Resolva os problemas físico-químicos, acumule XP e desbloqueie novas insígnias!'}
              </p>
            </div>

            {/* Widget de Progresso Gamificado */}
            <div className="bg-white border-4 border-dark rounded-2xl p-5 min-w-[240px] shadow-neo hover:shadow-neo-hover transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider mb-2 text-dark">
                <span>{isEn ? 'Your Completion' : 'Sua Conclusão'}</span>
                <span className="font-mono text-lg">{taxaConclusao}%</span>
              </div>
              <div className="w-full bg-white border-2 border-dark h-3 rounded-full overflow-hidden mb-2 shadow-inner-sm">
                <div
                  className="bg-brand border-r-2 border-dark h-full transition-all duration-700 ease-out"
                  style={{ width: `${taxaConclusao}%` }}
                />
              </div>
              <span className="text-xs text-dark font-black uppercase tracking-widest block text-right">
                {isEn
                  ? `${totalRespondidos} OF ${totalGeral} SOLVED`
                  : `${totalRespondidos} DE ${totalGeral} FEITAS`}
              </span>
            </div>
          </div>

          {/* Filtros em Pilula com Micro-animacoes */}
          <div className="mt-8 pt-6 border-t-4 border-dark flex flex-wrap items-center gap-3">
            <span className="text-sm font-black text-dark mr-2 flex items-center gap-2 uppercase tracking-wide">
              <Filter className="w-5 h-5 stroke-[2.5]" />
              {isEn ? 'Filter:' : 'Filtro:'}
            </span>
            {[
              { id: 'TODOS', label: isEn ? 'All Questions' : 'Todas as Questões' },
              { id: 'CINETICA', label: isEn ? 'Chemical Kinetics' : 'Cinética Química' },
              { id: 'MAXWELL', label: 'Maxwell-Boltzmann' },
              { id: 'DSC', label: isEn ? 'DSC Calorimetry' : 'Calorimetria DSC' },
              { id: 'AVANCADO', label: isEn ? 'Advanced' : 'Avançado' },
            ].map(mod => (
              <button
                key={mod.id}
                onClick={() => setFiltroModulo(mod.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-200 uppercase tracking-widest border-2 cursor-pointer ${
                  filtroModulo === mod.id
                    ? 'bg-dark text-white border-dark shadow-neo-sm scale-105'
                    : 'bg-white hover:bg-brand hover:border-dark text-dark border-dark shadow-neo-sm'
                }`}
              >
                {mod.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Questoes com Design Elevado */}
        {loading ? (
          <div className="bg-white border-4 border-dark shadow-neo rounded-3xl p-12 text-center text-sm text-dark font-black uppercase tracking-widest">
            <div className="w-10 h-10 border-4 border-dark border-t-brand rounded-full animate-spin mx-auto mb-4"></div>
            {isEn ? 'Loading question bank...' : 'Carregando banco de questões...'}
          </div>
        ) : (
          <div className="space-y-8">
            {exerciciosFiltrados.map((ex, index) => {
              const isResolvido = exerciciosResolvidosSet.has(ex.id) || feedbacks[ex.id]?.correto;
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
                          <CheckCircle2 className="w-5 h-5 text-brand stroke-[2.5]" />
                          <span>{isEn ? 'COMPLETED' : 'CONCLUÍDO'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-2 px-3 py-1.5 bg-white text-dark border-2 border-dark rounded-md text-xs font-black uppercase tracking-widest shadow-neo-sm">
                          <Award className="w-5 h-5 text-dark stroke-[2.5]" />
                          <span>
                            +{ex.recompensaXp} XP / +{ex.recompensaPontos} PTS
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Titulo e Enunciado */}
                  <div className="space-y-4">
                    <h3 className="text-2xl sm:text-3xl font-black text-dark tracking-tighter uppercase font-display leading-none">
                      {ex.titulo}
                    </h3>
                    <p className="text-dark text-base sm:text-lg leading-relaxed font-medium">
                      {ex.enunciado}
                    </p>
                  </div>

                  {/* Central de Dicas Progressivas (Economia de Moedas) */}
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

                  {/* Area de Resposta */}
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
                            className="btn-quantum-primary px-6 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
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

                    {/* Resposta e Gabarito Comentado com Animacao de Entrada */}
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
                              {isEn ? 'Answer Key & Solution:' : 'Gabarito e Resolução:'}
                            </strong>
                            <p className="font-bold">{fb.explicacao}</p>
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
      </main>
    </div>
  );
}
