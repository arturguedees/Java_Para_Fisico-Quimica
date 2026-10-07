import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Trophy, 
  Medal, 
  Sparkles, 
  Award, 
  Zap, 
  Coins,
  Crown
} from 'lucide-react';
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
      console.error('Erro ao buscar ranking:', err);
      setLoading(false);
    }
  };

  const getRankBadge = (posicao: number) => {
    switch (posicao) {
      case 1:
        return (
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/30">
            <Crown className="w-5 h-5" />
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-300 to-slate-400 flex items-center justify-center text-slate-950 font-bold shadow-md">
            2º
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-700 to-amber-600 flex items-center justify-center text-white font-bold shadow-md">
            3º
          </div>
        );
      default:
        return (
          <span className="text-sm font-bold text-slate-500 w-8 text-center">
            {posicao}º
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar usuario={usuario} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Hall da Fama Acadêmico</h1>
              <p className="text-xs text-slate-400">
                Classificação geral dos pesquisadores da Universidade Tiradentes por pontos de experiência
              </p>
            </div>
          </div>
        </div>

        {/* Tabela do Ranking */}
        {loading ? (
          <div className="text-center py-16 text-slate-500">Calculando posições do ranking...</div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="divide-y divide-slate-800/80">
              {ranking.map(user => {
                const isCurrentUser = usuario?.id === user.id;

                return (
                  <div
                    key={user.id}
                    className={`p-4 sm:p-5 flex items-center justify-between transition ${
                      isCurrentUser
                        ? 'bg-cyan-950/30 border-l-4 border-cyan-500'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Posição */}
                      <div className="flex items-center justify-center w-10">
                        {getRankBadge(user.posicao)}
                      </div>

                      {/* Avatar e Informações */}
                      <AvatarBadge avatarId={user.avatarId} size="md" />

                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                            <span>{user.nomeCompleto}</span>
                            {isCurrentUser && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                                Você
                              </span>
                            )}
                          </h3>
                        </div>
                        <span className="text-xs text-cyan-400 font-medium">
                          {user.titulo}
                        </span>
                      </div>
                    </div>

                    {/* Pontuação */}
                    <div className="flex items-center space-x-5 text-right">
                      <div>
                        <div className="flex items-center justify-end space-x-1 text-sm font-black text-white">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          <span>{user.experiencia} XP</span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {user.pontos} moedas
                        </span>
                      </div>
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
