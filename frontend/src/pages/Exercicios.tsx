import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BrainCircuit, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Filter, 
  ArrowRight,
  FlaskConical,
  Wind,
  Flame,
  Award,
  BookOpen
} from 'lucide-react';
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

  // Estado das respostas do formulário
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
      console.error('Erro ao carregar exercícios:', err);
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
        // Envia pontuação ao backend
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

  const getModuloBadge = (mod: string) => {
    switch (mod) {
      case 'CINETICA':
        return { label: 'Cinética', cor: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: FlaskConical };
      case 'MAXWELL':
        return { label: 'Maxwell-Boltzmann', cor: 'bg-teal-500/10 text-teal-400 border-teal-500/30', icon: Wind };
      case 'DSC':
        return { label: 'Calorimetria DSC', cor: 'bg-rose-500/10 text-rose-400 border-rose-500/30', icon: Flame };
      default:
        return { label: 'Teoria Avançada', cor: 'bg-purple-500/10 text-purple-400 border-purple-500/30', icon: Award };
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar usuario={usuario} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Central de Desafios & Quiz Gamificado</h1>
              <p className="text-xs text-slate-400">
                Resolva questões teóricas e práticas, acumule XP e desbloqueie novas patentes científicas
              </p>
            </div>
          </div>

          {/* Filtros de Módulo */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            {['TODOS', 'CINETICA', 'MAXWELL', 'DSC', 'AVANCADO'].map(mod => (
              <button
                key={mod}
                onClick={() => setFiltroModulo(mod)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filtroModulo === mod
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {mod === 'TODOS' ? 'Todos os Módulos' : mod}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Exercícios */}
        {loading ? (
          <div className="text-center py-16 text-slate-500">Carregando catálogo de questões...</div>
        ) : (
          <div className="space-y-6">
            {exerciciosFiltrados.map(ex => {
              const badge = getModuloBadge(ex.modulo);
              const BadgeIcon = badge.icon;
              const isResolvido = exerciciosResolvidosSet.has(ex.id) || (feedbacks[ex.id]?.correto);
              const fb = feedbacks[ex.id];

              return (
                <div
                  key={ex.id}
                  className={`bg-slate-900 border rounded-2xl p-6 transition-all duration-300 shadow-xl ${
                    isResolvido
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : 'border-slate-800 hover:border-purple-500/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center space-x-2.5">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center space-x-1 ${badge.cor}`}>
                        <BadgeIcon className="w-3.5 h-3.5" />
                        <span>{badge.label}</span>
                      </span>

                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {ex.nivel}
                      </span>

                      {isResolvido && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Concluído</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
                      <Sparkles className="w-4 h-4" />
                      <span>+{ex.recompensaXp} XP • +{ex.recompensaPontos} Moedas</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2">{ex.titulo}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-5">{ex.enunciado}</p>

                  {/* Formulário de Resposta */}
                  <div className="space-y-4 pt-2">
                    {ex.tipo === 'NUMERICO' ? (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <input
                          type="number"
                          step="any"
                          value={respostas[ex.id] ?? ''}
                          onChange={e => setRespostas({ ...respostas, [ex.id]: e.target.value })}
                          disabled={isResolvido}
                          placeholder="Digite seu resultado numérico..."
                          className="px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 flex-1"
                        />
                        <button
                          onClick={() => handleResponder(ex)}
                          disabled={isResolvido || processando[ex.id] || respostas[ex.id] === undefined}
                          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-600/30 disabled:opacity-50 transition flex items-center justify-center space-x-2"
                        >
                          <span>{isResolvido ? 'Resolvido' : processando[ex.id] ? 'Validando...' : 'Confirmar Resposta'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {ex.opcoes.map((op, idx) => (
                          <label
                            key={idx}
                            className={`flex items-center space-x-3 p-3.5 rounded-xl border text-xs sm:text-sm font-medium cursor-pointer transition ${
                              respostas[ex.id] === idx
                                ? 'bg-purple-950/40 border-purple-500 text-white'
                                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`opcao_${ex.id}`}
                              value={idx}
                              checked={respostas[ex.id] === idx}
                              onChange={() => setRespostas({ ...respostas, [ex.id]: idx })}
                              disabled={isResolvido}
                              className="w-4 h-4 accent-purple-500"
                            />
                            <span>{op}</span>
                          </label>
                        ))}

                        <div className="pt-2">
                          <button
                            onClick={() => handleResponder(ex)}
                            disabled={isResolvido || processando[ex.id] || respostas[ex.id] === undefined}
                            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-600/30 disabled:opacity-50 transition flex items-center justify-center space-x-2"
                          >
                            <span>{isResolvido ? 'Resolvido' : processando[ex.id] ? 'Validando...' : 'Confirmar Opção'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Feedback e Explicação */}
                    {fb && (
                      <div
                        className={`p-4 rounded-xl border text-xs sm:text-sm space-y-1.5 ${
                          fb.correto
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2 font-bold">
                          {fb.correto ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                          <span>{fb.mensagem}</span>
                        </div>
                        {fb.explicacao && (
                          <p className="text-slate-300 text-xs leading-relaxed pt-1">
                            <strong>Explicação Científica:</strong> {fb.explicacao}
                          </p>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}
