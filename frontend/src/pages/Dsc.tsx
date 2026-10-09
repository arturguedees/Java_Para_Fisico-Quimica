import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Flame, CheckCircle2, AlertCircle, ArrowRight, HelpCircle, Activity, Printer } from 'lucide-react';
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
    <div className="min-h-screen pb-24">
      <Navbar usuario={usuario} />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 space-y-10">
        
        {/* Cabeçalho */}
        <div className="quantum-card bg-brand p-6 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-neo">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-white border-4 border-dark text-dark flex items-center justify-center shadow-neo-sm transform hover:rotate-6 transition-all">
              <Flame className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-dark text-white border-2 border-dark rounded-md text-xs font-black uppercase tracking-widest shadow-neo-sm">
                <Activity className="w-4 h-4 stroke-[3]" />
                <span>MÓDULO 03 • ANÁLISE TÉRMICA & CALORIMETRIA</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-dark tracking-tighter uppercase font-display leading-tight">
                Calorimetria Exploratória Diferencial
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
            <span className="px-4 py-3 bg-white border-4 border-dark text-dark shadow-neo-sm">
              Lisozima (HEWL)
            </span>
            <span className="btn-quantum-primary px-5 py-3 border-4 shadow-neo-sm">
              Simpson & Trapézio
            </span>
          </div>
        </div>

        {/* Grade de Trabalho */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Painel de Resultados */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border-4 border-dark rounded-3xl p-6 space-y-5 shadow-neo">
              <h2 className="text-lg font-black uppercase text-dark border-b-2 border-dark/20 pb-3 font-display">
                Resultados Termodinâmicos
              </h2>

              {dadosAnalise ? (
                <div className="space-y-4 text-xs">
                  {/* Tm */}
                  <div className="p-5 bg-rose-200 border-3 border-dark rounded-2xl space-y-1 shadow-neo-sm">
                    <span className="text-dark font-black uppercase text-xs block">
                      Transição Térmica (Tm)
                    </span>
                    <span className="text-4xl text-dark font-black block font-display">
                      {dadosAnalise.temperaturaTransicaoTm.toFixed(1)} °C
                    </span>
                    <span className="text-dark/80 font-mono font-bold text-xs">
                      Equivalente a {(dadosAnalise.temperaturaTransicaoTm + 273.15).toFixed(1)} K
                    </span>
                  </div>

                  {/* Comparativo de Integração */}
                  <div className="space-y-3 bg-brand/30 p-4 rounded-2xl border-2 border-dark">
                    <span className="text-dark font-black uppercase block pb-1 tracking-wider text-xs">
                      Entalpia Calorimétrica (ΔH_cal)
                    </span>

                    <div className="flex justify-between py-1.5 border-b-2 border-dark/20 font-black uppercase text-xs">
                      <span className="text-dark/70">Regra do Trapézio:</span>
                      <span className="text-dark font-mono bg-white px-2 py-0.5 border border-dark rounded shadow-neo-sm">
                        {dadosAnalise.entalpiaTrapezio.toFixed(2)} kJ/mol
                      </span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b-2 border-dark/20 font-black uppercase text-xs">
                      <span className="text-dark/70">Simpson 1/3 (Spline):</span>
                      <span className="text-dark font-mono bg-yellow-300 px-2 py-0.5 border border-dark rounded shadow-neo-sm">
                        {dadosAnalise.entalpiaSimpsonSpline.toFixed(2)} kJ/mol
                      </span>
                    </div>

                    <div className="flex justify-between py-1 text-dark text-xs font-black uppercase">
                      <span>Pico Máximo ΔCp:</span>
                      <span className="font-mono bg-white px-2 py-0.5 border border-dark rounded">{dadosAnalise.capacidadeCalorificaMaxima.toFixed(2)} kJ/(mol·K)</span>
                    </div>
                  </div>

                  <p className="text-xs text-dark/80 leading-relaxed pt-1 font-medium bg-white p-3 border-2 border-dark rounded-xl shadow-neo-sm">
                    💡 <strong>Conceito Fundamental:</strong> A integral de excesso representa a energia necessária para desestabilizar as pontes de hidrogênio da Lisozima durante o enovelamento.
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
