import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
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

  // Dados retornados
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
            borderColor: '#c85a32',
            backgroundColor: 'rgba(200, 90, 50, 0.08)',
            fill: true,
            pointRadius: 0,
            borderWidth: 2,
            tension: 0.1
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
      setFeedback({ tipo: 'erro', msg: 'Formato numérico inválido.' });
      return;
    }

    if (!dadosAnalise) return;

    const tmEsperado = dadosAnalise.temperaturaTransicaoTm;
    const erro = Math.abs((valor - tmEsperado) / tmEsperado);

    if (erro <= 0.03) {
      setResolvido(true);
      setFeedback({
        tipo: 'sucesso',
        msg: `Confirmado: Tm = ${tmEsperado.toFixed(1)} °C. +85 Pontos e +85 XP creditados ao seu perfil.`
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
        msg: `Divergência. O pico de transição (Tm) ocorre na temperatura correspondente ao máximo global de absorção térmica (~10.8 kJ/mol·K).`
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1013] text-[#e5e2dc] pb-24 font-sans">
      <Navbar usuario={usuario} />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 space-y-8">
        
        {/* Cabeçalho */}
        <div className="border-b border-[#1d2027] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="font-mono text-xs text-[#c85a32] uppercase tracking-wider">
              MÓDULO 03 • ANÁLISE TÉRMICA & INTEGRAÇÃO
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#faf9f5]">
              Calorimetria Exploratória Diferencial (DSC)
            </h1>
          </div>

          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="px-3 py-1 bg-[#14161b] border border-[#1d2027] text-[#918b7e]">
              AMOSTRA: LISOZIMA (HEWL)
            </span>
            <span className="px-3 py-1 bg-[#14161b] border border-[#1d2027] text-[#c85a32]">
              SPLINE CÚBICO
            </span>
          </div>
        </div>

        {/* Grade de Trabalho */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Painel de Resultados */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-[#1d2027] bg-[#14161b] p-6 space-y-6">
              <h2 className="font-serif text-xl text-[#faf9f5] border-b border-[#1d2027] pb-3">
                Termodinâmica Conformacional
              </h2>

              {dadosAnalise ? (
                <div className="space-y-4 font-mono text-xs">
                  {/* Tm */}
                  <div className="p-4 bg-[#0e1013] border border-[#1d2027] space-y-1">
                    <span className="text-[#918b7e] block">TEMPERATURA DE TRANSIÇÃO (Tm)</span>
                    <span className="text-2xl font-serif text-[#faf9f5] block">
                      {dadosAnalise.temperaturaTransicaoTm.toFixed(1)} °C
                    </span>
                    <span className="text-[10px] text-[#5e594d]">
                      ({(dadosAnalise.temperaturaTransicaoTm + 273.15).toFixed(1)} K)
                    </span>
                  </div>

                  {/* Comparativo de Integração */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[#918b7e] block">ENTALPIA CALORIMÉTRICA (ΔH_cal)</span>

                    <div className="flex justify-between py-1.5 border-b border-[#1d2027]">
                      <span className="text-[#918b7e]">Regra do Trapézio:</span>
                      <span className="text-[#faf9f5] font-semibold">
                        {dadosAnalise.entalpiaTrapezio.toFixed(2)} kJ/mol
                      </span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-[#1d2027]">
                      <span className="text-[#918b7e]">Simpson 1/3 (Spline Cúbico):</span>
                      <span className="text-[#c85a32] font-semibold">
                        {dadosAnalise.entalpiaSimpsonSpline.toFixed(2)} kJ/mol
                      </span>
                    </div>

                    <div className="flex justify-between py-1.5 text-[11px] text-[#5e594d]">
                      <span>Capacidade Máx (ΔCp):</span>
                      <span>{dadosAnalise.capacidadeCalorificaMaxima.toFixed(2)} kJ/(mol·K)</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#918b7e] leading-relaxed pt-2 border-t border-[#1d2027] font-sans">
                    A área total sob o termograma quantifica a energia endotérmica demandada para o desdobramento da estrutura terciária da proteína.
                  </p>
                </div>
              ) : (
                <div className="font-mono text-xs text-[#918b7e]">CARREGANDO DADOS...</div>
              )}
            </div>
          </div>

          {/* Gráfico */}
          <div className="lg:col-span-8 border border-[#1d2027] bg-[#14161b] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-baseline justify-between border-b border-[#1d2027] pb-3 mb-4">
                <h3 className="font-serif text-xl text-[#faf9f5]">
                  Termograma de Desnaturação Térmica
                </h3>
                <span className="font-mono text-xs text-[#918b7e]">
                  ΔH = ∫ ΔCp dT • [40.0°C a 90.0°C]
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
                          grid: { color: '#1d2027' },
                          ticks: { color: '#918b7e', font: { family: 'JetBrains Mono', size: 10 } },
                          title: { display: true, text: 'Temperatura (°C)', color: '#918b7e', font: { family: 'JetBrains Mono' } }
                        },
                        y: {
                          grid: { color: '#1d2027' },
                          ticks: { color: '#918b7e', font: { family: 'JetBrains Mono', size: 10 } },
                          title: { display: true, text: 'ΔCp Excesso (kJ·mol⁻¹·K⁻¹)', color: '#918b7e', font: { family: 'JetBrains Mono' } },
                          min: 0
                        }
                      },
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: '#0e1013',
                          titleColor: '#c85a32',
                          bodyColor: '#e5e2dc',
                          borderColor: '#1d2027',
                          borderWidth: 1,
                          titleFont: { family: 'JetBrains Mono' },
                          bodyFont: { family: 'JetBrains Mono' }
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center font-mono text-xs text-[#918b7e]">
                    INTEGRANDO DADOS DSC...
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-[#1d2027] text-xs font-mono text-[#918b7e]">
              MÉTODO NUMÉRICO: Interpolação via Polinômios Cúbicos por partes (Spline Cúbico) + Quadratura de Simpson
            </div>
          </div>

        </div>

        {/* Problema de Laboratório */}
        <section className="border border-[#1d2027] bg-[#14161b] p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#1d2027] pb-3">
            <h3 className="font-serif text-2xl text-[#faf9f5]">
              Determinação do Ponto Crítico Tm
            </h3>
            <span className="font-mono text-xs text-[#c85a32]">
              RECOMPENSA: +85 CRÉDITOS ACADÊMICOS
            </span>
          </div>

          <p className="text-sm text-[#918b7e] leading-relaxed max-w-3xl">
            A partir da análise do termograma acima, identifique e informe a <strong>Temperatura de Transição Conformacional (Tm em °C)</strong> onde ocorre a absorção máxima de calor:
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <input
              type="number"
              step="0.5"
              value={respostaUsuario}
              onChange={e => setRespostaUsuario(e.target.value)}
              disabled={resolvido}
              placeholder="Ex: 65.0"
              className="px-4 py-2.5 bg-[#0e1013] border border-[#1d2027] text-sm font-mono text-[#faf9f5] focus:outline-none focus:border-[#c85a32] disabled:opacity-50 sm:w-64"
            />
            <button
              onClick={verificarDesafio}
              disabled={resolvido || !respostaUsuario}
              className="px-6 py-2.5 bg-[#c85a32] hover:bg-[#a74521] text-[#faf9f5] text-xs font-mono font-bold uppercase tracking-wider transition disabled:opacity-50"
            >
              {resolvido ? 'Problema Concluído' : 'Submeter Cálculo'}
            </button>
          </div>

          {feedback.tipo && (
            <div
              className={`p-3.5 border font-mono text-xs ${
                feedback.tipo === 'sucesso'
                  ? 'border-[#52754f] bg-[#52754f]/10 text-[#9ebd9c]'
                  : 'border-[#853416] bg-[#853416]/10 text-[#f09673]'
              }`}
            >
              {feedback.msg}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
