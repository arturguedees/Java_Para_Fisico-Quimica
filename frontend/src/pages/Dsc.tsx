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
            borderColor: '#f43f5e',
            backgroundColor: 'rgba(244, 63, 94, 0.15)',
            fill: true,
            pointRadius: 0,
            borderWidth: 3,
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
    <div className="min-h-screen bg-canvas text-slate-100 pb-24 font-sans">
      <Navbar usuario={usuario} />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-6">
        
        {/* Cabeçalho */}
        <div className="bg-surface border border-border rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-lg bg-surface-highlight flex items-center justify-center text-rose-400">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-rose-400 uppercase">MÓDULO 03 • ANÁLISE TÉRMICA</span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                Calorimetria Exploratória Diferencial (DSC)
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="px-3 py-1.5 bg-surface-elevated border border-border rounded-lg text-slate-200">
              Proteína: Lisozima (HEWL)
            </span>
            <span className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-lg">
              Integração Numérica
            </span>
          </div>
        </div>

        {/* Grade de Trabalho */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Painel de Resultados */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6 space-y-5 shadow-md">
              <h2 className="font-serif text-lg font-bold text-white border-b border-border pb-3">
                Resultados Termodinâmicos
              </h2>

              {dadosAnalise ? (
                <div className="space-y-4 text-xs">
                  {/* Tm */}
                  <div className="p-4 bg-surface-elevated rounded-lg border border-border space-y-1">
                    <span className="text-slate-300 font-bold uppercase text-[11px] block">
                      Temperatura de Desnaturação (Tm)
                    </span>
                    <span className="text-2xl font-serif text-rose-400 font-bold block">
                      {dadosAnalise.temperaturaTransicaoTm.toFixed(1)} °C
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      Equivalente a {(dadosAnalise.temperaturaTransicaoTm + 273.15).toFixed(1)} Kelvin
                    </span>
                  </div>

                  {/* Comparativo de Integração */}
                  <div className="space-y-2 pt-2 bg-surface-elevated p-3.5 rounded-lg border border-border">
                    <span className="text-slate-200 font-bold uppercase block pb-1">
                      Entalpia Calorimétrica (ΔH_cal)
                    </span>

                    <div className="flex justify-between py-1 border-b border-border/80">
                      <span className="text-slate-300">Regra do Trapézio:</span>
                      <span className="text-white font-mono font-bold">
                        {dadosAnalise.entalpiaTrapezio.toFixed(2)} kJ/mol
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-border/80">
                      <span className="text-slate-300">Simpson 1/3 (Spline):</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        {dadosAnalise.entalpiaSimpsonSpline.toFixed(2)} kJ/mol
                      </span>
                    </div>

                    <div className="flex justify-between py-1 text-slate-400 text-[11px]">
                      <span>Capacidade Máxima ΔCp:</span>
                      <span>{dadosAnalise.capacidadeCalorificaMaxima.toFixed(2)} kJ/(mol·K)</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pt-1">
                    Conceito: A área total abaixo do pico do termograma mede a quantidade de calor absorvida para romper as ligações que sustentam a estrutura nativa da proteína.
                  </p>
                </div>
              ) : (
                <div className="font-mono text-xs text-slate-400">Carregando dados térmicos...</div>
              )}
            </div>
          </div>

          {/* Gráfico */}
          <div className="lg:col-span-8 bg-surface border border-border rounded-xl p-6 flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <h3 className="font-serif text-xl font-bold text-white">
                  Termograma de Desnaturação Térmica
                </h3>
                <span className="text-xs font-mono font-bold text-rose-400">
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
                          grid: { color: '#1e293b' },
                          ticks: { color: '#cbd5e1', font: { family: 'JetBrains Mono', size: 11 } },
                          title: { display: true, text: 'Temperatura (°C)', color: '#94a3b8', font: { weight: 'bold' } }
                        },
                        y: {
                          grid: { color: '#1e293b' },
                          ticks: { color: '#cbd5e1', font: { family: 'JetBrains Mono', size: 11 } },
                          title: { display: true, text: 'ΔCp Excesso (kJ·mol⁻¹·K⁻¹)', color: '#94a3b8', font: { weight: 'bold' } },
                          min: 0
                        }
                      },
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: '#111827',
                          titleColor: '#f43f5e',
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
                    Calculando curva de calorimetria...
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 p-3 bg-surface-elevated rounded-lg border border-border text-xs text-slate-300">
              Método Numérico: A interpolação por Splines Cúbicos ajusta uma curva suave pelos dados discretos antes de aplicar a quadratura de Simpson 1/3.
            </div>
          </div>

        </div>

        {/* Exercício de Fixação */}
        <section className="bg-surface border border-border rounded-xl p-6 sm:p-8 space-y-4 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-brand" />
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                Exercício de Fixação: Temperatura de Transição
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 px-3 py-1 rounded-full border border-amber-500/30">
              RECOMPENSA: +85 XP & PONTOS
            </span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            Com base na curva da Lisozima, em qual <strong>Temperatura de Transição (Tm em °C)</strong> ocorre a máxima absorção de calor?
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <input
              type="number"
              step="0.5"
              value={respostaUsuario}
              onChange={e => setRespostaUsuario(e.target.value)}
              disabled={resolvido}
              placeholder="Digite a temperatura (ex: 65.0)"
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
