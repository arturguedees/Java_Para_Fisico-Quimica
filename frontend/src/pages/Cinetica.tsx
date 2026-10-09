import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { FlaskConical, CheckCircle2, AlertCircle, ArrowRight, Info, HelpCircle, Sparkles, Activity, Printer, Download } from 'lucide-react';
import confetti from 'canvas-confetti';
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
  const [cenario, setCenario] = useState<string>('padrao');

  // Dados calculados
  const [dadosGrafico, setDadosGrafico] = useState<any>(null);
  const [meiaVida, setMeiaVida] = useState<number | null>(null);
  const [tempoVida, setTempoVida] = useState<number | null>(null);

  // Desafio Embutido
  const [respostaUsuario, setRespostaUsuario] = useState<string>('');
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro' | null; msg: string }>({ tipo: null, msg: '' });
  const [resolvido, setResolvido] = useState<boolean>(false);

  const aplicarCenario = (tipo: string) => {
    setCenario(tipo);
    if (tipo === 'padrao') {
      setOrdem(1);
      setK(0.15);
      setA0(2.0);
      setTempoMax(25);
    } else if (tipo === 'ozonio') {
      // Degradação fotoquímica do ozônio na estratosfera (alta reatividade)
      setOrdem(1);
      setK(0.28);
      setA0(1.5);
      setTempoMax(20);
    } else if (tipo === 'poluente') {
      // Decomposição térmica do poluente N2O5 (mais lenta)
      setOrdem(1);
      setK(0.04);
      setA0(3.0);
      setTempoMax(60);
    }
  };

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
            label: '[A] Reagente (mol/L)',
            data: res.data.concentracaoA,
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.12)',
            fill: true,
            pointRadius: 0,
            borderWidth: 3,
            tension: 0.2
          },
          {
            label: '[B] Produto (mol/L)',
            data: res.data.concentracaoB,
            borderColor: '#06b6d4',
            backgroundColor: 'transparent',
            borderDash: [6, 4],
            pointRadius: 0,
            borderWidth: 2.5,
            tension: 0.2
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
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });

      setFeedback({
        tipo: 'sucesso',
        msg: `Incrível! O tempo de meia-vida calculado é ${meiaVida.toFixed(2)} segundos. Você conquistou +60 XP e +60 Moedas!`
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
    <div className="min-h-screen pb-24">
      <Navbar usuario={usuario} />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 space-y-10">
        
        {/* Cabeçalho */}
        <div className="quantum-card bg-brand p-6 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-neo">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-white border-4 border-dark text-dark flex items-center justify-center shadow-neo-sm transform hover:rotate-6 transition-all">
              <FlaskConical className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-dark text-white border-2 border-dark rounded-md text-xs font-black uppercase tracking-widest shadow-neo-sm">
                <Activity className="w-4 h-4 stroke-[3]" />
                <span>MÓDULO 01 • ESTUDO CINÉTICO</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-dark tracking-tighter uppercase font-display leading-tight">
                Cinética Química e Decaimento
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-widest">
            <button
              onClick={() => window.print()}
              className="px-4 py-3 bg-white hover:bg-yellow-300 border-4 border-dark text-dark shadow-neo-sm hover:-translate-y-0.5 transition-all flex items-center space-x-2"
              title="Gerar/Imprimir Relatório de Laboratório"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>Relatório PDF</span>
            </button>
            <span className="btn-quantum-primary px-5 py-3 border-4 shadow-neo-sm">
              Ordem {ordem}
            </span>
          </div>
        </div>

        {/* Barra de Cenários Experimentais do Paper ACS */}
        <div className="bg-white border-4 border-dark rounded-2xl p-5 shadow-neo space-y-3">
          <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-dark">
            <Sparkles className="w-4 h-4 text-brand fill-dark stroke-[2.5]" />
            <span>Cenários de Laboratório (Inspirados no Paper J. Chem. Educ.):</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => aplicarCenario('padrao')}
              className={`p-3.5 border-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all text-left ${
                cenario === 'padrao'
                  ? 'bg-brand border-dark shadow-neo-sm -translate-y-0.5'
                  : 'bg-white border-dark/40 hover:border-dark text-dark/70 hover:text-dark'
              }`}
            >
              <div className="text-dark font-extrabold text-sm">Reação Geral (A → B)</div>
              <div className="text-[11px] text-dark/60 font-mono mt-1">k = 0.15 s⁻¹ • [A]₀ = 2.0 M</div>
            </button>

            <button
              type="button"
              onClick={() => aplicarCenario('ozonio')}
              className={`p-3.5 border-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all text-left ${
                cenario === 'ozonio'
                  ? 'bg-brand border-dark shadow-neo-sm -translate-y-0.5'
                  : 'bg-white border-dark/40 hover:border-dark text-dark/70 hover:text-dark'
              }`}
            >
              <div className="text-dark font-extrabold text-sm">Ozônio Estratosférico (O₃)</div>
              <div className="text-[11px] text-dark/60 font-mono mt-1">k = 0.28 s⁻¹ • Rápido decaimento</div>
            </button>

            <button
              type="button"
              onClick={() => aplicarCenario('poluente')}
              className={`p-3.5 border-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all text-left ${
                cenario === 'poluente'
                  ? 'bg-brand border-dark shadow-neo-sm -translate-y-0.5'
                  : 'bg-white border-dark/40 hover:border-dark text-dark/70 hover:text-dark'
              }`}
            >
              <div className="text-dark font-extrabold text-sm">Poluente Gasoso (N₂O₅)</div>
              <div className="text-[11px] text-dark/60 font-mono mt-1">k = 0.04 s⁻¹ • e-folding prolongado</div>
            </button>
          </div>
        </div>

        {/* Grade de Trabalho */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Parâmetros de Controle */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border-4 border-dark rounded-3xl p-6 space-y-5 shadow-neo">
              <h2 className="text-lg font-black uppercase text-dark border-b-2 border-dark/20 pb-3 flex items-center justify-between font-display">
                <span>Controles da Reação</span>
                <Info className="w-5 h-5 text-dark stroke-[2.5]" />
              </h2>

              {/* Seletor de Ordem */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-dark block">Ordem da Reação</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrdem(0)}
                    className={`py-3 px-3 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all ${
                      ordem === 0
                        ? 'btn-quantum-primary border-dark shadow-neo-sm'
                        : 'bg-white text-dark border-dark/40 hover:border-dark'
                    }`}
                  >
                    Ordem Zero (0)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrdem(1)}
                    className={`py-3 px-3 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all ${
                      ordem === 1
                        ? 'btn-quantum-primary border-dark shadow-neo-sm'
                        : 'bg-white text-dark border-dark/40 hover:border-dark'
                    }`}
                  >
                    1ª Ordem (1)
                  </button>
                </div>
              </div>

              {/* Constante k */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                  <span className="text-dark">Constante de Velocidade (k)</span>
                  <span className="text-dark font-mono bg-yellow-300 px-2 py-0.5 border border-dark rounded">{k.toFixed(2)} s⁻¹</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.8"
                  step="0.01"
                  value={k}
                  onChange={e => setK(parseFloat(e.target.value))}
                  className="w-full accent-dark h-2.5 bg-slate-200 border border-dark rounded-lg cursor-pointer"
                />
              </div>

              {/* Concentração Inicial */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                  <span className="text-dark">Concentração Inicial [A]₀</span>
                  <span className="text-dark font-mono bg-brand px-2 py-0.5 border border-dark rounded">{a0.toFixed(1)} mol/L</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="5.0"
                  step="0.1"
                  value={a0}
                  onChange={e => setA0(parseFloat(e.target.value))}
                  className="w-full accent-dark h-2.5 bg-slate-200 border border-dark rounded-lg cursor-pointer"
                />
              </div>

              {/* Tempo Máximo */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                  <span className="text-dark">Janela de Tempo</span>
                  <span className="text-dark font-mono bg-slate-100 px-2 py-0.5 border border-dark rounded">{tempoMax} s</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={tempoMax}
                  onChange={e => setTempoMax(parseInt(e.target.value))}
                  className="w-full accent-dark h-2.5 bg-slate-200 border border-dark rounded-lg cursor-pointer"
                />
              </div>

              {/* Resultados Físicos Calculados */}
              <div className="pt-4 border-t-2 border-dark/20 space-y-3 bg-brand/30 p-4 rounded-2xl border-2 border-dark">
                <span className="text-xs font-black text-dark uppercase tracking-wider block">
                  Propriedades Teóricas
                </span>

                <div className="flex justify-between text-xs font-black uppercase">
                  <span className="text-dark/80">Meia-Vida (t½):</span>
                  <span className="text-dark font-mono bg-white px-2 py-0.5 border border-dark rounded shadow-neo-sm">
                    {meiaVida ? `${meiaVida.toFixed(2)} s` : '-'}
                  </span>
                </div>

                {tempoVida && (
                  <div className="flex justify-between text-xs font-black uppercase">
                    <span className="text-dark/80">Tempo de Vida (τ = 1/k):</span>
                    <span className="text-dark font-mono bg-white px-2 py-0.5 border border-dark rounded shadow-neo-sm">
                      {tempoVida.toFixed(2)} s
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Gráfico Científico */}
          <div className="lg:col-span-8 quantum-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-lg font-extrabold text-slate-900">
                  Concentração vs. Tempo
                </h3>
                <div className="flex items-center space-x-4 text-xs font-bold">
                  <span className="flex items-center space-x-1.5 text-indigo-600">
                    <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
                    <span>[A] Reagente</span>
                  </span>
                  <span className="flex items-center space-x-1.5 text-cyan-600">
                    <span className="w-3 h-3 rounded-full bg-cyan-500"></span>
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
                          grid: { color: 'rgba(226, 232, 240, 0.8)' },
                          ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 11 } },
                          title: { display: true, text: 'Tempo decorrido (s)', color: '#475569', font: { weight: 'bold' } }
                        },
                        y: {
                          grid: { color: 'rgba(226, 232, 240, 0.8)' },
                          ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 11 } },
                          title: { display: true, text: 'Concentração (mol/L)', color: '#475569', font: { weight: 'bold' } },
                          min: 0
                        }
                      },
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: '#0f172a',
                          titleColor: '#ffffff',
                          bodyColor: '#cbd5e1',
                          padding: 10,
                          cornerRadius: 12
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

            <div className="mt-4 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-xs text-slate-600 font-mono">
              Fórmula integrada: <strong className="text-slate-900">{ordem === 1 ? '[A] = [A]₀ · e^(-kt)' : '[A] = [A]₀ - kt'}</strong>
            </div>
          </div>

        </div>

        {/* Exercício Prático do Módulo */}
        <section className="quantum-card rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              <h3 className="text-xl font-bold text-slate-900">
                Exercício de Fixação: Tempo de Meia-Vida
              </h3>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200">
              RECOMPENSA: +60 XP & PONTOS
            </span>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            Com os valores atuais (<strong className="text-slate-900 font-bold">k = {k}</strong> e <strong className="text-slate-900 font-bold">[A]₀ = {a0} mol/L</strong> em reação de <strong className="text-slate-900 font-bold">Ordem {ordem}</strong>), qual é o <strong>Tempo de Meia-Vida (t½)</strong> aproximado em segundos?
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <input
              type="number"
              step="0.01"
              value={respostaUsuario}
              onChange={e => setRespostaUsuario(e.target.value)}
              disabled={resolvido}
              placeholder="Digite seu valor (ex: 4.62)"
              className="px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white disabled:opacity-60 sm:w-72 shadow-xs"
            />
            <button
              onClick={verificarDesafio}
              disabled={resolvido || !respostaUsuario}
              className="btn-quantum-primary px-6 py-3 rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center space-x-2 shadow-md"
            >
              <span>{resolvido ? 'Exercício Concluído' : 'Confirmar Resposta'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {feedback.tipo && (
            <div
              className={`p-4 rounded-2xl border text-sm font-semibold flex items-center space-x-3 animate-slide-up ${
                feedback.tipo === 'sucesso'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-950 shadow-sm'
                  : 'border-rose-300 bg-rose-50 text-rose-950 shadow-sm'
              }`}
            >
              {feedback.tipo === 'sucesso' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 animate-bounce" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 animate-pulse" />
              )}
              <span>{feedback.msg}</span>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
