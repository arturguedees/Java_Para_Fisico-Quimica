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
    <div className="min-h-screen pb-24">
      <Navbar usuario={usuario} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 space-y-10">
        
        {/* Cabeçalho Interativo com Barra de Progresso do Banco */}
        <div className="quantum-card bg-brand p-6 sm:p-10 shadow-neo">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-white border-2 border-dark rounded-full text-xs font-black text-dark shadow-neo-sm uppercase tracking-widest">
                <Zap className="w-4 h-4 text-dark fill-dark" />
                <span>BANCO DE QUESTÕES & TREINAMENTO</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-dark tracking-tighter uppercase font-display leading-tight">
                Caderno de Exercícios
              </h1>
              <p className="text-dark/90 text-base font-medium max-w-lg">
                Resolva os problemas físico-químicos, acumule XP e desbloqueie novas insígnias!
              </p>
            </div>

            {/* Widget de Progresso Gamificado */}
            <div className="bg-white border-4 border-dark rounded-2xl p-5 min-w-[240px] shadow-neo hover:shadow-neo-hover transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider mb-2 text-dark">
                <span>Sua Conclusão</span>
                <span className="font-mono text-lg">{taxaConclusao}%</span>
              </div>
              <div className="w-full bg-white border-2 border-dark h-3 rounded-full overflow-hidden mb-2 shadow-inner-sm">
                <div 
                  className="bg-brand border-r-2 border-dark h-full transition-all duration-700 ease-out"
                  style={{ width: `${taxaConclusao}%` }}
                />
              </div>
              <span className="text-xs text-dark font-black uppercase tracking-widest block text-right">
                {totalRespondidos} DE {totalGeral} FEITAS
              </span>
            </div>
          </div>

          {/* Filtros em Pílula com Micro-animações */}
          <div className="mt-8 pt-6 border-t-4 border-dark flex flex-wrap items-center gap-3">
            <span className="text-sm font-black text-dark mr-2 flex items-center gap-2 uppercase tracking-wide">
              <Filter className="w-5 h-5 stroke-[2.5]" />
              Filtro:
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
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-200 uppercase tracking-widest border-2 ${
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

        {/* Lista de Questões com Design Elevado */}
        {loading ? (
          <div className="bg-white border-4 border-dark shadow-neo rounded-3xl p-12 text-center text-sm text-dark font-black uppercase tracking-widest">
            <div className="w-10 h-10 border-4 border-dark border-t-brand rounded-full animate-spin mx-auto mb-4"></div>
            Carregando banco de questões...
          </div>
        ) : (
          <div className="space-y-8">
            {exerciciosFiltrados.map((ex, index) => {
              const isResolvido = exerciciosResolvidosSet.has(ex.id) || (feedbacks[ex.id]?.correto);
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
                  {/* Cabeçalho da Questão */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-dark/20">
                    <div className="flex flex-wrap items-center gap-2.5 text-xs font-black uppercase tracking-wider">
                      <span className="px-3 py-1.5 bg-dark text-white rounded-md font-mono shadow-neo-sm border-2 border-dark">
                        QUESTÃO {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="px-3 py-1.5 bg-white text-dark rounded-md border-2 border-dark shadow-neo-sm">
                        {ex.modulo}
                      </span>
                      <span className="px-3 py-1.5 bg-yellow-300 text-dark rounded-md border-2 border-dark shadow-neo-sm">
                        NÍVEL {ex.nivel}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isResolvido ? (
                        <span className="inline-flex items-center space-x-2 px-3 py-1.5 bg-dark text-white border-2 border-dark rounded-md text-xs font-black uppercase tracking-widest shadow-neo-sm">
                          <CheckCircle2 className="w-5 h-5 text-brand stroke-[2.5]" />
                          <span>CONCLUÍDO</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-2 px-3 py-1.5 bg-white text-dark border-2 border-dark rounded-md text-xs font-black uppercase tracking-widest shadow-neo-sm">
                          <Award className="w-5 h-5 text-dark stroke-[2.5]" />
                          <span>+{ex.recompensaXp} XP / +{ex.recompensaPontos} PTS</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Título e Enunciado */}
                  <div className="space-y-4">
                    <h3 className="text-2xl sm:text-3xl font-black text-dark tracking-tighter uppercase font-display leading-none">
                      {ex.titulo}
                    </h3>
                    <p className="text-dark text-base sm:text-lg leading-relaxed font-medium">
                      {ex.enunciado}
                    </p>
                  </div>

                  {/* Área de Resposta */}
                  <div className="pt-4">
                    {ex.tipo === 'NUMERICO' ? (
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                          <input
                            type="number"
                            step="any"
                            value={respostas[ex.id] ?? ''}
                            onChange={e => setRespostas({ ...respostas, [ex.id]: e.target.value })}
                            disabled={isResolvido}
                            placeholder="Digite o resultado exato..."
                            className="px-5 py-3 bg-white border-4 border-dark rounded-xl text-base text-dark placeholder-dark/40 focus:outline-none focus:border-brand disabled:opacity-60 sm:w-80 font-mono font-black shadow-neo-sm transition-all"
                          />
                          <button
                            onClick={() => handleResponder(ex)}
                            disabled={isResolvido || processando[ex.id] || respostas[ex.id] === undefined || respostas[ex.id] === ''}
                            className="btn-quantum-primary px-6 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest disabled:opacity-50 flex items-center justify-center space-x-2"
                          >
                            <span>{isResolvido ? 'Concluído' : processando[ex.id] ? 'Validando...' : 'Confirmar'}</span>
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
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 transition-all duration-200 border-2 ${
                                isSelected
                                  ? 'bg-brand border-brand text-dark scale-110'
                                  : 'bg-white text-dark border-dark group-hover:bg-dark group-hover:text-white'
                              }`}>
                                {isSelected ? <Check className="w-5 h-5 stroke-[3]" /> : letras[idx] || idx + 1}
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
                            disabled={isResolvido || processando[ex.id] || respostas[ex.id] === undefined}
                            className="btn-quantum-primary px-8 py-4 rounded-xl text-sm font-black uppercase tracking-widest disabled:opacity-50 flex items-center justify-center space-x-2 shadow-neo"
                          >
                            <span>{isResolvido ? 'Concluído' : processando[ex.id] ? 'Validando...' : 'Confirmar Opção'}</span>
                            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Resposta e Gabarito Comentado com Animação de Entrada */}
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
                            <strong className="text-dark block mb-2 font-black uppercase tracking-widest text-sm">Gabarito e Resolução:</strong>
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
