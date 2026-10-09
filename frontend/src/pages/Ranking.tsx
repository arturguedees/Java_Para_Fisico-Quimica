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
    <div className="min-h-screen pb-24">
      <Navbar usuario={usuario} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 space-y-10">
        
        {/* Cabeçalho */}
        <div className="quantum-card bg-brand rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-neo border-4 border-dark">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-white border-4 border-dark text-dark flex items-center justify-center shadow-neo-sm transform hover:rotate-12 transition-all">
              <Trophy className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-dark text-white border-2 border-dark rounded-md text-xs font-black uppercase tracking-widest shadow-neo-sm">
                <span>CLASSIFICAÇÃO GERAL DOS ALUNOS</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-dark tracking-tighter uppercase font-display leading-tight">
                Ranking da Turma
              </h1>
            </div>
          </div>

          <div className="text-xs text-dark bg-white border-4 border-dark px-5 py-3 shadow-neo-sm font-black uppercase tracking-widest">
            Classificado por <strong className="text-dark font-black underline underline-offset-4 decoration-4">XP</strong>
          </div>
        </div>

        {/* Tabela do Ranking com Estilo Brutalista */}
        {loading ? (
          <div className="quantum-card bg-white border-4 border-dark shadow-neo rounded-3xl p-12 text-center text-sm text-dark font-black uppercase tracking-widest">
            <div className="w-12 h-12 border-4 border-dark border-t-brand rounded-full animate-spin mx-auto mb-4"></div>
            Calculando classificação geral...
          </div>
        ) : (
          <div className="bg-white border-4 border-dark rounded-3xl overflow-hidden shadow-neo">
            <div className="grid grid-cols-12 px-6 py-5 border-b-4 border-dark text-xs font-black text-dark uppercase tracking-widest bg-brand">
              <div className="col-span-2 sm:col-span-1 text-center">POS</div>
              <div className="col-span-7 sm:col-span-8">ESTUDANTE & TÍTULO</div>
              <div className="col-span-3 text-right">XP / MOEDAS</div>
            </div>

            <div className="divide-y-4 divide-dark">
              {ranking.map(user => {
                const isCurrentUser = usuario?.id === user.id;

                return (
                  <div
                    key={user.id}
                    className={`group grid grid-cols-12 px-6 py-5 items-center transition-all duration-300 ${
                      isCurrentUser
                        ? 'bg-yellow-300 shadow-[inset_8px_0_0_#191A23]'
                        : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    {/* Posição */}
                    <div className="col-span-2 sm:col-span-1 font-mono text-base font-black text-center text-dark flex items-center justify-center">
                      {user.posicao === 1 ? (
                        <div className="inline-flex items-center justify-center w-10 h-10 border-4 border-dark rounded-full bg-brand text-dark shadow-neo-sm transform group-hover:scale-110 transition-transform">
                          1º
                        </div>
                      ) : user.posicao === 2 ? (
                        <div className="inline-flex items-center justify-center w-10 h-10 border-4 border-dark rounded-full bg-slate-200 text-dark shadow-neo-sm transform group-hover:scale-110 transition-transform">
                          2º
                        </div>
                      ) : user.posicao === 3 ? (
                        <div className="inline-flex items-center justify-center w-10 h-10 border-4 border-dark rounded-full bg-orange-400 text-dark shadow-neo-sm transform group-hover:scale-110 transition-transform">
                          3º
                        </div>
                      ) : (
                        <span>{String(user.posicao).padStart(2, '0')}º</span>
                      )}
                    </div>

                    {/* Aluno, Insígnia e Título */}
                    <div className="col-span-7 sm:col-span-8 flex items-center space-x-4 pl-4 sm:pl-0">
                      <AvatarBadge avatarId={user.avatarId} size="sm" />
                      <div className="space-y-1">
                        <div className="flex items-center space-x-3">
                          <span className="font-black text-sm sm:text-base text-dark uppercase tracking-wide">
                            {user.nomeCompleto}
                          </span>
                          {isCurrentUser && (
                            <span className="text-[10px] font-black bg-dark text-white px-2.5 py-1 border-2 border-dark rounded-md shadow-neo-sm uppercase tracking-widest">
                              VOCÊ
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-dark/70 font-bold uppercase tracking-widest block">
                          {user.titulo}
                        </span>
                      </div>
                    </div>

                    {/* Pontuação */}
                    <div className="col-span-3 text-right text-xs">
                      <div className="text-lg sm:text-xl font-black text-dark font-mono flex items-end justify-end space-x-1">
                        <span>{user.experiencia}</span>
                        <span className="text-[10px] uppercase tracking-widest pb-1">XP</span>
                      </div>
                      <span className="text-dark font-bold font-mono text-xs">
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
