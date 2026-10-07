import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Flame, CheckCircle2, AlertCircle, ArrowRight, HelpCircle, Activity } from 'lucide-react';
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

export default function Dsc() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<any>(null);

  // Dados
  const [dadosAnalise, setDadosAnalise] = useState<any>(null);
  const [dadosGrafico, setDadosGrafico] = useState<any>(null);

  // Desafio
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
  }, []);

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
            borderColor: '#e11d48',
            backgroundColor: 'rgba(225, 29, 72, 0.12)',
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
      setFeedback({ tipo: 'erro', msg: 'Digite um número válido.' });
      return;
    }

    if (!dadosAnalise) return;

    const tmEsperado = dadosAnalise.temperaturaTransicaoTm;
    const erro = Math.abs((valor - tmEsperado) / tmEsperado);

    if (erro <= 0.03) {
      setResolvido(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 }
      });

      setFeedback({
        tipo: 'sucesso',
        msg: `Extraordinário! O pico de desnaturação Tm da Lisozima ocorre a ${tmEsperado.toFixed(1)} °C. Você ganhou +85 XP e +85 Moedas!`
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
        msg: `Valor incorreto. Dica de estudo: observe o ponto de máximo da curva de ΔCp (~10.8 kJ/(mol·K)).`
      });
    }
  };

  return (
    <div className="min-h-screen text-slate-800 pb-24 font-sans">
      <Navbar usuario={usuario} />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-6">
        
        {/* Cabeçalho */}
        <div className="quantum-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-rose-500/25">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 bg-rose-50 text-rose-700 rounded-md text-xs font-bold mb-1 border border-rose-200/60">
                <Activity className="w-3.5 h-3.5" />
                <span>MÓDULO 03 • ANÁLISE TÉRMICA & CALORIMETRIA</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Calorimetria Exploratória Diferencial (DSC)
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 text-xs font-bold">
            <span className="px-3.5 py-2 bg-slate-100/90 border border-slate-200 rounded-xl text-slate-700">
              Proteína: Lisozima (HEWL)
            </span>
            <span className="bg-gradient-to-tr from-rose-600 to-amber-600 text-white px-3.5 py-2 rounded-xl shadow-xs">
              Integração Numérica
            </span>
          </div>
        </div>

        {/* Grade de Trabalho */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Painel de Resultados */}
          <div className="lg:col-span-4 space-y-6">
            <div className="quantum-card rounded-3xl p-6 space-y-5 shadow-sm">
              <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                Resultados Termodinâmicos
              </h2>

              {dadosAnalise ? (
                <div className="space-y-4 text-xs">
                  {/* Tm */}
                  <div className="p-4 bg-gradient-to-br from-rose-50 via-rose-50/70 to-orange-50 rounded-2xl border border-rose-200/80 space-y-1">
                    <span className="text-rose-800 font-extrabold uppercase text-[11px] block">
                      Temperatura de Desnaturação (Tm)
                    </span>
                    <span className="text-3xl text-rose-700 font-extrabold block">
                      {dadosAnalise.temperaturaTransicaoTm.toFixed(1)} °C
                    </span>
                    <span className="text-rose-600 font-mono text-[11px]">
                      Equivalente a {(dadosAnalise.temperaturaTransicaoTm + 273.15).toFixed(1)} Kelvin
                    </span>
                  </div>

                  {/* Comparativo de Integração */}
                  <div className="space-y-2 pt-2 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
                    <span className="text-slate-800 font-bold uppercase block pb-1">
                      Entalpia Calorimétrica (ΔH_cal)
                    </span>

                    <div className="flex justify-between py-1.5 border-b border-slate-200/80">
                      <span className="text-slate-600">Regra do Trapézio:</span>
                      <span className="text-slate-900 font-mono font-bold">
                        {dadosAnalise.entalpiaTrapezio.toFixed(2)} kJ/mol
                      </span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-slate-200/80">
                      <span className="text-slate-600">Simpson 1/3 (Spline):</span>
                      <span className="text-emerald-700 font-mono font-extrabold">
                        {dadosAnalise.entalpiaSimpsonSpline.toFixed(2)} kJ/mol
                      </span>
                    </div>

                    <div className="flex justify-between py-1 text-slate-500 text-[11px]">
                      <span>Capacidade Máxima ΔCp:</span>
                      <span className="font-semibold text-slate-700">{dadosAnalise.capacidadeCalorificaMaxima.toFixed(2)} kJ/(mol·K)</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    💡 <strong>Conceito:</strong> A área sob a curva representa a quantidade de calor absorvida para romper as pontes de hidrogênio e interações hidrofóbicas que estabilizam a estrutura nativa da proteína.
                  </p>
                </div>
              ) : (
                <div className="text-xs text-slate-500">Carregando dados térmicos...</div>
              )}
            </div>
          </div>

          {/* Gráfico */}
          <div className="lg:col-span-8 quantum-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-lg font-extrabold text-slate-900">
                  Termograma de Desnaturação Térmica
                </h3>
                <span className="text-xs font-bold px-3 py-1 bg-rose-50 text-rose-700 rounded-lg border border-rose-200/60 shadow-2xs">
                  ΔH = ∫ ΔCp dT • [40°C a 90°C]
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
                          grid: { color: 'rgba(226, 232, 240, 0.8)' },
                          ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 11 } },
                          title: { display: true, text: 'Temperatura (°C)', color: '#475569', font: { weight: 'bold' } }
                        },
                        y: {
                          grid: { color: 'rgba(226, 232, 240, 0.8)' },
                          ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 11 } },
                          title: { display: true, text: 'ΔCp Excesso (kJ·mol⁻¹·K⁻¹)', color: '#475569', font: { weight: 'bold' } },
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
                    Calculando curva de calorimetria...
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-xs text-slate-600">
              📊 <strong>Integração de Alta Precisão:</strong> Os dados experimentais são interpolados por Splines Cúbicos para garantir derivadas contínuas antes do cálculo pelo método composto de Simpson 1/3.
            </div>
          </div>

        </div>

        {/* Exercício de Fixação */}
        <section className="quantum-card rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              <h3 className="text-xl font-bold text-slate-900">
                Exercício Rápido: Temperatura de Transição
              </h3>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200">
              RECOMPENSA: +85 XP & PONTOS
            </span>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            Com base na curva experimental da Lisozima, em qual <strong>Temperatura de Transição (Tm em °C)</strong> ocorre a máxima absorção de calor?
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <input
              type="number"
              step="0.5"
              value={respostaUsuario}
              onChange={e => setRespostaUsuario(e.target.value)}
              disabled={resolvido}
              placeholder="Digite a temperatura (ex: 65.0)"
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
