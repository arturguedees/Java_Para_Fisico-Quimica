import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { FlaskConical, CheckCircle, AlertCircle, ArrowRight, Info, HelpCircle } from 'lucide-react';
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

  // Parâmetros de Simulação
  const [ordem, setOrdem] = useState<number>(1);
  const [k, setK] = useState<number>(0.15);
  const [a0, setA0] = useState<number>(2.0);
  const [tempoMax, setTempoMax] = useState<number>(25);

  // Dados calculados
  const [dadosGrafico, setDadosGrafico] = useState<any>(null);
  const [meiaVida, setMeiaVida] = useState<number | null>(null);
  const [tempoVida, setTempoVida] = useState<number | null>(null);

  // Desafio Embutido
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
            label: '[A] Reagente (Molar)',
            data: res.data.concentracaoA,
            borderColor: '#ea580c',
            backgroundColor: 'rgba(234, 88, 12, 0.15)',
            fill: true,
            pointRadius: 0,
            borderWidth: 3,
            tension: 0.1
          },
          {
            label: '[B] Produto (Molar)',
            data: res.data.concentracaoB,
            borderColor: '#38bdf8',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            pointRadius: 0,
            borderWidth: 2.5,
            tension: 0.1
          }
        ]
      });
    } catch (err) {
      console.error('Erro na cinética:', err);
    }
  };

  const verificarDesafio = async () => {
    if (!respostaUsuario.trim()) return;

    const valor = parseFloat(respostaUsuario);
    if (isNaN(valor)) {
      setFeedback({ tipo: 'erro', msg: 'Digite um número válido.' });
      return;
    }

    if (!meiaVida) return;

    const erroRelativo = Math.abs((valor - meiaVida) / meiaVida);
    if (erroRelativo <= 0.06) {
      setResolvido(true);
      setFeedback({
        tipo: 'sucesso',
        msg: `Correto! O tempo de meia-vida é ${meiaVida.toFixed(2)} segundos. Você ganhou +60 XP e +60 Pontos!`
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
        msg: `Incorreto. Para reação de ordem ${ordem}: ${
          ordem === 1 ? 'use t½ = ln(2) / k = 0.693 / ' + k : 'use t½ = [A]₀ / (2k) = ' + a0 + ' / (2 * ' + k + ')'
        }.`
      });
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-slate-100 pb-24 font-sans">
      <Navbar usuario={usuario} />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-6">
        
        {/* Cabeçalho */}
        <div className="bg-surface border border-border rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-lg bg-surface-highlight flex items-center justify-center text-brand">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-brand uppercase">MÓDULO 01 • ESTUDO CINÉTICO</span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                Cinética Química e Decaimento
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="px-3 py-1.5 bg-surface-elevated border border-border rounded-lg text-slate-200">
              Reação: A → B
            </span>
            <span className="px-3 py-1.5 bg-brand text-white font-bold rounded-lg">
              Ordem {ordem}
            </span>
          </div>
        </div>

        {/* Grade de Trabalho */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Parâmetros de Controle */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6 space-y-5 shadow-md">
              <h2 className="font-serif text-lg font-bold text-white border-b border-border pb-3 flex items-center justify-between">
                <span>Ajuste de Parâmetros</span>
                <Info className="w-4 h-4 text-slate-400" />
              </h2>

              {/* Seletor de Ordem */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 block">Ordem da Reação</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrdem(0)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition ${
                      ordem === 0
                        ? 'bg-brand text-white shadow-md'
                        : 'bg-surface-elevated text-slate-300 hover:text-white border border-border'
                    }`}
                  >
                    Ordem Zero (0)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrdem(1)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition ${
                      ordem === 1
                        ? 'bg-brand text-white shadow-md'
                        : 'bg-surface-elevated text-slate-300 hover:text-white border border-border'
                    }`}
                  >
                    Primeira Ordem (1)
                  </button>
                </div>
              </div>

              {/* Constante k */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-200">Constante de Velocidade (k)</span>
                  <span className="text-amber-400 font-mono font-bold">{k.toFixed(2)} s⁻¹</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.8"
                  step="0.01"
                  value={k}
                  onChange={e => setK(parseFloat(e.target.value))}
                  className="w-full accent-brand h-2 bg-surface-highlight rounded-lg cursor-pointer"
                />
              </div>

              {/* Concentração Inicial */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-200">Concentração Inicial [A]₀</span>
                  <span className="text-amber-400 font-mono font-bold">{a0.toFixed(1)} M</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="5.0"
                  step="0.1"
                  value={a0}
                  onChange={e => setA0(parseFloat(e.target.value))}
                  className="w-full accent-brand h-2 bg-surface-highlight rounded-lg cursor-pointer"
                />
              </div>

              {/* Tempo Máximo */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-200">Tempo de Simulação</span>
                  <span className="text-slate-200 font-mono font-bold">{tempoMax} s</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={tempoMax}
                  onChange={e => setTempoMax(parseInt(e.target.value))}
                  className="w-full accent-brand h-2 bg-surface-highlight rounded-lg cursor-pointer"
                />
              </div>

              {/* Resultados Físicos Calculados */}
              <div className="pt-4 border-t border-border space-y-2.5 bg-surface-elevated p-3.5 rounded-lg border">
                <span className="text-xs font-mono text-slate-300 font-bold uppercase block">
                  Propriedades Calculadas
                </span>

                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Tempo de Meia-Vida (t½):</span>
                  <span className="text-white font-mono font-bold">
                    {meiaVida ? `${meiaVida.toFixed(2)} s` : '-'}
                  </span>
                </div>

                {tempoVida && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">Tempo Médio de Vida (τ):</span>
                    <span className="text-cyan-400 font-mono font-bold">{tempoVida.toFixed(2)} s</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Gráfico Científico */}
          <div className="lg:col-span-8 bg-surface border border-border rounded-xl p-6 flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <h3 className="font-serif text-xl font-bold text-white">
                  Gráfico de Concentração vs Tempo
                </h3>
                <div className="flex items-center space-x-4 text-xs font-semibold">
                  <span className="flex items-center space-x-1.5 text-orange-400">
                    <span className="w-3 h-3 rounded-full bg-brand"></span>
                    <span>[A] Reagente</span>
                  </span>
                  <span className="flex items-center space-x-1.5 text-cyan-400">
                    <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
                    <span>[B] Produto</span>
                  </span>
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
                          grid: { color: '#1e293b' },
                          ticks: { color: '#cbd5e1', font: { family: 'JetBrains Mono', size: 11 } },
                          title: { display: true, text: 'Tempo decorrido (segundos)', color: '#94a3b8', font: { weight: 'bold' } }
                        },
                        y: {
                          grid: { color: '#1e293b' },
                          ticks: { color: '#cbd5e1', font: { family: 'JetBrains Mono', size: 11 } },
                          title: { display: true, text: 'Concentração (mol/L)', color: '#94a3b8', font: { weight: 'bold' } },
                          min: 0
                        }
                      },
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: '#111827',
                          titleColor: '#ea580c',
                          bodyColor: '#f1f5f9',
                          borderColor: '#334155',
                          borderWidth: 1,
                          padding: 10
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    Calculando pontos da curva...
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 p-3 bg-surface-elevated rounded-lg border border-border text-xs text-slate-300 font-mono">
              Fórmula da reação: <strong className="text-white">{ordem === 1 ? '[A] = [A]₀ · e^(-kt)' : '[A] = [A]₀ - kt'}</strong>
            </div>
          </div>

        </div>

        {/* Exercício Prático do Módulo */}
        <section className="bg-surface border border-border rounded-xl p-6 sm:p-8 space-y-4 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-brand" />
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                Exercício de Fixação: Tempo de Meia-Vida
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 px-3 py-1 rounded-full border border-amber-500/30">
              RECOMPENSA: +60 XP & PONTOS
            </span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            Observando os valores atuais configurados no painel (<strong className="text-white">k = {k}</strong> e <strong className="text-white">[A]₀ = {a0} M</strong> em uma reação de <strong className="text-white">Ordem {ordem}</strong>), qual é o <strong>Tempo de Meia-Vida (t½)</strong> aproximado em segundos?
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <input
              type="number"
              step="0.01"
              value={respostaUsuario}
              onChange={e => setRespostaUsuario(e.target.value)}
              disabled={resolvido}
              placeholder="Digite o resultado (ex: 4.62)"
              className="px-4 py-3 bg-surface-elevated border border-border-light rounded-lg text-sm text-white font-mono focus:outline-none focus:border-brand disabled:opacity-50 sm:w-72"
            />
            <button
              onClick={verificarDesafio}
              disabled={resolvido || !respostaUsuario}
              className="px-6 py-3 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-lg transition shadow-md disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span>{resolvido ? 'Exercício Concluído' : 'Verificar Resposta'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {feedback.tipo && (
            <div
              className={`p-4 rounded-lg border text-sm font-medium flex items-center space-x-2.5 ${
                feedback.tipo === 'sucesso'
                  ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                  : 'border-rose-500/50 bg-rose-950/40 text-rose-300'
              }`}
            >
              {feedback.tipo === 'sucesso' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span>{feedback.msg}</span>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
