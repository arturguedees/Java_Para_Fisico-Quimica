import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trophy, Crown, Medal, Zap, Coins, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import AvatarBadge from '../components/AvatarBadge';

interface RankUser {
  posicao: number;
  id: number;
  nomeCompleto: string;
  titulo: string;
  avatarId: string;
  experiencia: number;
  pontos: number;
}

export default function Ranking() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<any>(null);
  const [ranking, setRanking] = useState<RankUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = localStorage.getItem('usuario');
    if (!data) {
      navigate('/login');
    } else {
      setUsuario(JSON.parse(data));
      carregarRanking();
    }
  }, [navigate]);

  const carregarRanking = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/usuarios/ranking');
      setRanking(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Erro no ranking:', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-800 pb-24 font-sans">
      <Navbar usuario={usuario} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        
        {/* Cabeçalho */}
        <div className="quantum-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-md shadow-amber-500/25">
              <Trophy className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-md text-xs font-bold mb-1 border border-amber-200/60 shadow-2xs">
                <span>CLASSIFICAÇÃO GERAL DOS ALUNOS</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Ranking da Turma
              </h1>
            </div>
          </div>

          <div className="text-xs text-slate-600 bg-slate-50/90 px-4 py-2.5 rounded-xl border border-slate-200 font-semibold shadow-2xs">
            Classificado por <strong className="text-indigo-600 font-extrabold">Experiência (XP)</strong>
          </div>
        </div>

        {/* Tabela do Ranking com Estilo Moderno */}
        {loading ? (
          <div className="quantum-card rounded-3xl p-12 text-center text-sm text-slate-500 font-medium">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Calculando classificação geral...
          </div>
        ) : (
          <div className="quantum-card rounded-3xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 px-6 py-4 border-b border-slate-200/80 text-xs font-extrabold text-slate-500 uppercase tracking-wider bg-slate-50/80">
              <div className="col-span-2 sm:col-span-1 text-center">POS</div>
              <div className="col-span-7 sm:col-span-8">ESTUDANTE & TÍTULO</div>
              <div className="col-span-3 text-right">XP / MOEDAS</div>
            </div>

            <div className="divide-y divide-slate-100">
              {ranking.map(user => {
                const isCurrentUser = usuario?.id === user.id;

                return (
                  <div
                    key={user.id}
                    className={`grid grid-cols-12 px-6 py-4.5 items-center transition-all duration-200 ${
                      isCurrentUser
                        ? 'bg-gradient-to-r from-indigo-50/80 via-blue-50/40 to-transparent border-l-4 border-indigo-600 shadow-2xs'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Posição */}
                    <div className="col-span-2 sm:col-span-1 font-mono text-sm font-bold text-center">
                      {user.posicao === 1 ? (
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 text-white font-extrabold shadow-sm shadow-amber-500/30 scale-110">
                          1º
                        </div>
                      ) : user.posicao === 2 ? (
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-slate-300 to-slate-400 text-white font-extrabold shadow-2xs">
                          2º
                        </div>
                      ) : user.posicao === 3 ? (
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-700 text-white font-extrabold shadow-2xs">
                          3º
                        </div>
                      ) : (
                        <span className="text-slate-500 font-bold">{String(user.posicao).padStart(2, '0')}</span>
                      )}
                    </div>

                    {/* Aluno, Insígnia e Título */}
                    <div className="col-span-7 sm:col-span-8 flex items-center space-x-3.5">
                      <AvatarBadge avatarId={user.avatarId} size="sm" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-sm sm:text-base text-slate-900">
                            {user.nomeCompleto}
                          </span>
                          {isCurrentUser && (
                            <span className="text-[10px] font-extrabold bg-indigo-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                              VOCÊ
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-indigo-700 font-bold block">
                          {user.titulo}
                        </span>
                      </div>
                    </div>

                    {/* Pontuação */}
                    <div className="col-span-3 text-right text-xs">
                      <div className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">
                        {user.experiencia} <span className="text-[11px] text-slate-500 font-normal">XP</span>
                      </div>
                      <span className="text-amber-700 font-bold font-mono text-xs">
                        {user.pontos} pts
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
