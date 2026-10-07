import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Flame, CheckCircle, AlertCircle, ArrowRight, HelpCircle } from 'lucide-react';
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
            backgroundColor: 'rgba(225, 29, 72, 0.1)',
            fill: true,
            pointRadius: 0,
            borderWidth: 2.5,
            tension: 0.15
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
      setFeedback({
        tipo: 'sucesso',
        msg: `Excelente! O pico de desnaturação Tm da Lisozima ocorre a ${tmEsperado.toFixed(1)} °C. Você ganhou +85 XP e +85 Pontos!`
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
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 font-sans">
      <Navbar usuario={usuario} />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-6">
        
        {/* Cabeçalho */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 bg-rose-50 text-rose-700 rounded-md text-xs font-semibold mb-1">
                <span>MÓDULO 03 • ANÁLISE TÉRMICA & CALORIMETRIA</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Calorimetria Exploratória Diferencial (DSC)
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold">
            <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700">
              Proteína: Lisozima (HEWL)
            </span>
            <span className="px-3 py-1.5 bg-rose-600 text-white rounded-lg">
              Integração Numérica
            </span>
          </div>
        </div>

        {/* Grade de Trabalho */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Painel de Resultados */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Resultados Termodinâmicos
              </h2>

              {dadosAnalise ? (
                <div className="space-y-4 text-xs">
                  {/* Tm */}
                  <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200 space-y-1">
                    <span className="text-rose-800 font-bold uppercase text-[11px] block">
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
                  <div className="space-y-2 pt-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-slate-700 font-bold uppercase block pb-1">
                      Entalpia Calorimétrica (ΔH_cal)
                    </span>

                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-600">Regra do Trapézio:</span>
                      <span className="text-slate-900 font-mono font-bold">
                        {dadosAnalise.entalpiaTrapezio.toFixed(2)} kJ/mol
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-600">Simpson 1/3 (Spline):</span>
                      <span className="text-emerald-700 font-mono font-bold">
                        {dadosAnalise.entalpiaSimpsonSpline.toFixed(2)} kJ/mol
                      </span>
                    </div>

                    <div className="flex justify-between py-1 text-slate-500 text-[11px]">
                      <span>Capacidade Máxima ΔCp:</span>
                      <span className="font-semibold text-slate-700">{dadosAnalise.capacidadeCalorificaMaxima.toFixed(2)} kJ/(mol·K)</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    💡 <strong>Teoria:</strong> A área integrada sob o termograma quantifica a entalpia total necessária para desnaturar a estrutura globular nativa da proteína em solução aquosa.
                  </p>
                </div>
              ) : (
                <div className="text-xs text-slate-500">Carregando dados térmicos...</div>
              )}
            </div>
          </div>

          {/* Gráfico */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  Termograma de Desnaturação Térmica
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg">
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
                          grid: { color: '#f1f5f9' },
                          ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 11 } },
                          title: { display: true, text: 'Temperatura (°C)', color: '#475569', font: { weight: 'bold' } }
                        },
                        y: {
                          grid: { color: '#f1f5f9' },
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
                          cornerRadius: 8
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

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              📊 <strong>Método Numérico:</strong> Spline Cúbico garante continuidade de derivada de segunda ordem, permitindo que a regra de Simpson 1/3 atinja ordem de convergência $O(h^4)$.
            </div>
          </div>

        </div>

        {/* Exercício de Fixação */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-bold text-slate-900">
                Exercício Rápido: Temperatura de Transição
              </h3>
            </div>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              RECOMPENSA: +85 XP & PONTOS
            </span>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            Com base na curva experimental da Lisozima exibida acima, em qual <strong>Temperatura de Transição (Tm em °C)</strong> ocorre a máxima absorção de calor?
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <input
              type="number"
              step="0.5"
              value={respostaUsuario}
              onChange={e => setRespostaUsuario(e.target.value)}
              disabled={resolvido}
              placeholder="Digite a temperatura (ex: 65.0)"
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
