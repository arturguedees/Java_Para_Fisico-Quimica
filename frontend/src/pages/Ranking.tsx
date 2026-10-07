import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
    <div className="min-h-screen bg-[#0e1013] text-[#e5e2dc] pb-24 font-sans">
      <Navbar usuario={usuario} />

      <main className="max-w-5xl mx-auto px-4 sm:px-8 pt-10 space-y-8">
        
        {/* Cabeçalho */}
        <div className="border-b border-[#1d2027] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="font-mono text-xs text-[#c85a32] uppercase tracking-wider">
              REGISTRO ACADÊMICO • UNIVERSIDADE TIRADENTES
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#faf9f5]">
              Tábua de Honra dos Pesquisadores
            </h1>
          </div>

          <div className="font-mono text-xs text-[#918b7e]">
            CLASSIFICAÇÃO GERAL POR EXPERIÊNCIA (XP)
          </div>
        </div>

        {/* Tabela do Ranking */}
        {loading ? (
          <div className="font-mono text-xs text-[#918b7e] py-12 text-center">
            CALCULANDO LIVRO DE REGISTRO...
          </div>
        ) : (
          <div className="border border-[#1d2027] bg-[#14161b]">
            <div className="grid grid-cols-12 px-6 py-3 border-b border-[#1d2027] font-mono text-xs text-[#918b7e] uppercase tracking-wider">
              <div className="col-span-2 sm:col-span-1">POS</div>
              <div className="col-span-7 sm:col-span-8">PESQUISADOR & PATENTE</div>
              <div className="col-span-3 text-right">PONTUAÇÃO</div>
            </div>

            <div className="divide-y divide-[#1d2027]">
              {ranking.map(user => {
                const isCurrentUser = usuario?.id === user.id;

                return (
                  <div
                    key={user.id}
                    className={`grid grid-cols-12 px-6 py-4 items-center transition-colors ${
                      isCurrentUser
                        ? 'bg-[#c85a32]/5 border-l-2 border-[#c85a32]'
                        : 'hover:bg-[#16191f]'
                    }`}
                  >
                    {/* Posição */}
                    <div className="col-span-2 sm:col-span-1 font-mono text-sm font-semibold">
                      {user.posicao === 1 ? (
                        <span className="text-[#c85a32]">01º</span>
                      ) : (
                        <span className="text-[#918b7e]">{String(user.posicao).padStart(2, '0')}º</span>
                      )}
                    </div>

                    {/* Nome, Avatar e Título */}
                    <div className="col-span-7 sm:col-span-8 flex items-center space-x-3.5">
                      <AvatarBadge avatarId={user.avatarId} size="sm" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-serif text-base text-[#faf9f5]">
                            {user.nomeCompleto}
                          </span>
                          {isCurrentUser && (
                            <span className="text-[10px] font-mono border border-[#c85a32] text-[#c85a32] px-1.5 py-0.2">
                              VOCÊ
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-serif italic text-[#918b7e] block">
                          {user.titulo}
                        </span>
                      </div>
                    </div>

                    {/* Pontuação */}
                    <div className="col-span-3 text-right font-mono text-xs">
                      <div className="text-sm font-bold text-[#faf9f5]">
                        {user.experiencia} <span className="text-[10px] text-[#918b7e]">XP</span>
                      </div>
                      <span className="text-[11px] text-[#5e594d]">
                        {user.pontos} PTS
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
