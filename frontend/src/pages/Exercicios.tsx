import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { HelpCircle, CheckCircle, AlertCircle, ArrowRight, Sparkles, Filter, Check, X, Award } from 'lucide-react';
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

      if (resultado.correto && usuario) {
        const resUser = await axios.post(
          `http://localhost:8080/api/usuarios/${usuario.id}/ganhar-xp?pontosXp=${resultado.xpGanho}&exercicioId=${exercicio.id}`
        );
        setUsuario(resUser.data);
        localStorage.setItem('usuario', JSON.stringify(resUser.data));
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

  const letras = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 font-sans">
      <Navbar usuario={usuario} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        
        {/* Cabeçalho da Central de Questões */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-semibold text-blue-700 mb-2">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>BANCO DE QUESTÕES & TREINAMENTO</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Caderno de Exercícios & Quiz
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                Resolva problemas de físico-química, acumule XP para subir de nível e desbloquear insígnias.
              </p>
            </div>

            {/* Contador de Conclusão */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center space-x-3 self-start md:self-auto">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 block font-medium">Resolvidas por você</span>
                <span className="text-base font-bold text-slate-900">
                  {exerciciosResolvidosSet.size} de {exercicios.length}
                </span>
              </div>
            </div>
          </div>

          {/* Filtros por Módulo / Tópico */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Filtrar por tema:
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
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filtroModulo === mod.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {mod.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Questões */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-sm text-slate-500 font-medium">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Carregando questões do banco...
          </div>
        ) : (
          <div className="space-y-6">
            {exerciciosFiltrados.map((ex, index) => {
              const isResolvido = exerciciosResolvidosSet.has(ex.id) || (feedbacks[ex.id]?.correto);
              const fb = feedbacks[ex.id];

              return (
                <article
                  key={ex.id}
                  className={`bg-white border rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm transition-all ${
                    isResolvido
                      ? 'border-emerald-300 ring-1 ring-emerald-200'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Cabeçalho da Questão */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-slate-100">
                    <div className="flex items-center space-x-2.5 text-xs">
                      <span className="px-2.5 py-1 bg-slate-900 text-white rounded-md font-bold tracking-wider">
                        QUESTÃO {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md font-semibold border border-blue-200">
                        {ex.modulo}
                      </span>
                      <span className="text-slate-500 font-medium">
                        Nível: <strong className="text-slate-700">{ex.nivel}</strong>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isResolvido ? (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>RESOLVIDO</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-semibold">
                          <Award className="w-3.5 h-3.5 text-amber-600" />
                          <span>+{ex.recompensaXp} XP • +{ex.recompensaPontos} PTS</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Título e Enunciado */}
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">
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
                            placeholder="Digite o valor calculado..."
                            className="px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white disabled:opacity-60 sm:w-80 font-mono font-medium"
                          />
                          <button
                            onClick={() => handleResponder(ex)}
                            disabled={isResolvido || processando[ex.id] || respostas[ex.id] === undefined || respostas[ex.id] === ''}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition shadow-sm disabled:opacity-50 flex items-center justify-center space-x-2"
                          >
                            <span>{isResolvido ? 'Concluído' : processando[ex.id] ? 'Validando...' : 'Confirmar Resposta'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {ex.opcoes.map((op, idx) => {
                          const isSelected = respostas[ex.id] === idx;
                          return (
                            <label
                              key={idx}
                              className={`flex items-start space-x-3.5 p-4 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm ring-1 ring-blue-500'
                                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                              } ${isResolvido ? 'cursor-default' : ''}`}
                            >
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                                isSelected
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-100 text-slate-600 border border-slate-300'
                              }`}>
                                {letras[idx] || idx + 1}
                              </div>
                              <div className="flex-1 leading-snug">
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
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition shadow-sm disabled:opacity-50 flex items-center justify-center space-x-2"
                          >
                            <span>{isResolvido ? 'Concluído' : processando[ex.id] ? 'Validando...' : 'Responder Questão'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Resposta e Gabarito Comentado (Feedback) */}
                    {fb && (
                      <div
                        className={`mt-4 p-4 sm:p-5 rounded-xl border text-sm space-y-2 ${
                          fb.correto
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                            : 'border-rose-200 bg-rose-50 text-rose-900'
                        }`}
                      >
                        <div className="flex items-center space-x-2 font-bold text-base">
                          {fb.correto ? (
                            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                          )}
                          <span>{fb.mensagem}</span>
                        </div>
                        {fb.explicacao && (
                          <div className="pt-2 border-t border-current/10 text-xs sm:text-sm leading-relaxed text-slate-700">
                            <strong className="text-slate-900 block mb-1">📖 Resolução Comentada:</strong>
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
