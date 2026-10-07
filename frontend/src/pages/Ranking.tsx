import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trophy, Crown, Medal, Zap, Coins } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 font-sans">
      <Navbar usuario={usuario} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        
        {/* Cabeçalho */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-md text-xs font-semibold mb-1">
                <span>CLASSIFICAÇÃO GERAL</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Ranking da Turma
              </h1>
            </div>
          </div>

          <div className="text-xs text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 font-medium">
            Classificado por total de <strong>Experiência (XP)</strong>
          </div>
        </div>

        {/* Tabela do Ranking */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-sm text-slate-500 font-medium">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Calculando classificação dos alunos...
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 px-6 py-3.5 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
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
                    className={`grid grid-cols-12 px-6 py-4 items-center transition-colors ${
                      isCurrentUser
                        ? 'bg-blue-50/60 border-l-4 border-blue-600'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Posição */}
                    <div className="col-span-2 sm:col-span-1 font-mono text-sm font-bold text-center">
                      {user.posicao === 1 ? (
                        <span className="text-amber-500 text-base font-extrabold">🥇 01</span>
                      ) : user.posicao === 2 ? (
                        <span className="text-slate-400 text-base font-bold">🥈 02</span>
                      ) : user.posicao === 3 ? (
                        <span className="text-amber-700 text-base font-bold">🥉 03</span>
                      ) : (
                        <span className="text-slate-500">{String(user.posicao).padStart(2, '0')}</span>
                      )}
                    </div>

                    {/* Aluno, Insígnia e Título */}
                    <div className="col-span-7 sm:col-span-8 flex items-center space-x-3.5">
                      <AvatarBadge avatarId={user.avatarId} size="sm" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm sm:text-base text-slate-900">
                            {user.nomeCompleto}
                          </span>
                          {isCurrentUser && (
                            <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                              VOCÊ
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-blue-700 font-medium block">
                          {user.titulo}
                        </span>
                      </div>
                    </div>

                    {/* Pontuação */}
                    <div className="col-span-3 text-right text-xs">
                      <div className="text-sm sm:text-base font-bold text-slate-900 font-mono">
                        {user.experiencia} <span className="text-[11px] text-slate-500 font-normal">XP</span>
                      </div>
                      <span className="text-amber-700 font-semibold font-mono text-xs">
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
