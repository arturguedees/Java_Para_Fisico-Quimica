import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { 
  Wind, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  Info, 
  Gauge, 
  Activity, 
  ArrowRight,
  Flame,
  Zap
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

export default function Maxwell() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<any>(null);

  // Parâmetros de Simulação
  const [gasSelecionado, setGasSelecionado] = useState<string>('ARGONIO');
  const [temperatura, setTemperatura] = useState<number>(300);
  const [tipoGrafico, setTipoGrafico] = useState<'velocidade' | 'energia'>('velocidade');

  // Dados retornados do backend Java
  const [dadosGrafico, setDadosGrafico] = useState<any>(null);
  const [infoFisica, setInfoFisica] = useState<any>(null);

  // Desafio Embutido
  const [respostaUsuario, setRespostaUsuario] = useState<string>('');
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro' | null; msg: string }>({ tipo: null, msg: '' });
  const [resolvido, setResolvido] = useState<boolean>(false);

  const gases = [
    { chave: 'HELIO', nome: 'Hélio (He)', massaG: '4.00 g/mol', cor: '#38bdf8' },
    { chave: 'HIDROGENIO', nome: 'Hidrogênio (H₂)', massaG: '2.02 g/mol', cor: '#a855f7' },
    { chave: 'NITROGENIO', nome: 'Nitrogênio (N₂)', massaG: '28.01 g/mol', cor: '#34d399' },
    { chave: 'OXIGENIO', nome: 'Oxigênio (O₂)', massaG: '32.00 g/mol', cor: '#f43f5e' },
    { chave: 'ARGONIO', nome: 'Argônio (Ar)', massaG: '39.95 g/mol', cor: '#f59e0b' }
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
              label: `f(v) Densidade de Velocidade - ${res.data.gas} (${temperatura} K)`,
              data: res.data.densidadesVelocidade,
              borderColor: '#06b6d4',
              backgroundColor: 'rgba(6, 182, 212, 0.15)',
              fill: true,
              pointRadius: 0,
              borderWidth: 3,
              tension: 0.3
            }
          ]
        });
      } else {
        setDadosGrafico({
          labels: res.data.energias.map((e: number) => (e / 1000).toFixed(1)),
          datasets: [
            {
              label: `f(E) Densidade de Energia Cinética (kJ/mol) - ${temperatura} K`,
              data: res.data.densidadesEnergia,
              borderColor: '#f59e0b',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              fill: true,
              pointRadius: 0,
              borderWidth: 3,
              tension: 0.3
            }
          ]
        });
      }
    } catch (err) {
      console.error('Erro ao calcular Maxwell:', err);
    }
  };

  const verificarDesafio = async () => {
    if (!respostaUsuario.trim()) return;

    const valor = parseFloat(respostaUsuario);
    if (isNaN(valor)) {
      setFeedback({ tipo: 'erro', msg: 'Insira um valor numérico válido.' });
      return;
    }

    if (!infoFisica) return;

    // Desafio pede a velocidade mais provável v_mp
    const vmpEsperada = infoFisica.velocidadeMaisProvavel;
    const erro = Math.abs((valor - vmpEsperada) / vmpEsperada);

    if (erro <= 0.05) {
      setResolvido(true);
      setFeedback({
        tipo: 'sucesso',
        msg: `Correto! v_mp = ${vmpEsperada.toFixed(1)} m/s. Você ganhou +75 XP e +75 Moedas!`
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
        msg: `Valor incorreto. Dica: v_mp = sqrt(2 * R * T / M). Verifique as unidades de M (kg/mol) e R (8.314 J/mol·K).`
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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Wind className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Distribuição de Maxwell-Boltzmann</h1>
              <p className="text-xs text-slate-400">
                Estatística molecular de velocidades e energias cinéticas de gases ideais
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTipoGrafico('velocidade')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                tipoGrafico === 'velocidade'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              Curva de Velocidades f(v)
            </button>
            <button
              onClick={() => setTipoGrafico('energia')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                tipoGrafico === 'energia'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              Energia Cinética f(E)
            </button>
          </div>
        </div>

        {/* Grade de Controles e Gráfico */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Painel Lateral */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 lg:col-span-1 shadow-xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Gauge className="w-4 h-4 text-cyan-400" />
              <span>Gás e Temperatura</span>
            </h2>

            {/* Seletor de Gás */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Escolha da Espécie Gasosa</label>
              <div className="space-y-1.5">
                {gases.map(g => (
                  <button
                    key={g.chave}
                    type="button"
                    onClick={() => setGasSelecionado(g.chave)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition border ${
                      gasSelecionado === g.chave
                        ? 'bg-slate-800 border-cyan-400 text-white shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <span>{g.nome}</span>
                    <span className="text-[10px] font-mono opacity-70">{g.massaG}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Controle de Temperatura */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-300">Temperatura Absoluta</span>
                <span className="text-cyan-400 font-mono font-bold">{temperatura} K</span>
              </div>
              <input
                type="range"
                min="100"
                max="1200"
                step="25"
                value={temperatura}
                onChange={e => setTemperatura(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>100 K (-173°C)</span>
                <span>1200 K (927°C)</span>
              </div>
            </div>

            {/* Quadro de Velocidades Notáveis */}
            {infoFisica && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Velocidades Notáveis
                </span>
                
                <div className="flex justify-between">
                  <span className="text-slate-400">v_mp (Mais Provável):</span>
                  <span className="font-bold text-cyan-300 font-mono">
                    {infoFisica.velocidadeMaisProvavel.toFixed(1)} m/s
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">v_m (Média):</span>
                  <span className="font-bold text-teal-300 font-mono">
                    {infoFisica.velocidadeMedia.toFixed(1)} m/s
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">v_rms (Quadrática Média):</span>
                  <span className="font-bold text-purple-300 font-mono">
                    {infoFisica.velocidadeQuadraticaMedia.toFixed(1)} m/s
                  </span>
                </div>

                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Velocidade do Som:</span>
                  <span className="font-bold text-amber-300 font-mono">
                    {infoFisica.velocidadeDoSom.toFixed(1)} m/s
                  </span>
                </div>
              </div>
            )}

          </div>

          {/* Gráfico */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-3 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white">
                  {tipoGrafico === 'velocidade'
                    ? 'Densidade de Probabilidade de Velocidades f(v)'
                    : 'Densidade de Energia Cinética Translacional f(E)'}
                </h2>
                <span className="text-xs text-slate-400 font-mono">
                  v_mp &lt; v_media &lt; v_rms
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
                          title: { 
                            display: true, 
                            text: tipoGrafico === 'velocidade' ? 'Velocidade Molecular (m/s)' : 'Energia Cinética (kJ/mol)', 
                            color: '#94a3b8' 
                          }
                        },
                        y: {
                          grid: { color: 'rgba(255, 255, 255, 0.05)' },
                          ticks: { color: '#94a3b8', font: { size: 10 } },
                          title: { display: true, text: 'Densidade de Probabilidade', color: '#94a3b8' },
                          min: 0
                        }
                      },
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: '#0f172a',
                          titleColor: '#06b6d4',
                          bodyColor: '#e2e8f0',
                          borderColor: '#334155',
                          borderWidth: 1
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500">
                    Gerando distribuição térmica...
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center space-x-2 text-xs text-slate-400">
              <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>
                Com o aumento da temperatura ou redução da massa molar, a curva achata-se e expande-se para velocidades superiores (maior dispersão térmica).
              </span>
            </div>
          </div>

        </div>

        {/* Desafio Gamificado */}
        <div className="bg-gradient-to-r from-teal-950/40 via-slate-900 to-slate-900 border border-teal-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Desafio de Velocidades Térmicas</h3>
                <p className="text-xs text-slate-400">
                  Gás atual: {infoFisica?.gas} • Temperatura: {temperatura} K
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                +75 XP & Moedas
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-300 mb-4">
            Qual é a <strong>Velocidade Mais Provável (v_mp em m/s)</strong> para o gás e temperatura selecionados?
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="number"
              step="0.1"
              value={respostaUsuario}
              onChange={e => setRespostaUsuario(e.target.value)}
              disabled={resolvido}
              placeholder="Ex: 353.5"
              className="px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:opacity-60"
            />
            <button
              onClick={verificarDesafio}
              disabled={resolvido || !respostaUsuario}
              className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-600/30 disabled:opacity-50 transition flex items-center justify-center space-x-2"
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
