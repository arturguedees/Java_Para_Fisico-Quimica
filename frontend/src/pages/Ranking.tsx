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
    <div className="min-h-screen bg-canvas text-slate-100 pb-24 font-sans">
      <Navbar usuario={usuario} />

      <main className="max-w-5xl mx-auto px-4 sm:px-8 pt-8 space-y-6">
        
        {/* Cabeçalho */}
        <div className="bg-surface border border-border rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-lg bg-surface-highlight flex items-center justify-center text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase">CLASSIFICAÇÃO GERAL</span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                Ranking dos Estudantes
              </h1>
            </div>
          </div>

          <div className="font-mono text-xs text-slate-300 bg-surface-elevated px-3.5 py-1.5 rounded-lg border border-border">
            Ordenado por Experiência (XP)
          </div>
        </div>

        {/* Tabela do Ranking */}
        {loading ? (
          <div className="font-mono text-sm text-slate-400 py-12 text-center">
            Calculando posições dos alunos...
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-md">
            <div className="grid grid-cols-12 px-6 py-3.5 border-b border-border font-mono text-xs font-bold text-slate-300 uppercase tracking-wider bg-surface-elevated">
              <div className="col-span-2 sm:col-span-1 text-center">POS</div>
              <div className="col-span-7 sm:col-span-8">ESTUDANTE & TÍTULO</div>
              <div className="col-span-3 text-right">XP / PONTOS</div>
            </div>

            <div className="divide-y divide-border">
              {ranking.map(user => {
                const isCurrentUser = usuario?.id === user.id;

                return (
                  <div
                    key={user.id}
                    className={`grid grid-cols-12 px-6 py-4 items-center transition-colors ${
                      isCurrentUser
                        ? 'bg-brand/10 border-l-4 border-brand'
                        : 'hover:bg-surface-elevated'
                    }`}
                  >
                    {/* Posição */}
                    <div className="col-span-2 sm:col-span-1 font-mono text-sm font-bold text-center">
                      {user.posicao === 1 ? (
                        <span className="text-amber-400 text-base">🥇 01</span>
                      ) : user.posicao === 2 ? (
                        <span className="text-slate-200">🥈 02</span>
                      ) : user.posicao === 3 ? (
                        <span className="text-amber-600">🥉 03</span>
                      ) : (
                        <span className="text-slate-400">{String(user.posicao).padStart(2, '0')}</span>
                      )}
                    </div>

                    {/* Aluno, Insígnia e Título */}
                    <div className="col-span-7 sm:col-span-8 flex items-center space-x-3.5">
                      <AvatarBadge avatarId={user.avatarId} size="sm" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-base text-white">
                            {user.nomeCompleto}
                          </span>
                          {isCurrentUser && (
                            <span className="text-[10px] font-mono font-bold bg-brand text-white px-2 py-0.5 rounded">
                              VOCÊ
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-brand font-medium block">
                          {user.titulo}
                        </span>
                      </div>
                    </div>

                    {/* Pontuação */}
                    <div className="col-span-3 text-right font-mono text-xs">
                      <div className="text-base font-bold text-white">
                        {user.experiencia} <span className="text-[11px] text-slate-400 font-normal">XP</span>
                      </div>
                      <span className="text-amber-400 font-semibold">
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
