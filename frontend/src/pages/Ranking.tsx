import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Coins } from 'lucide-react';
import Navbar from '../components/Navbar';
import AvatarBadge from '../components/AvatarBadge';
import { obterRankingUsuariosApi, sanitizarUsuarioSemSenha } from '../services/api';
import { traduzirTitulo, useI18n } from '../i18n/i18n';

interface RankUser {
  posicao: number;
  id: number;
  nomeCompleto: string;
  titulo: string;
  avatarId: string;
  experiencia: number;
  pontos: number;
}

/**
 * Tela de Classificacao Geral (Ranking da Turma).
 *
 * Comentario de dev junior:
 * Essa pagina busca a lista de estudantes ordenada de forma decrescente por XP!
 * Se o aluno logado estiver na lista, destacamos a linha dele em amarelo com um badge "YOU / VOCE".
 * Os titulos academicos tambem sao traduzidos dinamicamente entre Ingles e Portugues!
 */
export default function Ranking() {
  const navigate = useNavigate();
  const { lang, isEn } = useI18n();
  const [usuario, setUsuario] = useState<any>(null);
  const [ranking, setRanking] = useState<RankUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = localStorage.getItem('usuario');
    if (!data) {
      navigate('/login');
    } else {
      setUsuario(sanitizarUsuarioSemSenha(JSON.parse(data)));
      carregarRanking();
    }
  }, [navigate]);

  const carregarRanking = async () => {
    try {
      const data = await obterRankingUsuariosApi();
      setRanking(data);
      setLoading(false);
    } catch (err) {
      console.error('Erro no ranking:', err);
      setLoading(false);
    }
  };

  const formatarOrdinal = (pos: number) => {
    if (!isEn) return `${pos}º`;
    if (pos === 1) return '1st';
    if (pos === 2) return '2nd';
    if (pos === 3) return '3rd';
    return `${pos}th`;
  };

  return (
    <div className="min-h-screen pb-24">
      <Navbar usuario={usuario} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 space-y-10">
        {/* Cabecalho */}
        <div className="quantum-card bg-brand rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-neo border-4 border-dark">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-white border-4 border-dark text-dark flex items-center justify-center shadow-neo-sm transform hover:rotate-12 transition-all">
              <Trophy className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-dark text-white border-2 border-dark rounded-md text-xs font-black uppercase tracking-widest shadow-neo-sm">
                <span>
                  {isEn ? 'OVERALL STUDENT LEADERBOARD' : 'CLASSIFICAÇÃO GERAL DOS ALUNOS'}
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-dark tracking-tighter uppercase font-display leading-tight">
                {isEn ? 'Class Leaderboard' : 'Ranking da Turma'}
              </h1>
            </div>
          </div>

          <div className="text-xs text-dark bg-white border-4 border-dark px-5 py-3 shadow-neo-sm font-black uppercase tracking-widest">
            {isEn ? 'Ranked by' : 'Classificado por'}{' '}
            <strong className="text-dark font-black underline underline-offset-4 decoration-4">
              XP
            </strong>
          </div>
        </div>

        {/* Tabela do Ranking com Estilo Brutalista */}
        {loading ? (
          <div className="quantum-card bg-white border-4 border-dark shadow-neo rounded-3xl p-12 text-center text-sm text-dark font-black uppercase tracking-widest">
            <div className="w-12 h-12 border-4 border-dark border-t-brand rounded-full animate-spin mx-auto mb-4"></div>
            {isEn ? 'Calculating overall leaderboard...' : 'Calculando classificação geral...'}
          </div>
        ) : (
          <div className="bg-white border-4 border-dark rounded-3xl overflow-hidden shadow-neo">
            <div className="grid grid-cols-12 px-6 py-5 border-b-4 border-dark text-xs font-black text-dark uppercase tracking-widest bg-brand">
              <div className="col-span-2 sm:col-span-1 text-center">POS</div>
              <div className="col-span-7 sm:col-span-8">
                {isEn ? 'STUDENT & TITLE' : 'ESTUDANTE & TÍTULO'}
              </div>
              <div className="col-span-3 text-right">
                {isEn ? 'XP / COINS' : 'XP / MOEDAS'}
              </div>
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
                    {/* Posicao */}
                    <div className="col-span-2 sm:col-span-1 font-mono text-base font-black text-center text-dark flex items-center justify-center">
                      {user.posicao === 1 ? (
                        <div className="inline-flex items-center justify-center w-10 h-10 border-4 border-dark rounded-full bg-brand text-dark shadow-neo-sm transform group-hover:scale-110 transition-transform text-xs">
                          {formatarOrdinal(1)}
                        </div>
                      ) : user.posicao === 2 ? (
                        <div className="inline-flex items-center justify-center w-10 h-10 border-4 border-dark rounded-full bg-slate-200 text-dark shadow-neo-sm transform group-hover:scale-110 transition-transform text-xs">
                          {formatarOrdinal(2)}
                        </div>
                      ) : user.posicao === 3 ? (
                        <div className="inline-flex items-center justify-center w-10 h-10 border-4 border-dark rounded-full bg-orange-400 text-dark shadow-neo-sm transform group-hover:scale-110 transition-transform text-xs">
                          {formatarOrdinal(3)}
                        </div>
                      ) : (
                        <span>
                          {isEn
                            ? formatarOrdinal(user.posicao)
                            : `${String(user.posicao).padStart(2, '0')}º`}
                        </span>
                      )}
                    </div>

                    {/* Aluno, Insignia e Titulo */}
                    <div className="col-span-7 sm:col-span-8 flex items-center space-x-4 pl-4 sm:pl-0">
                      <AvatarBadge avatarId={user.avatarId} size="sm" />
                      <div className="space-y-1">
                        <div className="flex items-center space-x-3">
                          <span className="font-black text-sm sm:text-base text-dark uppercase tracking-wide">
                            {user.nomeCompleto}
                          </span>
                          {isCurrentUser && (
                            <span className="text-[10px] font-black bg-dark text-white px-2.5 py-1 border-2 border-dark rounded-md shadow-neo-sm uppercase tracking-widest">
                              {isEn ? 'YOU' : 'VOCÊ'}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-dark/70 font-bold uppercase tracking-widest block">
                          {traduzirTitulo(user.titulo, lang)}
                        </span>
                      </div>
                    </div>

                    {/* Pontuacao com espacamento e badges dedicados */}
                    <div className="col-span-3 flex flex-col items-end justify-center space-y-1.5">
                      <div className="inline-flex items-center space-x-1.5 bg-dark text-white px-2.5 py-0.5 rounded-md border-2 border-dark text-xs font-mono font-black shadow-neo-sm">
                        <span>{user.experiencia}</span>
                        <span className="text-[10px] text-brand uppercase tracking-wider">XP</span>
                      </div>
                      <div className="inline-flex items-center space-x-1 bg-yellow-300 text-dark px-2 py-0.5 rounded-md border-2 border-dark text-[11px] font-mono font-black shadow-neo-sm">
                        <Coins className="w-3.5 h-3.5 text-dark fill-dark" />
                        <span>{user.pontos} pts</span>
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
