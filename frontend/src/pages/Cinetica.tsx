import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { 
  FlaskConical, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  Info, 
  Timer, 
  Activity, 
  Zap,
  ArrowRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function Cinetica() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<any>(null);

  // Parâmetros de Simulação Cinética
  const [ordem, setOrdem] = useState<number>(1);
  const [k, setK] = useState<number>(0.15);
  const [a0, setA0] = useState<number>(2.0);
  const [tempoMax, setTempoMax] = useState<number>(25);

  // Dados calculados pelo backend Java
  const [dadosGrafico, setDadosGrafico] = useState<any>(null);
  const [meiaVida, setMeiaVida] = useState<number | null>(null);
  const [tempoVida, setTempoVida] = useState<number | null>(null);

  // Desafio Embutido no Laboratório
  const [respostaUsuario, setRespostaUsuario] = useState<string>('');
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro' | null; msg: string }>({ tipo: null, msg: '' });
  const [resolvido, setResolvido] = useState<boolean>(false);

  useEffect(() => {
    const data = localStorage.getItem('usuario');
    if (!data) {
      navigate('/login');
    } else {
      const u = JSON.parse(data);
      setUsuario(u);
      // Verifica se o exercício desta página já foi resolvido
      if (u.exerciciosResolvidos && u.exerciciosResolvidos.includes('cin_lab_01')) {
        setResolvido(true);
      }
    }
  }, [navigate]);

  useEffect(() => {
    calcularCinetica();
  }, [ordem, k, a0, tempoMax]);

  const calcularCinetica = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/cinetica/calcular', {
        params: {
          concentracaoInicial: a0,
          constanteVelocidade: k,
          ordem: ordem,
          tempoMaximo: tempoMax
        }
      });

      setMeiaVida(res.data.meiaVida);
      setTempoVida(res.data.tempoVida || null);

      setDadosGrafico({
        labels: res.data.tempo.map((t: number) => t.toFixed(1)),
        datasets: [
          {
            label: '[A] Concentração do Reagente (M)',
            data: res.data.concentracaoA,
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            fill: true,
            pointRadius: 0,
            borderWidth: 3,
            tension: 0.2
          },
          {
            label: '[B] Concentração do Produto (M)',
            data: res.data.concentracaoB,
            borderColor: '#a855f7',
            backgroundColor: 'rgba(168, 85, 247, 0.05)',
            fill: true,
            pointRadius: 0,
            borderWidth: 3,
            borderDash: [5, 5],
            tension: 0.2
          }
        ]
      });
    } catch (err) {
      console.error('Erro ao calcular cinética:', err);
    }
  };

  const verificarDesafio = async () => {
    if (!respostaUsuario.trim()) return;

    const valor = parseFloat(respostaUsuario);
    if (isNaN(valor)) {
      setFeedback({ tipo: 'erro', msg: 'Insira um valor numérico válido.' });
      return;
    }

    if (!meiaVida) return;

    const erroRelativo = Math.abs((valor - meiaVida) / meiaVida);
    if (erroRelativo <= 0.06) {
      setResolvido(true);
      setFeedback({
        tipo: 'sucesso',
        msg: `Excelente! O valor de t½ calculado é ${meiaVida.toFixed(2)} s. Você recebeu +60 XP e +60 Moedas!`
      });

      if (usuario) {
        try {
          const res = await axios.post(
            `http://localhost:8080/api/usuarios/${usuario.id}/ganhar-xp?pontosXp=60&exercicioId=cin_lab_01`
          );
          setUsuario(res.data);
          localStorage.setItem('usuario', JSON.stringify(res.data));
        } catch (e) {
          console.error('Erro ao pontuar', e);
        }
      }
    } else {
      setFeedback({
        tipo: 'erro',
        msg: `Não está correto. Dica: Para ordem ${ordem}, use ${
          ordem === 1 ? 't½ = ln(2) / k = 0.693 / ' + k : 't½ = [A]₀ / (2k) = ' + a0 + ' / (2*' + k + ')'
        }.`
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar usuario={usuario} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Cabeçalho do Laboratório */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <FlaskConical className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Laboratório de Cinética Química</h1>
              <p className="text-xs text-slate-400">
                Simulação determinística de decaimento de reagentes e formação de produtos moleculares
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Ordem {ordem}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
              k = {k} s⁻¹
            </span>
          </div>
        </div>

        {/* Grade de Controles e Gráfico */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Painel de Controles */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 lg:col-span-1 shadow-xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Parâmetros de Reação</span>
            </h2>

            {/* Seletor de Ordem */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Ordem Cinética</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrdem(0)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                    ordem === 0
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  Ordem Zero
                </button>
                <button
                  type="button"
                  onClick={() => setOrdem(1)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                    ordem === 1
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  1ª Ordem
                </button>
              </div>
            </div>

            {/* Constante de Velocidade k */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-300">Constante (k)</span>
                <span className="text-cyan-400 font-mono font-bold">{k}</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.8"
                step="0.01"
                value={k}
                onChange={e => setK(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Concentração Inicial [A]0 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-300">Concentração [A]₀</span>
                <span className="text-cyan-400 font-mono font-bold">{a0} M</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="5.0"
                step="0.1"
                value={a0}
                onChange={e => setA0(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Tempo Máximo */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-300">Janela Temporal</span>
                <span className="text-cyan-400 font-mono font-bold">{tempoMax} s</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={tempoMax}
                onChange={e => setTempoMax(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Painel de Resultados Físicos */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5 pt-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <Timer className="w-3.5 h-3.5 text-cyan-400" />
                <span>Propriedades da Reação</span>
              </span>

              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Meia-vida (t½):</span>
                <span className="font-bold text-cyan-300">
                  {meiaVida ? `${meiaVida.toFixed(2)} s` : '-'}
                </span>
              </div>

              {tempoVida && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Tempo de Vida (τ):</span>
                  <span className="font-bold text-purple-300">{tempoVida.toFixed(2)} s</span>
                </div>
              )}

              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800 font-mono">
                {ordem === 1 ? '[A](t) = [A]₀ · e^(-kt)' : '[A](t) = max(0, [A]₀ - kt)'}
              </div>
            </div>

          </div>

          {/* Gráfico Científico */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-3 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <span>Evolução Temporal das Concentrações</span>
                </h2>
                <div className="flex items-center space-x-3 text-xs">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                    <span className="text-slate-300">[A] Reagente</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                    <span className="text-slate-300">[B] Produto</span>
                  </div>
                </div>
              </div>

              <div className="h-80 w-full">
                {dadosGrafico ? (
                  <Line
                    data={dadosGrafico}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      animation: false,
                      scales: {
                        x: {
                          grid: { color: 'rgba(255, 255, 255, 0.05)' },
                          ticks: { color: '#94a3b8', font: { size: 10 } },
                          title: { display: true, text: 'Tempo (segundos)', color: '#94a3b8' }
                        },
                        y: {
                          grid: { color: 'rgba(255, 255, 255, 0.05)' },
                          ticks: { color: '#94a3b8', font: { size: 10 } },
                          title: { display: true, text: 'Concentração (Molar)', color: '#94a3b8' },
                          min: 0
                        }
                      },
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: '#0f172a',
                          titleColor: '#06b6d4',
                          bodyColor: '#e2e8f0',
                          borderColor: '#334155',
                          borderWidth: 1
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500">
                    Processando simulação...
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center space-x-2 text-xs text-slate-400">
              <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>
                Reagente A decai exponencialmente (1ª ordem) ou linearmente (ordem zero) até atingir o equilíbrio estequiométrico ou exaustão total.
              </span>
            </div>
          </div>

        </div>

        {/* Desafio de Laboratório Gamificado */}
        <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Desafio Prático do Laboratório</h3>
                <p className="text-xs text-slate-400">
                  Responda com base nos parâmetros atuais (k = {k}, [A]₀ = {a0}, Ordem {ordem})
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                +60 XP & Moedas
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-300 mb-4">
            Qual é o <strong>Tempo de Meia-Vida (t½ em segundos)</strong> para os parâmetros configurados no painel lateral?
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="number"
              step="0.01"
              value={respostaUsuario}
              onChange={e => setRespostaUsuario(e.target.value)}
              disabled={resolvido}
              placeholder="Ex: 4.62"
              className="px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-60"
            />
            <button
              onClick={verificarDesafio}
              disabled={resolvido || !respostaUsuario}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition flex items-center justify-center space-x-2"
            >
              <span>{resolvido ? 'Desafio Concluído' : 'Validar Resposta'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {feedback.tipo && (
            <div
              className={`mt-4 p-3.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 ${
                feedback.tipo === 'sucesso'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}
            >
              {feedback.tipo === 'sucesso' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <HelpCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{feedback.msg}</span>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
