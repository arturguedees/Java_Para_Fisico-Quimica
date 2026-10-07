import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
    <div className="min-h-screen bg-[#0e1013] text-[#e5e2dc] pb-24 font-sans">
      <Navbar usuario={usuario} />

      <main className="max-w-5xl mx-auto px-4 sm:px-8 pt-10 space-y-8">
        
        {/* Cabeçalho */}
        <div className="border-b border-[#1d2027] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="font-mono text-xs text-[#c85a32] uppercase tracking-wider">
              CADERNO DE PROBLEMAS • AVALIAÇÃO CONTÍNUA
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#faf9f5]">
              Desafios & Avaliações Teórico-Práticas
            </h1>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
            {['TODOS', 'CINETICA', 'MAXWELL', 'DSC', 'AVANCADO'].map(mod => (
              <button
                key={mod}
                onClick={() => setFiltroModulo(mod)}
                className={`px-3 py-1.5 border transition-colors ${
                  filtroModulo === mod
                    ? 'border-[#c85a32] bg-[#c85a32]/10 text-[#faf9f5] font-semibold'
                    : 'border-[#1d2027] bg-[#14161b] text-[#918b7e] hover:text-[#e5e2dc]'
                }`}
              >
                {mod === 'TODOS' ? 'Todos os Problemas' : mod}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Questões */}
        {loading ? (
          <div className="font-mono text-xs text-[#918b7e] py-12 text-center">
            CARREGANDO CADERNO DE QUESTÕES...
          </div>
        ) : (
          <div className="space-y-8">
            {exerciciosFiltrados.map((ex, index) => {
              const isResolvido = exerciciosResolvidosSet.has(ex.id) || (feedbacks[ex.id]?.correto);
              const fb = feedbacks[ex.id];

              return (
                <article
                  key={ex.id}
                  className={`border p-6 sm:p-8 space-y-5 transition-colors ${
                    isResolvido
                      ? 'border-[#52754f] bg-[#14161b]'
                      : 'border-[#1d2027] bg-[#14161b]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#1d2027] pb-3 text-xs font-mono">
                    <div className="flex items-center space-x-3">
                      <span className="text-[#c85a32] font-semibold">QUESTÃO {String(index + 1).padStart(2, '0')}</span>
                      <span className="text-[#5e594d]">/</span>
                      <span className="text-[#918b7e] uppercase">{ex.modulo}</span>
                      <span className="text-[#5e594d]">/</span>
                      <span className="text-[#918b7e]">{ex.nivel}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      {isResolvido ? (
                        <span className="text-[#9ebd9c] font-semibold">● RESOLVIDO</span>
                      ) : (
                        <span className="text-[#c85a32]">+{ex.recompensaXp} XP • +{ex.recompensaPontos} PTS</span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl text-[#faf9f5]">
                    {ex.titulo}
                  </h3>

                  <p className="text-sm text-[#e5e2dc] leading-relaxed max-w-4xl font-sans">
                    {ex.enunciado}
                  </p>

                  {/* Formulário */}
                  <div className="pt-2">
                    {ex.tipo === 'NUMERICO' ? (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <input
                          type="number"
                          step="any"
                          value={respostas[ex.id] ?? ''}
                          onChange={e => setRespostas({ ...respostas, [ex.id]: e.target.value })}
                          disabled={isResolvido}
                          placeholder="Informe o valor numérico..."
                          className="px-4 py-2.5 bg-[#0e1013] border border-[#1d2027] text-sm font-mono text-[#faf9f5] focus:outline-none focus:border-[#c85a32] disabled:opacity-50 sm:w-80"
                        />
                        <button
                          onClick={() => handleResponder(ex)}
                          disabled={isResolvido || processando[ex.id] || respostas[ex.id] === undefined}
                          className="px-6 py-2.5 bg-[#c85a32] hover:bg-[#a74521] text-[#faf9f5] text-xs font-mono font-bold uppercase tracking-wider transition disabled:opacity-50"
                        >
                          {isResolvido ? 'Concluído' : processando[ex.id] ? 'Validando...' : 'Submeter Resposta'}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {ex.opcoes.map((op, idx) => (
                          <label
                            key={idx}
                            className={`flex items-start space-x-3 p-3.5 border text-xs sm:text-sm font-sans cursor-pointer transition ${
                              respostas[ex.id] === idx
                                ? 'border-[#c85a32] bg-[#c85a32]/10 text-[#faf9f5]'
                                : 'border-[#1d2027] bg-[#0e1013] text-[#918b7e] hover:text-[#e5e2dc]'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`opcao_${ex.id}`}
                              value={idx}
                              checked={respostas[ex.id] === idx}
                              onChange={() => setRespostas({ ...respostas, [ex.id]: idx })}
                              disabled={isResolvido}
                              className="mt-1 accent-[#c85a32]"
                            />
                            <span>{op}</span>
                          </label>
                        ))}

                        <div className="pt-2">
                          <button
                            onClick={() => handleResponder(ex)}
                            disabled={isResolvido || processando[ex.id] || respostas[ex.id] === undefined}
                            className="px-6 py-2.5 bg-[#c85a32] hover:bg-[#a74521] text-[#faf9f5] text-xs font-mono font-bold uppercase tracking-wider transition disabled:opacity-50"
                          >
                            {isResolvido ? 'Concluído' : processando[ex.id] ? 'Validando...' : 'Confirmar Opção'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Feedback e Explicação */}
                    {fb && (
                      <div
                        className={`mt-4 p-4 border text-xs font-mono space-y-1.5 ${
                          fb.correto
                            ? 'border-[#52754f] bg-[#52754f]/10 text-[#9ebd9c]'
                            : 'border-[#853416] bg-[#853416]/10 text-[#f09673]'
                        }`}
                      >
                        <div className="font-bold">{fb.mensagem}</div>
                        {fb.explicacao && (
                          <p className="font-sans text-xs text-[#e5e2dc] pt-1 leading-relaxed">
                            <strong className="font-mono text-[#faf9f5]">Justificativa Teórica:</strong> {fb.explicacao}
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
