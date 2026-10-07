import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { 
  Flame, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  Info, 
  Calculator, 
  Layers, 
  ArrowRight,
  TrendingUp
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

export default function Dsc() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<any>(null);

  // Modo de exibição e método numérico
  const [metodo, setMetodo] = useState<'spline' | 'trapezio'>('spline');

  // Dados retornados do backend Java
  const [dadosAnalise, setDadosAnalise] = useState<any>(null);
  const [dadosGrafico, setDadosGrafico] = useState<any>(null);

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
      if (u.exerciciosResolvidos && u.exerciciosResolvidos.includes('dsc_lab_01')) {
        setResolvido(true);
      }
    }
  }, [navigate]);

  useEffect(() => {
    carregarDsc();
  }, [metodo]);

  const carregarDsc = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/dsc/analise');
      setDadosAnalise(res.data);

      const labels = res.data.curvaTemperatura.map((t: number) => t.toFixed(1));

      setDadosGrafico({
        labels: labels,
        datasets: [
          {
            label: 'Capacidade Calorífica em Excesso ΔCp (kJ/(mol·K))',
            data: res.data.curvaCp,
            borderColor: '#f43f5e',
            backgroundColor: 'rgba(244, 63, 94, 0.18)',
            fill: true,
            pointRadius: 0,
            borderWidth: 3,
            tension: 0.2
          }
        ]
      });
    } catch (err) {
      console.error('Erro ao carregar dados DSC:', err);
    }
  };

  const verificarDesafio = async () => {
    if (!respostaUsuario.trim()) return;

    const valor = parseFloat(respostaUsuario);
    if (isNaN(valor)) {
      setFeedback({ tipo: 'erro', msg: 'Insira um valor numérico válido.' });
      return;
    }

    if (!dadosAnalise) return;

    const tmEsperado = dadosAnalise.temperaturaTransicaoTm;
    const erro = Math.abs((valor - tmEsperado) / tmEsperado);

    if (erro <= 0.03) {
      setResolvido(true);
      setFeedback({
        tipo: 'sucesso',
        msg: `Exato! A temperatura de desnaturação máxima Tm da Lisozima é ${tmEsperado.toFixed(1)} °C. Você ganhou +85 XP e +85 Moedas!`
      });

      if (usuario) {
        try {
          const res = await axios.post(
            `http://localhost:8080/api/usuarios/${usuario.id}/ganhar-xp?pontosXp=85&exercicioId=dsc_lab_01`
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
        msg: `Valor incorreto. Observe o ponto onde a curva atinge o pico máximo de Cp (~10.8 kJ/(mol·K)).`
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar usuario={usuario} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Calorimetria Exploratória Diferencial (DSC)</h1>
              <p className="text-xs text-slate-400">
                Desnaturação térmica da Lisozima (HEWL) e integração numérica de entalpia
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30">
              HEWL (Hen Egg White)
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Spline Cúbico + Simpson
            </span>
          </div>
        </div>

        {/* Grade de Controles e Gráfico */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Painel Lateral de Resultados Termodinâmicos */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 lg:col-span-1 shadow-xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-rose-400" />
              <span>Resultados Numéricos</span>
            </h2>

            {dadosAnalise ? (
              <div className="space-y-4">
                {/* Tm */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    Pico de Transição Térmica (Tm)
                  </span>
                  <span className="text-xl font-black text-rose-400 font-mono">
                    {dadosAnalise.temperaturaTransicaoTm.toFixed(1)} °C
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    ({(dadosAnalise.temperaturaTransicaoTm + 273.15).toFixed(1)} K)
                  </span>
                </div>

                {/* Comparação dos Métodos de Integração */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>Entalpia Calorimétrica (ΔH_cal)</span>
                  </span>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Regra do Trapézio:</span>
                      <span className="font-bold text-slate-200 font-mono">
                        {dadosAnalise.entalpiaTrapezio.toFixed(2)} kJ/mol
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Simpson 1/3 (Spline):</span>
                      <span className="font-bold text-emerald-400 font-mono">
                        {dadosAnalise.entalpiaSimpsonSpline.toFixed(2)} kJ/mol
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500">
                      Capacidade máx: <strong className="text-slate-300">{dadosAnalise.capacidadeCalorificaMaxima.toFixed(2)} kJ/(mol·K)</strong>
                    </div>
                  </div>
                </div>

                {/* Informação Teórica */}
                <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                  A área sob o termograma de DSC corresponde à energia necessária para romper as interações intramoleculares que mantêm a estrutura nativa da proteína.
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500">Carregando análise...</div>
            )}

          </div>

          {/* Gráfico do Termograma */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-3 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-rose-400" />
                  <span>Termograma de Desnaturação Térmica (40°C a 90°C)</span>
                </h2>
                <span className="text-xs text-slate-400 font-mono">
                  ΔH = ∫ Cp_excesso dT
                </span>
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
                          title: { display: true, text: 'Temperatura (°C)', color: '#94a3b8' }
                        },
                        y: {
                          grid: { color: 'rgba(255, 255, 255, 0.05)' },
                          ticks: { color: '#94a3b8', font: { size: 10 } },
                          title: { display: true, text: 'Capacidade Calorífica em Excesso ΔCp (kJ·mol⁻¹·K⁻¹)', color: '#94a3b8' },
                          min: 0
                        }
                      },
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: '#0f172a',
                          titleColor: '#f43f5e',
                          bodyColor: '#e2e8f0',
                          borderColor: '#334155',
                          borderWidth: 1
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500">
                    Processando termograma DSC...
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center space-x-2 text-xs text-slate-400">
              <Info className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>
                A integração numérica com interpolação de Spline Cúbico contínuo corrige distorções de malhas não-uniformes e garante convergência superior à regra do trapézio simples.
              </span>
            </div>
          </div>

        </div>

        {/* Desafio Gamificado */}
        <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600/30 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Desafio de Transição Térmica</h3>
                <p className="text-xs text-slate-400">
                  Identifique o ponto crítico termodinâmico na curva da Lisozima
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                +85 XP & Moedas
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-300 mb-4">
            Qual é a <strong>Temperatura de Transição de Desnaturação (Tm em °C)</strong> onde ocorre a máxima absorção de calor?
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="number"
              step="0.5"
              value={respostaUsuario}
              onChange={e => setRespostaUsuario(e.target.value)}
              disabled={resolvido}
              placeholder="Ex: 65.0"
              className="px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:opacity-60"
            />
            <button
              onClick={verificarDesafio}
              disabled={resolvido || !respostaUsuario}
              className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-600/30 disabled:opacity-50 transition flex items-center justify-center space-x-2"
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
