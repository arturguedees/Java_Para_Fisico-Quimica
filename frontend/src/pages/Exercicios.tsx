import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { HelpCircle, CheckCircle, AlertCircle, ArrowRight, Sparkles, Filter } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-canvas text-slate-100 pb-24 font-sans">
      <Navbar usuario={usuario} />

      <main className="max-w-5xl mx-auto px-4 sm:px-8 pt-8 space-y-6">
        
        {/* Cabeçalho */}
        <div className="bg-surface border border-border rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
          <div>
            <span className="text-xs font-mono font-bold text-brand uppercase">CADERNO DE QUESTÕES</span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Central de Exercícios & Quiz
            </h1>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
            {['TODOS', 'CINETICA', 'MAXWELL', 'DSC', 'AVANCADO'].map(mod => (
              <button
                key={mod}
                onClick={() => setFiltroModulo(mod)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  filtroModulo === mod
                    ? 'bg-brand text-white shadow-md'
                    : 'bg-surface-elevated text-slate-300 hover:text-white border border-border'
                }`}
              >
                {mod === 'TODOS' ? 'Todos os Tópicos' : mod}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Questões */}
        {loading ? (
          <div className="font-mono text-sm text-slate-400 py-12 text-center">
            Carregando banco de questões...
          </div>
        ) : (
          <div className="space-y-6">
            {exerciciosFiltrados.map((ex, index) => {
              const isResolvido = exerciciosResolvidosSet.has(ex.id) || (feedbacks[ex.id]?.correto);
              const fb = feedbacks[ex.id];

              return (
                <article
                  key={ex.id}
                  className={`bg-surface border rounded-xl p-6 sm:p-8 space-y-4 shadow-md transition-all ${
                    isResolvido
                      ? 'border-emerald-500/60 bg-surface/90'
                      : 'border-border hover:border-border-light'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3 text-xs font-mono">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-brand font-bold">QUESTÃO {String(index + 1).padStart(2, '0')}</span>
                      <span className="text-slate-500">•</span>
                      <span className="px-2 py-0.5 bg-surface-elevated rounded border border-border text-slate-300">
                        {ex.modulo}
                      </span>
                      <span className="text-slate-400">({ex.nivel})</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isResolvido ? (
                        <span className="text-emerald-400 font-bold flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>RESOLVIDO</span>
                        </span>
                      ) : (
                        <span className="text-amber-400 font-bold bg-amber-950/40 px-2.5 py-0.5 rounded border border-amber-500/30">
                          +{ex.recompensaXp} XP • +{ex.recompensaPontos} PTS
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                    {ex.titulo}
                  </h3>

                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                    {ex.enunciado}
                  </p>

                  {/* Formulário */}
                  <div className="pt-2 space-y-4">
                    {ex.tipo === 'NUMERICO' ? (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <input
                          type="number"
                          step="any"
                          value={respostas[ex.id] ?? ''}
                          onChange={e => setRespostas({ ...respostas, [ex.id]: e.target.value })}
                          disabled={isResolvido}
                          placeholder="Digite seu valor numérico..."
                          className="px-4 py-3 bg-surface-elevated border border-border-light rounded-lg text-sm text-white font-mono focus:outline-none focus:border-brand disabled:opacity-50 sm:w-80"
                        />
                        <button
                          onClick={() => handleResponder(ex)}
                          disabled={isResolvido || processando[ex.id] || respostas[ex.id] === undefined}
                          className="px-6 py-3 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-lg transition shadow-md disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                          <span>{isResolvido ? 'Concluído' : processando[ex.id] ? 'Validando...' : 'Confirmar Resposta'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {ex.opcoes.map((op, idx) => (
                          <label
                            key={idx}
                            className={`flex items-start space-x-3 p-3.5 rounded-lg border text-sm font-medium cursor-pointer transition ${
                              respostas[ex.id] === idx
                                ? 'border-brand bg-brand-subtle text-white'
                                : 'border-border bg-surface-elevated text-slate-300 hover:text-white hover:border-border-light'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`opcao_${ex.id}`}
                              value={idx}
                              checked={respostas[ex.id] === idx}
                              onChange={() => setRespostas({ ...respostas, [ex.id]: idx })}
                              disabled={isResolvido}
                              className="mt-1 accent-brand w-4 h-4"
                            />
                            <span>{op}</span>
                          </label>
                        ))}

                        <div className="pt-2">
                          <button
                            onClick={() => handleResponder(ex)}
                            disabled={isResolvido || processando[ex.id] || respostas[ex.id] === undefined}
                            className="px-6 py-3 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-lg transition shadow-md disabled:opacity-50 flex items-center justify-center space-x-2"
                          >
                            <span>{isResolvido ? 'Concluído' : processando[ex.id] ? 'Validando...' : 'Confirmar Opção'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Feedback */}
                    {fb && (
                      <div
                        className={`p-4 rounded-lg border text-sm space-y-1.5 ${
                          fb.correto
                            ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                            : 'border-rose-500/50 bg-rose-950/40 text-rose-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2 font-bold">
                          {fb.correto ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                          <span>{fb.mensagem}</span>
                        </div>
                        {fb.explicacao && (
                          <p className="text-slate-200 text-xs sm:text-sm pt-1 leading-relaxed">
                            <strong className="text-white">Explicação Teórica:</strong> {fb.explicacao}
                          </p>
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
