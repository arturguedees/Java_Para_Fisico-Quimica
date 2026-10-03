import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Cinetica() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<any>(null);
  
  // Parâmetros do gráfico
  const [ordem, setOrdem] = useState(1);
  const [k, setK] = useState(0.1);
  const [a0, setA0] = useState(1.0);
  
  // Dados do servidor
  const [dadosGrafico, setDadosGrafico] = useState<any>(null);
  const [meiaVidaEsperada, setMeiaVidaEsperada] = useState<number | null>(null);

  // Gamificação (Exercício)
  const [respostaMeiaVida, setRespostaMeiaVida] = useState('');
  const [feedback, setFeedback] = useState('');
  const [resolvido, setResolvido] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem('usuario');
    if (!data) navigate('/login');
    else setUsuario(JSON.parse(data));
  }, [navigate]);

  useEffect(() => {
    calcular();
  }, [ordem, k, a0]);

  const calcular = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/cinetica/calcular', {
        params: {
          concentracaoInicial: a0,
          constanteVelocidade: k,
          ordem: ordem,
          tempoMaximo: 20
        }
      });
      
      setMeiaVidaEsperada(res.data.meiaVida);
      setDadosGrafico({
        labels: res.data.tempo.map((t: number) => t.toFixed(1)),
        datasets: [
          {
            label: '[A] (Reagente)',
            data: res.data.concentracaoA,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            pointRadius: 0,
            borderWidth: 2
          },
          {
            label: '[B] (Produto)',
            data: res.data.concentracaoB,
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            pointRadius: 0,
            borderWidth: 2
          }
        ]
      });
    } catch (err) {
      console.error(err);
    }
  };

  const verificarResposta = async () => {
    if (resolvido) return;
    
    const resposta = parseFloat(respostaMeiaVida);
    if (isNaN(resposta)) {
      setFeedback('Digite um número válido.');
      return;
    }

    // Margem de erro de 5%
    const erro = Math.abs((resposta - (meiaVidaEsperada || 0)) / (meiaVidaEsperada || 1));
    if (erro <= 0.05) {
      setResolvido(true);
      setFeedback('Correto! Você ganhou +50 XP e +50 Pontos.');
      
      // Enviar pro backend pra computar os pontos
      if (usuario) {
        try {
          const res = await axios.post(`http://localhost:8080/api/usuarios/${usuario.id}/ganhar-xp?pontosXp=50`);
          localStorage.setItem('usuario', JSON.stringify(res.data)); // atualiza cache
        } catch (e) {
          console.error('Erro ao salvar pontos', e);
        }
      }
    } else {
      setFeedback('Incorreto. Tente observar o gráfico ou a fórmula (t1/2 = ln(2)/k para 1ª ordem).');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <Link to="/dashboard" className="inline-flex items-center text-blue-600 hover:underline font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Laboratório Virtual: Cinética</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Controles */}
            <div className="space-y-4 col-span-1">
              <div>
                <label className="block text-sm font-medium text-gray-700">Ordem da Reação</label>
                <select 
                  value={ordem} onChange={e => setOrdem(Number(e.target.value))}
                  className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Ordem Zero</option>
                  <option value={1}>Primeira Ordem</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">k (Constante) = {k}</label>
                <input 
                  type="range" min="0.01" max="1.0" step="0.01" 
                  value={k} onChange={e => setK(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">[A]₀ (Inicial) = {a0}</label>
                <input 
                  type="range" min="0.1" max="5.0" step="0.1" 
                  value={a0} onChange={e => setA0(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Gráfico */}
            <div className="col-span-3 border rounded-xl p-4 bg-gray-50 h-80 flex items-center justify-center">
              {dadosGrafico ? (
                <Line 
                  data={dadosGrafico} 
                  options={{ maintainAspectRatio: false, animation: false }} 
                />
              ) : <p>Carregando gráfico...</p>}
            </div>
          </div>
        </div>

        {/* Exercício para ganhar XP */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-indigo-900 mb-2">Desafio Prático</h2>
          <p className="text-indigo-800 mb-4">
            Observando os parâmetros atuais (k = {k}, [A]₀ = {a0}) para uma reação de ordem {ordem}, qual é o <strong>Tempo de Meia-Vida (t½)</strong> aproximado?
          </p>
          
          <div className="flex items-center space-x-4">
            <input 
              type="number" step="0.1"
              value={respostaMeiaVida}
              onChange={e => setRespostaMeiaVida(e.target.value)}
              disabled={resolvido}
              placeholder="Ex: 6.9"
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
            />
            <button 
              onClick={verificarResposta}
              disabled={resolvido}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              Responder
            </button>
          </div>

          {feedback && (
            <div className={`mt-4 p-3 rounded-lg flex items-center ${resolvido ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {resolvido && <CheckCircle className="w-5 h-5 mr-2" />}
              {feedback}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
