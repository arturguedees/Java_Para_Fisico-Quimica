import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { HelpCircle, CheckCircle2, AlertCircle, ArrowRight, Sparkles, Filter, Award, Zap, Check, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import Navbar from '../components/Navbar';

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

export default function Exercicios() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<any>(null);
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [filtroModulo, setFiltroModulo] = useState<string>('TODOS');
  const [loading, setLoading] = useState(true);

  // Estado das respostas
  const [respostas, setRespostas] = useState<{ [key: string]: any }>({});
  const [feedbacks, setFeedbacks] = useState<{ [key: string]: any }>({});
  const [processando, setProcessando] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const data = localStorage.getItem('usuario');
    if (!data) {
      navigate('/login');
    } else {
      const u = JSON.parse(data);
      setUsuario(u);
      carregarExercicios();
    }
  }, [navigate]);

  const carregarExercicios = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/exercicios');
      setExercicios(res.data);
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
        colors: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899']
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
      const res = await axios.post('http://localhost:8080/api/exercicios/validar', {
        id: exercicio.id,
        resposta: resposta
      });

      const resultado = res.data;
      setFeedbacks(prev => ({ ...prev, [exercicio.id]: resultado }));

      if (resultado.correto) {
        dispararConfetes();

        if (usuario) {
          const resUser = await axios.post(
            `http://localhost:8080/api/usuarios/${usuario.id}/ganhar-xp?pontosXp=${resultado.xpGanho}&exercicioId=${exercicio.id}`
          );
          setUsuario(resUser.data);
          localStorage.setItem('usuario', JSON.stringify(resUser.data));
        }
      }
    } catch (err) {
      console.error('Erro ao validar resposta:', err);
    } finally {
      setProcessando(prev => ({ ...prev, [exercicio.id]: false }));
    }
  };

  const exerciciosResolvidosSet = new Set(
    usuario?.exerciciosResolvidos ? usuario.exerciciosResolvidos.split(',') : []
  );

  const exerciciosFiltrados = exercicios.filter(ex => {
    if (filtroModulo === 'TODOS') return true;
    return ex.modulo === filtroModulo;
  });

  const totalRespondidos = exerciciosResolvidosSet.size;
  const totalGeral = exercicios.length || 1;
  const taxaConclusao = Math.round((totalRespondidos / totalGeral) * 100);

  const letras = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="min-h-screen text-slate-800 pb-24 font-sans">
      <Navbar usuario={usuario} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        
        {/* Cabeçalho Interativo com Barra de Progresso do Banco */}
        <div className="quantum-card rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/80 rounded-full text-xs font-bold text-indigo-700 mb-2 shadow-2xs">
                <Zap className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500 animate-pulse" />
                <span>BANCO DE QUESTÕES & TREINAMENTO PRÁTICO</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Caderno de Exercícios & Quiz
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                Resolva os problemas físico-químicos, acumule XP e desbloqueie novas insígnias!
              </p>
            </div>

            {/* Widget de Progresso Gamificado */}
            <div className="bg-gradient-to-br from-indigo-50/50 via-slate-50 to-slate-100 border border-indigo-100 rounded-2xl p-4 min-w-[200px] shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-600">Sua Conclusão</span>
                <span className="text-indigo-600 font-mono">{taxaConclusao}%</span>
              </div>
              <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden mb-2">
                <div 
                  className="bg-gradient-to-r from-indigo-600 via-blue-500 to-emerald-500 h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${taxaConclusao}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 font-medium block text-right font-mono">
                {totalRespondidos} de {totalGeral} concluídas
              </span>
            </div>
          </div>

          {/* Filtros em Pílula com Micro-animações */}
          <div className="mt-6 pt-5 border-t border-slate-200/60 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-indigo-500" />
              Filtrar por tópico:
            </span>
            {[
              { id: 'TODOS', label: 'Todas as Questões' },
              { id: 'CINETICA', label: 'Cinética Química' },
              { id: 'MAXWELL', label: 'Maxwell-Boltzmann' },
              { id: 'DSC', label: 'Calorimetria DSC' },
              { id: 'AVANCADO', label: 'Avançado' }
            ].map(mod => (
              <button
                key={mod.id}
                onClick={() => setFiltroModulo(mod.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  filtroModulo === mod.id
                    ? 'btn-quantum-primary shadow-sm scale-105'
                    : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/90 shadow-2xs'
                }`}
              >
                {mod.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Questões com Design Elevado */}
        {loading ? (
          <div className="quantum-card rounded-3xl p-12 text-center text-sm text-slate-500 font-medium">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Carregando banco de questões interativo...
          </div>
        ) : (
          <div className="space-y-6">
            {exerciciosFiltrados.map((ex, index) => {
              const isResolvido = exerciciosResolvidosSet.has(ex.id) || (feedbacks[ex.id]?.correto);
              const fb = feedbacks[ex.id];

              return (
                <article
                  key={ex.id}
                  className={`quantum-card rounded-3xl p-6 sm:p-8 space-y-5 transition-all duration-300 ${
                    isResolvido
                      ? 'border-emerald-300 ring-2 ring-emerald-100 bg-gradient-to-br from-white via-white to-emerald-50/20'
                      : 'hover:border-indigo-300'
                  }`}
                >
                  {/* Cabeçalho da Questão */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center space-x-2.5 text-xs font-bold">
                      <span className="px-2.5 py-1 bg-slate-900 text-white rounded-lg font-mono tracking-wider shadow-xs">
                        QUESTÃO {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200/70">
                        {ex.modulo}
                      </span>
                      <span className="text-slate-500 font-medium">
                        Dificuldade: <strong className="text-slate-800">{ex.nivel}</strong>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isResolvido ? (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold shadow-2xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>RESOLVIDO COM SUCESSO</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold shadow-2xs">
                          <Award className="w-3.5 h-3.5 text-amber-600" />
                          <span>+{ex.recompensaXp} XP • +{ex.recompensaPontos} PTS</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Título e Enunciado */}
                  <div className="space-y-2.5">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                      {ex.titulo}
                    </h3>
                    <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-normal">
                      {ex.enunciado}
                    </p>
                  </div>

                  {/* Área de Resposta */}
                  <div className="pt-2">
                    {ex.tipo === 'NUMERICO' ? (
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <input
                            type="number"
                            step="any"
                            value={respostas[ex.id] ?? ''}
                            onChange={e => setRespostas({ ...respostas, [ex.id]: e.target.value })}
                            disabled={isResolvido}
                            placeholder="Digite o resultado exato..."
                            className="px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white disabled:opacity-60 sm:w-80 font-mono font-medium shadow-xs"
                          />
                          <button
                            onClick={() => handleResponder(ex)}
                            disabled={isResolvido || processando[ex.id] || respostas[ex.id] === undefined || respostas[ex.id] === ''}
                            className="btn-quantum-primary px-6 py-3 rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center space-x-2"
                          >
                            <span>{isResolvido ? 'Concluído' : processando[ex.id] ? 'Validando...' : 'Confirmar Resposta'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {ex.opcoes.map((op, idx) => {
                          const isSelected = respostas[ex.id] === idx;
                          return (
                            <label
                              key={idx}
                              className={`group relative flex items-start space-x-3.5 p-4 rounded-2xl border text-sm font-medium cursor-pointer transition-all duration-200 select-none ${
                                isSelected
                                  ? 'border-indigo-600 bg-gradient-to-r from-indigo-50/80 to-blue-50/40 text-indigo-950 shadow-md ring-2 ring-indigo-500/20 translate-x-1'
                                  : 'border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:translate-x-0.5'
                              } ${isResolvido ? 'cursor-default' : ''}`}
                            >
                              <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-200 ${
                                isSelected
                                  ? 'bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-sm scale-110'
                                  : 'bg-slate-100 text-slate-600 border border-slate-300 group-hover:bg-slate-200'
                              }`}>
                                {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : letras[idx] || idx + 1}
                              </div>
                              <div className="flex-1 leading-snug pt-0.5">
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

                        <div className="pt-3">
                          <button
                            onClick={() => handleResponder(ex)}
                            disabled={isResolvido || processando[ex.id] || respostas[ex.id] === undefined}
                            className="btn-quantum-primary px-7 py-3.5 rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center space-x-2 shadow-md"
                          >
                            <span>{isResolvido ? 'Concluído' : processando[ex.id] ? 'Validando...' : 'Confirmar Opção'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Resposta e Gabarito Comentado com Animação de Entrada */}
                    {fb && (
                      <div
                        className={`mt-5 p-5 rounded-2xl border text-sm space-y-2.5 animate-slide-up ${
                          fb.correto
                            ? 'border-emerald-300 bg-gradient-to-br from-emerald-50 via-emerald-50/60 to-white text-emerald-950 shadow-md shadow-emerald-500/10'
                            : 'border-rose-300 bg-gradient-to-br from-rose-50 via-rose-50/60 to-white text-rose-950 shadow-md shadow-rose-500/10'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 font-extrabold text-base">
                          {fb.correto ? (
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 animate-bounce" />
                          ) : (
                            <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0 animate-pulse" />
                          )}
                          <span>{fb.mensagem}</span>
                        </div>
                        {fb.explicacao && (
                          <div className="pt-2.5 border-t border-current/15 text-xs sm:text-sm leading-relaxed text-slate-700">
                            <strong className="text-slate-900 block mb-1">📖 Gabarito e Resolução Teórica:</strong>
                            <p>{fb.explicacao}</p>
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
