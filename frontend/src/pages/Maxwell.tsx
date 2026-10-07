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

export default function Maxwell() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<any>(null);

  // Parâmetros
  const [gasSelecionado, setGasSelecionado] = useState<string>('ARGONIO');
  const [temperatura, setTemperatura] = useState<number>(300);
  const [tipoGrafico, setTipoGrafico] = useState<'velocidade' | 'energia'>('velocidade');

  // Dados
  const [dadosGrafico, setDadosGrafico] = useState<any>(null);
  const [infoFisica, setInfoFisica] = useState<any>(null);

  // Desafio
  const [respostaUsuario, setRespostaUsuario] = useState<string>('');
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro' | null; msg: string }>({ tipo: null, msg: '' });
  const [resolvido, setResolvido] = useState<boolean>(false);

  const gases = [
    { chave: 'HELIO', nome: 'Hélio (He)', massaG: '4.00 g/mol' },
    { chave: 'HIDROGENIO', nome: 'Hidrogênio (H₂)', massaG: '2.02 g/mol' },
    { chave: 'NITROGENIO', nome: 'Nitrogênio (N₂)', massaG: '28.01 g/mol' },
    { chave: 'OXIGENIO', nome: 'Oxigênio (O₂)', massaG: '32.00 g/mol' },
    { chave: 'ARGONIO', nome: 'Argônio (Ar)', massaG: '39.95 g/mol' }
  ];

  useEffect(() => {
    const data = localStorage.getItem('usuario');
    if (!data) {
      navigate('/login');
    } else {
      const u = JSON.parse(data);
      setUsuario(u);
      if (u.exerciciosResolvidos && u.exerciciosResolvidos.includes('max_lab_01')) {
        setResolvido(true);
      }
    }
  }, [navigate]);

  useEffect(() => {
    calcularMaxwell();
  }, [gasSelecionado, temperatura, tipoGrafico]);

  const calcularMaxwell = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/maxwell/calcular', {
        params: {
          gasNome: gasSelecionado,
          temperaturaKelvin: temperatura
        }
      });

      setInfoFisica(res.data);

      if (tipoGrafico === 'velocidade') {
        setDadosGrafico({
          labels: res.data.velocidades.map((v: number) => v.toFixed(0)),
          datasets: [
            {
              label: `f(v) Densidade de Probabilidade`,
              data: res.data.densidadesVelocidade,
              borderColor: '#c85a32',
              backgroundColor: 'rgba(200, 90, 50, 0.05)',
              fill: true,
              pointRadius: 0,
              borderWidth: 2,
              tension: 0.2
            }
          ]
        });
      } else {
        setDadosGrafico({
          labels: res.data.energias.map((e: number) => (e / 1000).toFixed(1)),
          datasets: [
            {
              label: `f(E) Densidade de Energia (kJ/mol)`,
              data: res.data.densidadesEnergia,
              borderColor: '#759972',
              backgroundColor: 'rgba(117, 153, 114, 0.05)',
              fill: true,
              pointRadius: 0,
              borderWidth: 2,
              tension: 0.2
            }
          ]
        });
      }
    } catch (err) {
      console.error('Erro em Maxwell:', err);
    }
  };

  const verificarDesafio = async () => {
    if (!respostaUsuario.trim()) return;

    const valor = parseFloat(respostaUsuario);
    if (isNaN(valor)) {
      setFeedback({ tipo: 'erro', msg: 'Formato numérico inválido.' });
      return;
    }

    if (!infoFisica) return;

    const vmpEsperada = infoFisica.velocidadeMaisProvavel;
    const erro = Math.abs((valor - vmpEsperada) / vmpEsperada);

    if (erro <= 0.05) {
      setResolvido(true);
      setFeedback({
        tipo: 'sucesso',
        msg: `Correto: v_mp = ${vmpEsperada.toFixed(1)} m/s. +75 Pontos e +75 XP creditados no dossier.`
      });

      if (usuario) {
        try {
          const res = await axios.post(
            `http://localhost:8080/api/usuarios/${usuario.id}/ganhar-xp?pontosXp=75&exercicioId=max_lab_01`
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
        msg: `Divergência. Equação: v_mp = sqrt(2·R·T / M). R = 8.314 J/(mol·K) e M em kg/mol.`
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
              MÓDULO 02 • TERMODINÂMICA ESTATÍSTICA
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#faf9f5]">
              Distribuição de Maxwell-Boltzmann
            </h1>
          </div>

          <div className="flex items-center space-x-2 font-mono text-xs">
            <button
              onClick={() => setTipoGrafico('velocidade')}
              className={`px-3 py-1.5 border transition-colors ${
                tipoGrafico === 'velocidade'
                  ? 'border-[#c85a32] bg-[#c85a32]/10 text-[#faf9f5] font-semibold'
                  : 'border-[#1d2027] bg-[#14161b] text-[#918b7e] hover:text-[#e5e2dc]'
              }`}
            >
              Velocidades f(v)
            </button>
            <button
              onClick={() => setTipoGrafico('energia')}
              className={`px-3 py-1.5 border transition-colors ${
                tipoGrafico === 'energia'
                  ? 'border-[#759972] bg-[#759972]/10 text-[#faf9f5] font-semibold'
                  : 'border-[#1d2027] bg-[#14161b] text-[#918b7e] hover:text-[#e5e2dc]'
              }`}
            >
              Energia Cinética f(E)
            </button>
          </div>
        </div>

        {/* Grade de Trabalho */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Painel de Controle */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-[#1d2027] bg-[#14161b] p-6 space-y-6">
              <h2 className="font-serif text-xl text-[#faf9f5] border-b border-[#1d2027] pb-3">
                Seleção do Sistema Gasoso
              </h2>

              {/* Lista de Gases */}
              <div className="space-y-1.5 font-mono text-xs">
                <label className="text-[#918b7e] block">ESPÉCIE QUÍMICA</label>
                {gases.map(g => (
                  <button
                    key={g.chave}
                    type="button"
                    onClick={() => setGasSelecionado(g.chave)}
                    className={`w-full py-2 px-3 border text-left flex items-center justify-between transition-colors ${
                      gasSelecionado === g.chave
                        ? 'border-[#c85a32] bg-[#c85a32]/10 text-[#faf9f5] font-bold'
                        : 'border-[#1d2027] bg-[#0e1013] text-[#918b7e] hover:text-[#e5e2dc]'
                    }`}
                  >
                    <span>{g.nome}</span>
                    <span className="text-[10px] text-[#5e594d]">{g.massaG}</span>
                  </button>
                ))}
              </div>

              {/* Slider de Temperatura */}
              <div className="space-y-2 font-mono text-xs pt-2">
                <div className="flex justify-between">
                  <span className="text-[#918b7e]">TEMPERATURA ABSOLUTA (T)</span>
                  <span className="text-[#c85a32] font-bold">{temperatura} K</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1200"
                  step="25"
                  value={temperatura}
                  onChange={e => setTemperatura(parseInt(e.target.value))}
                  className="w-full accent-[#c85a32] bg-[#1d2027]"
                />
                <div className="flex justify-between text-[10px] text-[#5e594d]">
                  <span>100 K (-173°C)</span>
                  <span>1200 K (927°C)</span>
                </div>
              </div>

              {/* Tabela de Velocidades Notáveis */}
              {infoFisica && (
                <div className="pt-4 border-t border-[#1d2027] space-y-2 font-mono text-xs">
                  <span className="text-[11px] text-[#918b7e] uppercase block pb-1">
                    Grandezas Notáveis
                  </span>

                  <div className="flex justify-between">
                    <span className="text-[#918b7e]">v_mp (Mais Provável):</span>
                    <span className="text-[#faf9f5] font-bold">
                      {infoFisica.velocidadeMaisProvavel.toFixed(1)} m/s
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#918b7e]">v_m (Velocidade Média):</span>
                    <span className="text-[#faf9f5]">
                      {infoFisica.velocidadeMedia.toFixed(1)} m/s
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#918b7e]">v_rms (Quadrática Média):</span>
                    <span className="text-[#faf9f5]">
                      {infoFisica.velocidadeQuadraticaMedia.toFixed(1)} m/s
                    </span>
                  </div>

                  <div className="flex justify-between pt-1 border-t border-[#1d2027]">
                    <span className="text-[#918b7e]">Velocidade do Som:</span>
                    <span className="text-[#c85a32]">
                      {infoFisica.velocidadeDoSom.toFixed(1)} m/s
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Gráfico */}
          <div className="lg:col-span-8 border border-[#1d2027] bg-[#14161b] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-baseline justify-between border-b border-[#1d2027] pb-3 mb-4">
                <h3 className="font-serif text-xl text-[#faf9f5]">
                  {tipoGrafico === 'velocidade'
                    ? 'Densidade de Probabilidade de Velocidades f(v)'
                    : 'Densidade de Energia Cinética Translacional f(E)'}
                </h3>
                <span className="font-mono text-xs text-[#918b7e]">
                  {infoFisica?.gas} • {temperatura} K
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
                          title: { 
                            display: true, 
                            text: tipoGrafico === 'velocidade' ? 'Velocidade Molecular (m/s)' : 'Energia Cinética (kJ/mol)', 
                            color: '#918b7e', 
                            font: { family: 'JetBrains Mono' } 
                          }
                        },
                        y: {
                          grid: { color: '#1d2027' },
                          ticks: { color: '#918b7e', font: { family: 'JetBrains Mono', size: 10 } },
                          title: { display: true, text: 'Densidade Probabilística', color: '#918b7e', font: { family: 'JetBrains Mono' } },
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
                    CÁLCULO ESTATÍSTICO...
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-[#1d2027] text-xs font-mono text-[#918b7e]">
              RELAÇÃO TEÓRICA: v_mp &lt; v_média &lt; v_rms • ∫ f(v) dv = 1.0 (Normalização Estocástica)
            </div>
          </div>

        </div>

        {/* Problema de Laboratório */}
        <section className="border border-[#1d2027] bg-[#14161b] p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#1d2027] pb-3">
            <h3 className="font-serif text-2xl text-[#faf9f5]">
              Determinação de Velocidade Mais Provável
            </h3>
            <span className="font-mono text-xs text-[#c85a32]">
              RECOMPENSA: +75 CRÉDITOS ACADÊMICOS
            </span>
          </div>

          <p className="text-sm text-[#918b7e] leading-relaxed max-w-3xl">
            Calcule a <strong>Velocidade Mais Provável (v_mp em m/s)</strong> das moléculas de {infoFisica?.gas} na temperatura de {temperatura} K:
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <input
              type="number"
              step="0.1"
              value={respostaUsuario}
              onChange={e => setRespostaUsuario(e.target.value)}
              disabled={resolvido}
              placeholder="Ex: 353.5"
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
