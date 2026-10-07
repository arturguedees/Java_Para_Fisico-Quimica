import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Wind, CheckCircle, AlertCircle, ArrowRight, HelpCircle } from 'lucide-react';
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
              label: `f(v) Distribuição de Velocidade - ${res.data.gas}`,
              data: res.data.densidadesVelocidade,
              borderColor: '#ea580c',
              backgroundColor: 'rgba(234, 88, 12, 0.15)',
              fill: true,
              pointRadius: 0,
              borderWidth: 3,
              tension: 0.2
            }
          ]
        });
      } else {
        setDadosGrafico({
          labels: res.data.energias.map((e: number) => (e / 1000).toFixed(1)),
          datasets: [
            {
              label: `f(E) Energia Cinética (kJ/mol)`,
              data: res.data.densidadesEnergia,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              fill: true,
              pointRadius: 0,
              borderWidth: 3,
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
      setFeedback({ tipo: 'erro', msg: 'Digite um número válido.' });
      return;
    }

    if (!infoFisica) return;

    const vmpEsperada = infoFisica.velocidadeMaisProvavel;
    const erro = Math.abs((valor - vmpEsperada) / vmpEsperada);

    if (erro <= 0.05) {
      setResolvido(true);
      setFeedback({
        tipo: 'sucesso',
        msg: `Muito bem! A velocidade mais provável é ${vmpEsperada.toFixed(1)} m/s. Você recebeu +75 XP e +75 Pontos!`
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
        msg: `Valor incorreto. Dica de estudo: use a fórmula v_mp = sqrt(2 · R · T / M), com R = 8.314 J/(mol·K) e M em kg/mol.`
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
            <div className="w-11 h-11 rounded-lg bg-surface-highlight flex items-center justify-center text-cyan-400">
              <Wind className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase">MÓDULO 02 • TERMODINÂMICA DOS GASES</span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                Distribuição de Maxwell-Boltzmann
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2 font-mono text-xs">
            <button
              onClick={() => setTipoGrafico('velocidade')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                tipoGrafico === 'velocidade'
                  ? 'bg-brand text-white shadow-sm'
                  : 'bg-surface-elevated text-slate-300 hover:text-white border border-border'
              }`}
            >
              Velocidades f(v)
            </button>
            <button
              onClick={() => setTipoGrafico('energia')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                tipoGrafico === 'energia'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-surface-elevated text-slate-300 hover:text-white border border-border'
              }`}
            >
              Energia Cinética f(E)
            </button>
          </div>
        </div>

        {/* Grade de Trabalho */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Painel de Controle */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6 space-y-5 shadow-md">
              <h2 className="font-serif text-lg font-bold text-white border-b border-border pb-3">
                Seleção do Gás & Temperatura
              </h2>

              {/* Lista de Gases */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 block">Tipo de Gás</label>
                <div className="space-y-1.5">
                  {gases.map(g => (
                    <button
                      key={g.chave}
                      type="button"
                      onClick={() => setGasSelecionado(g.chave)}
                      className={`w-full py-2.5 px-3.5 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                        gasSelecionado === g.chave
                          ? 'bg-brand text-white shadow-md'
                          : 'bg-surface-elevated text-slate-300 hover:text-white border border-border'
                      }`}
                    >
                      <span>{g.nome}</span>
                      <span className="font-mono text-[11px] opacity-80">{g.massaG}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider de Temperatura */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-200">Temperatura Absoluta (T)</span>
                  <span className="text-cyan-400 font-mono font-bold">{temperatura} K</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1200"
                  step="25"
                  value={temperatura}
                  onChange={e => setTemperatura(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 h-2 bg-surface-highlight rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>100 K (-173°C)</span>
                  <span>1200 K (927°C)</span>
                </div>
              </div>

              {/* Velocidades Notáveis Calculadas */}
              {infoFisica && (
                <div className="pt-4 border-t border-border space-y-2 bg-surface-elevated p-3.5 rounded-lg border text-xs">
                  <span className="text-slate-200 font-bold uppercase block pb-1">
                    Velocidades Moleculares
                  </span>

                  <div className="flex justify-between">
                    <span className="text-slate-300">v_mp (Mais Provável):</span>
                    <span className="text-white font-mono font-bold">
                      {infoFisica.velocidadeMaisProvavel.toFixed(1)} m/s
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-300">v_m (Velocidade Média):</span>
                    <span className="text-white font-mono font-bold">
                      {infoFisica.velocidadeMedia.toFixed(1)} m/s
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-300">v_rms (Quadrática Média):</span>
                    <span className="text-white font-mono font-bold">
                      {infoFisica.velocidadeQuadraticaMedia.toFixed(1)} m/s
                    </span>
                  </div>

                  <div className="flex justify-between pt-1 border-t border-border text-cyan-400 font-semibold">
                    <span>Velocidade do Som no Gás:</span>
                    <span className="font-mono">{infoFisica.velocidadeDoSom.toFixed(1)} m/s</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Gráfico */}
          <div className="lg:col-span-8 bg-surface border border-border rounded-xl p-6 flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <h3 className="font-serif text-xl font-bold text-white">
                  {tipoGrafico === 'velocidade'
                    ? 'Curva de Distribuição de Velocidades f(v)'
                    : 'Curva de Energia Cinética Translacional f(E)'}
                </h3>
                <span className="text-xs font-mono font-bold text-cyan-400">
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
                          grid: { color: '#1e293b' },
                          ticks: { color: '#cbd5e1', font: { family: 'JetBrains Mono', size: 11 } },
                          title: { 
                            display: true, 
                            text: tipoGrafico === 'velocidade' ? 'Velocidade Molecular (m/s)' : 'Energia Cinética (kJ/mol)', 
                            color: '#94a3b8', 
                            font: { weight: 'bold' } 
                          }
                        },
                        y: {
                          grid: { color: '#1e293b' },
                          ticks: { color: '#cbd5e1', font: { family: 'JetBrains Mono', size: 11 } },
                          title: { display: true, text: 'Densidade de Probabilidade', color: '#94a3b8', font: { weight: 'bold' } },
                          min: 0
                        }
                      },
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: '#111827',
                          titleColor: '#ea580c',
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
                    Calculando curva térmica...
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 p-3 bg-surface-elevated rounded-lg border border-border text-xs text-slate-300">
              Conceito: gases mais leves (como Hélio) ou temperaturas maiores provocam uma curva mais achatada e deslocada para a direita (maiores velocidades).
            </div>
          </div>

        </div>

        {/* Exercício de Fixação */}
        <section className="bg-surface border border-border rounded-xl p-6 sm:p-8 space-y-4 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-brand" />
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                Exercício de Fixação: Velocidade Molecular
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 px-3 py-1 rounded-full border border-amber-500/30">
              RECOMPENSA: +75 XP & PONTOS
            </span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            Para o gás <strong className="text-white">{infoFisica?.gas}</strong> na temperatura de <strong className="text-white">{temperatura} K</strong>, qual é a <strong>Velocidade Mais Provável (v_mp em m/s)</strong>?
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <input
              type="number"
              step="0.1"
              value={respostaUsuario}
              onChange={e => setRespostaUsuario(e.target.value)}
              disabled={resolvido}
              placeholder="Digite a velocidade (ex: 353.5)"
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
