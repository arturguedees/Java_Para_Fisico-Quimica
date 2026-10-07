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
            label: '[A] Reagente (M)',
            data: res.data.concentracaoA,
            borderColor: '#c85a32',
            backgroundColor: 'rgba(200, 90, 50, 0.05)',
            fill: true,
            pointRadius: 0,
            borderWidth: 2,
            tension: 0.1
          },
          {
            label: '[B] Produto (M)',
            data: res.data.concentracaoB,
            borderColor: '#918b7e',
            backgroundColor: 'transparent',
            borderDash: [4, 4],
            pointRadius: 0,
            borderWidth: 1.5,
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
      setFeedback({ tipo: 'erro', msg: 'Formato numérico inválido.' });
      return;
    }

    if (!meiaVida) return;

    const erroRelativo = Math.abs((valor - meiaVida) / meiaVida);
    if (erroRelativo <= 0.06) {
      setResolvido(true);
      setFeedback({
        tipo: 'sucesso',
        msg: `Cálculo validado: t½ = ${meiaVida.toFixed(2)} s. +60 Pontos e +60 XP creditados em seu dossier.`
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
        msg: `Divergência de valor. Equação para ordem ${ordem}: ${
          ordem === 1 ? 't½ = ln(2)/k ≈ 0.69315 / ' + k : 't½ = [A]₀ / (2k) = ' + a0 + ' / (2 * ' + k + ')'
        }.`
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
              MÓDULO 01 • CINÉTICA DETERMINÍSTICA
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#faf9f5]">
              Cinética Química & Decaimento Reacional
            </h1>
          </div>

          <div className="flex items-center space-x-3 font-mono text-xs">
            <span className="px-3 py-1 bg-[#14161b] border border-[#1d2027] text-[#918b7e]">
              REAGENTE → PRODUTO
            </span>
            <span className="px-3 py-1 bg-[#14161b] border border-[#1d2027] text-[#c85a32]">
              ORDEM {ordem}
            </span>
          </div>
        </div>

        {/* Grade de Trabalho */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Parâmetros e Cálculos */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-[#1d2027] bg-[#14161b] p-6 space-y-6">
              <h2 className="font-serif text-xl text-[#faf9f5] border-b border-[#1d2027] pb-3">
                Parâmetros da Reação
              </h2>

              {/* Ordem */}
              <div className="space-y-2 font-mono text-xs">
                <label className="text-[#918b7e] block">ORDEM CINÉTICA (n)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrdem(0)}
                    className={`py-2 px-3 border text-center transition-colors ${
                      ordem === 0
                        ? 'border-[#c85a32] bg-[#c85a32]/10 text-[#faf9f5] font-bold'
                        : 'border-[#1d2027] bg-[#0e1013] text-[#918b7e] hover:text-[#e5e2dc]'
                    }`}
                  >
                    Ordem Zero
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrdem(1)}
                    className={`py-2 px-3 border text-center transition-colors ${
                      ordem === 1
                        ? 'border-[#c85a32] bg-[#c85a32]/10 text-[#faf9f5] font-bold'
                        : 'border-[#1d2027] bg-[#0e1013] text-[#918b7e] hover:text-[#e5e2dc]'
                    }`}
                  >
                    1ª Ordem
                  </button>
                </div>
              </div>

              {/* Constante k */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-[#918b7e]">CONSTANTE (k)</span>
                  <span className="text-[#c85a32] font-bold">{k.toFixed(2)} s⁻¹</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.8"
                  step="0.01"
                  value={k}
                  onChange={e => setK(parseFloat(e.target.value))}
                  className="w-full accent-[#c85a32] bg-[#1d2027]"
                />
              </div>

              {/* Concentração Inicial */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-[#918b7e]">CONCENTRAÇÃO INICIAL [A]₀</span>
                  <span className="text-[#c85a32] font-bold">{a0.toFixed(1)} M</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="5.0"
                  step="0.1"
                  value={a0}
                  onChange={e => setA0(parseFloat(e.target.value))}
                  className="w-full accent-[#c85a32] bg-[#1d2027]"
                />
              </div>

              {/* Janela de Tempo */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-[#918b7e]">JANELA DE INTEGRAÇÃO</span>
                  <span className="text-[#faf9f5]">{tempoMax} s</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={tempoMax}
                  onChange={e => setTempoMax(parseInt(e.target.value))}
                  className="w-full accent-[#c85a32] bg-[#1d2027]"
                />
              </div>

              {/* Constantes Derivadas */}
              <div className="pt-4 border-t border-[#1d2027] space-y-2.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-[#918b7e]">MEIA-VIDA (t½):</span>
                  <span className="text-[#faf9f5] font-bold">
                    {meiaVida ? `${meiaVida.toFixed(2)} s` : '-'}
                  </span>
                </div>

                {tempoVida && (
                  <div className="flex justify-between">
                    <span className="text-[#918b7e]">TEMPO DE VIDA (τ):</span>
                    <span className="text-[#faf9f5]">{tempoVida.toFixed(2)} s</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Gráfico Científico */}
          <div className="lg:col-span-8 border border-[#1d2027] bg-[#14161b] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-baseline justify-between border-b border-[#1d2027] pb-3 mb-4">
                <h3 className="font-serif text-xl text-[#faf9f5]">
                  Evolução Temporal das Espécies Moleculares
                </h3>
                <div className="flex items-center space-x-4 font-mono text-[11px]">
                  <span className="text-[#c85a32]">● [A] REAGENTE</span>
                  <span className="text-[#918b7e]">- - [B] PRODUTO</span>
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
                          grid: { color: '#1d2027' },
                          ticks: { color: '#918b7e', font: { family: 'JetBrains Mono', size: 10 } },
                          title: { display: true, text: 'Tempo (s)', color: '#918b7e', font: { family: 'JetBrains Mono' } }
                        },
                        y: {
                          grid: { color: '#1d2027' },
                          ticks: { color: '#918b7e', font: { family: 'JetBrains Mono', size: 10 } },
                          title: { display: true, text: 'Concentração (M)', color: '#918b7e', font: { family: 'JetBrains Mono' } },
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
                    PROCESSANDO CURVAS...
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-[#1d2027] text-xs font-mono text-[#918b7e]">
              EQUAÇÃO INTEGRADA: {ordem === 1 ? '[A]t = [A]₀ · exp(-k·t)' : '[A]t = max(0, [A]₀ - k·t)'}
            </div>
          </div>

        </div>

        {/* Bloco de Desafio de Laboratório */}
        <section className="border border-[#1d2027] bg-[#14161b] p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#1d2027] pb-3">
            <h3 className="font-serif text-2xl text-[#faf9f5]">
              Problema de Verificação Cinética
            </h3>
            <span className="font-mono text-xs text-[#c85a32]">
              RECOMPENSA: +60 CRÉDITOS ACADÊMICOS
            </span>
          </div>

          <p className="text-sm text-[#918b7e] leading-relaxed max-w-3xl">
            Com base nos parâmetros ativos no painel lateral (<code className="text-[#faf9f5]">k = {k} s⁻¹</code>, <code className="text-[#faf9f5]">[A]₀ = {a0} M</code>, <code className="text-[#faf9f5]">Ordem {ordem}</code>), calcule e informe o <strong>Tempo de Meia-Vida (t½ em segundos)</strong>:
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <input
              type="number"
              step="0.01"
              value={respostaUsuario}
              onChange={e => setRespostaUsuario(e.target.value)}
              disabled={resolvido}
              placeholder="Ex: 4.62"
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
