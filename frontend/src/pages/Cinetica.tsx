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
            label: '[A] Reagente (mol/L)',
            data: res.data.concentracaoA,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            fill: true,
            pointRadius: 0,
            borderWidth: 2.5,
            tension: 0.1
          },
          {
            label: '[B] Produto (mol/L)',
            data: res.data.concentracaoB,
            borderColor: '#0284c7',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            pointRadius: 0,
            borderWidth: 2,
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
        msg: `Correto! O tempo de meia-vida é ${meiaVida.toFixed(2)} segundos. Você conquistou +60 XP e +60 Pontos!`
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
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 font-sans">
      <Navbar usuario={usuario} />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-6">
        
        {/* Cabeçalho */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold mb-1">
                <span>MÓDULO 01 • ESTUDO CINÉTICO</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Cinética Química e Decaimento
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold">
            <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700">
              Reação: A → B
            </span>
            <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg">
              Ordem {ordem}
            </span>
          </div>
        </div>

        {/* Grade de Trabalho */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Parâmetros de Controle */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>Parâmetros da Reação</span>
                <Info className="w-4 h-4 text-slate-400" />
              </h2>

              {/* Seletor de Ordem */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Ordem da Reação</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrdem(0)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition ${
                      ordem === 0
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    Ordem Zero (0)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrdem(1)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition ${
                      ordem === 1
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    Primeira Ordem (1)
                  </button>
                </div>
              </div>

              {/* Constante k */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">Constante de Velocidade (k)</span>
                  <span className="text-blue-600 font-mono font-bold">{k.toFixed(2)} s⁻¹</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.8"
                  step="0.01"
                  value={k}
                  onChange={e => setK(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Concentração Inicial */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">Concentração Inicial [A]₀</span>
                  <span className="text-blue-600 font-mono font-bold">{a0.toFixed(1)} mol/L</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="5.0"
                  step="0.1"
                  value={a0}
                  onChange={e => setA0(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Tempo Máximo */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">Tempo de Simulação</span>
                  <span className="text-slate-800 font-mono font-bold">{tempoMax} s</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={tempoMax}
                  onChange={e => setTempoMax(parseInt(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Resultados Físicos Calculados */}
              <div className="pt-4 border-t border-slate-100 space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase block tracking-wider">
                  Resultados da Cinética
                </span>

                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 font-medium">Tempo de Meia-Vida (t½):</span>
                  <span className="text-slate-900 font-mono font-bold">
                    {meiaVida ? `${meiaVida.toFixed(2)} s` : '-'}
                  </span>
                </div>

                {tempoVida && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 font-medium">Tempo Médio de Vida (τ):</span>
                    <span className="text-blue-700 font-mono font-bold">{tempoVida.toFixed(2)} s</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Gráfico Científico */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  Concentração vs. Tempo
                </h3>
                <div className="flex items-center space-x-4 text-xs font-semibold">
                  <span className="flex items-center space-x-1.5 text-blue-600">
                    <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                    <span>[A] Reagente</span>
                  </span>
                  <span className="flex items-center space-x-1.5 text-sky-600">
                    <span className="w-3 h-3 rounded-full bg-sky-500"></span>
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
                          grid: { color: '#f1f5f9' },
                          ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 11 } },
                          title: { display: true, text: 'Tempo decorrido (s)', color: '#475569', font: { weight: 'bold' } }
                        },
                        y: {
                          grid: { color: '#f1f5f9' },
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
                          cornerRadius: 8
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

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 font-mono">
              Equação integrada: <strong className="text-slate-900">{ordem === 1 ? '[A] = [A]₀ · e^(-kt)' : '[A] = [A]₀ - kt'}</strong>
            </div>
          </div>

        </div>

        {/* Exercício Prático do Módulo */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-bold text-slate-900">
                Exercício Rápido: Tempo de Meia-Vida
              </h3>
            </div>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              RECOMPENSA: +60 XP & PONTOS
            </span>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            Com os valores atuais (<strong className="text-slate-800">k = {k}</strong> e <strong className="text-slate-800">[A]₀ = {a0} mol/L</strong> em reação de <strong className="text-slate-800">Ordem {ordem}</strong>), qual é o <strong>Tempo de Meia-Vida (t½)</strong> aproximado em segundos?
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <input
              type="number"
              step="0.01"
              value={respostaUsuario}
              onChange={e => setRespostaUsuario(e.target.value)}
              disabled={resolvido}
              placeholder="Digite seu valor (ex: 4.62)"
              className="px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white disabled:opacity-60 sm:w-72"
            />
            <button
              onClick={verificarDesafio}
              disabled={resolvido || !respostaUsuario}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition shadow-sm disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span>{resolvido ? 'Exercício Concluído' : 'Confirmar Resposta'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {feedback.tipo && (
            <div
              className={`p-4 rounded-xl border text-sm font-medium flex items-center space-x-2.5 ${
                feedback.tipo === 'sucesso'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-rose-200 bg-rose-50 text-rose-900'
              }`}
            >
              {feedback.tipo === 'sucesso' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
              <span>{feedback.msg}</span>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
