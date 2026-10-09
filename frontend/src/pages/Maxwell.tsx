import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Wind, CheckCircle2, AlertCircle, ArrowRight, HelpCircle, Activity, Printer } from 'lucide-react';
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
              label: `f(v) Velocidades - ${res.data.gas}`,
              data: res.data.densidadesVelocidade,
              borderColor: '#4f46e5',
              backgroundColor: 'rgba(79, 70, 229, 0.12)',
              fill: true,
              pointRadius: 0,
              borderWidth: 3,
              tension: 0.25
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
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              fill: true,
              pointRadius: 0,
              borderWidth: 3,
              tension: 0.25
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
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.7 }
      });

      setFeedback({
        tipo: 'sucesso',
        msg: `Sensacional! A velocidade mais provável é ${vmpEsperada.toFixed(1)} m/s. Você recebeu +75 XP e +75 Moedas!`
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
        msg: `Valor incorreto. Dica de ouro: use a fórmula v_mp = √(2 · R · T / M), onde R = 8.314 J/(mol·K) e M em kg/mol.`
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
            <div className="w-16 h-16 bg-white border-4 border-dark text-dark flex items-center justify-center shadow-neo-sm transform hover:-rotate-6 transition-all">
              <Wind className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-dark text-white border-2 border-dark rounded-md text-xs font-black uppercase tracking-widest shadow-neo-sm">
                <Activity className="w-4 h-4 stroke-[3]" />
                <span>MÓDULO 02 • TERMODINÂMICA DOS GASES</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-dark tracking-tighter uppercase font-display leading-tight">
                Distribuição de Maxwell-Boltzmann
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
            <button
              onClick={() => setTipoGrafico('velocidade')}
              className={`px-4 py-3 border-4 transition-all ${
                tipoGrafico === 'velocidade'
                  ? 'btn-quantum-primary shadow-neo-sm border-dark'
                  : 'bg-white text-dark border-dark hover:bg-slate-50'
              }`}
            >
              Velocidades f(v)
            </button>
            <button
              onClick={() => setTipoGrafico('energia')}
              className={`px-4 py-3 border-4 transition-all ${
                tipoGrafico === 'energia'
                  ? 'bg-yellow-300 text-dark border-dark shadow-neo-sm'
                  : 'bg-white text-dark border-dark hover:bg-slate-50'
              }`}
            >
              Energia f(E)
            </button>
          </div>
        </div>

        {/* Grade de Trabalho */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Painel de Controle */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border-4 border-dark rounded-3xl p-6 space-y-5 shadow-neo">
              <h2 className="text-lg font-black uppercase text-dark border-b-2 border-dark/20 pb-3 font-display">
                Gás & Temperatura
              </h2>

              {/* Lista de Gases */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-dark block">Gases de Estudo (Paper ACS)</label>
                <div className="space-y-2">
                  {gases.map(g => (
                    <button
                      key={g.chave}
                      type="button"
                      onClick={() => setGasSelecionado(g.chave)}
                      className={`w-full py-3 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-between border-2 transition-all ${
                        gasSelecionado === g.chave
                          ? 'bg-brand border-dark text-dark shadow-neo-sm translate-x-1'
                          : 'bg-white text-dark border-dark/40 hover:border-dark hover:bg-slate-50'
                      }`}
                    >
                      <span>{g.nome}</span>
                      <span className="font-mono text-[11px] bg-dark text-white px-2 py-0.5 rounded">{g.massaG}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider de Temperatura */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                  <span className="text-dark">Temperatura Absoluta (T)</span>
                  <span className="text-dark font-mono bg-yellow-300 px-2 py-0.5 border border-dark rounded">{temperatura} K</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1200"
                  step="25"
                  value={temperatura}
                  onChange={e => setTemperatura(parseInt(e.target.value))}
                  className="w-full accent-dark h-2.5 bg-slate-200 border border-dark rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-dark/60 font-mono font-bold">
                  <span>100 K (-173°C)</span>
                  <span>1200 K (927°C)</span>
                </div>
              </div>

              {/* Velocidades Notáveis Calculadas */}
              {infoFisica && (
                <div className="pt-4 border-t-2 border-dark/20 space-y-3 bg-brand/30 p-4 rounded-2xl border-2 border-dark text-xs">
                  <span className="text-xs font-black text-dark uppercase tracking-wider block pb-1">
                    Velocidades Notáveis (m/s)
                  </span>

                  <div className="flex justify-between font-black uppercase">
                    <span className="text-dark/80">v_mp (Mais Provável):</span>
                    <span className="text-dark font-mono bg-white px-2 py-0.5 border border-dark rounded shadow-neo-sm">
                      {infoFisica.velocidadeMaisProvavel.toFixed(1)} m/s
                    </span>
                  </div>

                  <div className="flex justify-between font-black uppercase">
                    <span className="text-dark/80">v_m (Velocidade Média):</span>
                    <span className="text-dark font-mono bg-white px-2 py-0.5 border border-dark rounded shadow-neo-sm">
                      {infoFisica.velocidadeMedia.toFixed(1)} m/s
                    </span>
                  </div>

                  <div className="flex justify-between font-black uppercase">
                    <span className="text-dark/80">v_rms (Quadrática Média):</span>
                    <span className="text-dark font-mono bg-white px-2 py-0.5 border border-dark rounded shadow-neo-sm">
                      {infoFisica.velocidadeQuadraticaMedia.toFixed(1)} m/s
                    </span>
                  </div>

                  <div className="flex justify-between pt-2 border-t-2 border-dark/20 text-dark font-black uppercase bg-yellow-300 -mx-4 -mb-4 p-3 rounded-b-xl border-x-0 border-b-0">
                    <span>⚡ Velocidade do Som (c):</span>
                    <span className="font-mono bg-dark text-white px-2 py-0.5 rounded shadow-neo-sm">{infoFisica.velocidadeDoSom.toFixed(1)} m/s</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Gráfico */}
          <div className="lg:col-span-8 quantum-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-lg font-extrabold text-slate-900">
                  {tipoGrafico === 'velocidade'
                    ? 'Curva de Distribuição de Velocidades f(v)'
                    : 'Curva de Energia Cinética Translacional f(E)'}
                </h3>
                <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200/60 shadow-2xs">
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
                          grid: { color: 'rgba(226, 232, 240, 0.8)' },
                          ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 11 } },
                          title: { 
                            display: true, 
                            text: tipoGrafico === 'velocidade' ? 'Velocidade Molecular (m/s)' : 'Energia Cinética (kJ/mol)', 
                            color: '#475569', 
                            font: { weight: 'bold' } 
                          }
                        },
                        y: {
                          grid: { color: 'rgba(226, 232, 240, 0.8)' },
                          ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 11 } },
                          title: { display: true, text: 'Densidade de Probabilidade', color: '#475569', font: { weight: 'bold' } },
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
                    Calculando curva térmica...
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-xs text-slate-600">
              💡 <strong>Comportamento Físico:</strong> Moléculas leves deslocam o pico da distribuição para velocidades mais altas, achatando a amplitude de $f(v)$ para manter a integral unitária.
            </div>
          </div>

        </div>

        {/* Exercício de Fixação */}
        <section className="quantum-card rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              <h3 className="text-xl font-bold text-slate-900">
                Exercício Rápido: Velocidade Molecular
              </h3>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200">
              RECOMPENSA: +75 XP & PONTOS
            </span>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            Para o gás <strong className="text-slate-900 font-bold">{infoFisica?.gas}</strong> na temperatura de <strong className="text-slate-900 font-bold">{temperatura} K</strong>, qual é a <strong>Velocidade Mais Provável (v_mp em m/s)</strong>?
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <input
              type="number"
              step="0.1"
              value={respostaUsuario}
              onChange={e => setRespostaUsuario(e.target.value)}
              disabled={resolvido}
              placeholder="Digite a velocidade (ex: 353.5)"
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
