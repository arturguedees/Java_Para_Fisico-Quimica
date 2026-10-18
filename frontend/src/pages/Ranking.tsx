import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Coins,
  Users,
  Flame,
  PlusCircle,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  Share2,
  X
} from 'lucide-react';
import Navbar from '../components/Navbar';
import AvatarBadge from '../components/AvatarBadge';
import { obterRankingUsuariosApi, sanitizarUsuarioSemSenha } from '../services/api';
import { traduzirTitulo, useI18n } from '../i18n/i18n';
import { useNotificacao } from '../components/NotificacaoToast';

interface RankUser {
  posicao: number;
  id: number;
  nomeCompleto: string;
  titulo: string;
  avatarId: string;
  experiencia: number;
  pontos: number;
  turmaCodigo?: string;
  streakDias?: number;
}

interface Turma {
  codigo: string;
  nome: string;
  materia: string;
  criador: string;
  membrosIds: number[];
}

const TURMAS_INICIAIS: Turma[] = [
  {
    codigo: 'UNIT-FQ1',
    nome: 'Turma A - Físico-Química UNIT 2026',
    materia: 'Físico-Química & Termodinâmica',
    criador: 'Prof. Coordenador',
    membrosIds: [101, 102, 103, 104, 105],
  },
  {
    codigo: 'HEWL-LAB',
    nome: 'Squad Alpha - Biofísica da Lisozima',
    materia: 'Calorimetria DSC Avançada',
    criador: 'Marie Curie',
    membrosIds: [101, 103, 105],
  },
  {
    codigo: 'GASES-KINET',
    nome: 'Clube Maxwell - Cinética & Gases',
    materia: 'Modelagem de Distribuição e Velocidades',
    criador: 'Svante Arrhenius',
    membrosIds: [102, 104],
  },
];

export default function Ranking() {
  const navigate = useNavigate();
  const { lang, isEn } = useI18n();
  const notificacao = useNotificacao();
  const [usuario, setUsuario] = useState<any>(null);
  const [rankingGeral, setRankingGeral] = useState<RankUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Aba ativa: 'GERAL' ou 'TURMA' (estilo GymRats)
  const [abaAtiva, setAbaAtiva] = useState<'GERAL' | 'TURMA'>('GERAL');

  // Gerenciamento de Turmas (GymRats)
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmaSelecionadaCodigo, setTurmaSelecionadaCodigo] = useState<string>('UNIT-FQ1');
  const [modalCriarTurma, setModalCriarTurma] = useState(false);
  const [modalEntrarTurma, setModalEntrarTurma] = useState(false);

  // Form states
  const [novoNomeTurma, setNovoNomeTurma] = useState('');
  const [novaMateriaTurma, setNovaMateriaTurma] = useState('');
  const [codigoParaEntrar, setCodigoParaEntrar] = useState('');

  useEffect(() => {
    const data = localStorage.getItem('usuario');
    if (!data) {
      navigate('/login');
    } else {
      const u = sanitizarUsuarioSemSenha(JSON.parse(data));
      setUsuario(u);
      carregarRanking(u.id);
      carregarTurmas(u.id);
    }
  }, [navigate]);

  const carregarTurmas = (userId: number) => {
    try {
      const salvas = localStorage.getItem('lab_quantico_turmas_db');
      if (salvas) {
        const parsed: Turma[] = JSON.parse(salvas);
        // Garante que o usuario esteja ao menos na primeira turma padrão
        if (!parsed.some(t => t.membrosIds.includes(userId))) {
          if (parsed[0]) parsed[0].membrosIds.push(userId);
        }
        setTurmas(parsed);
      } else {
        const clonadas = [...TURMAS_INICIAIS];
        if (clonadas[0] && !clonadas[0].membrosIds.includes(userId)) {
          clonadas[0].membrosIds.push(userId);
        }
        localStorage.setItem('lab_quantico_turmas_db', JSON.stringify(clonadas));
        setTurmas(clonadas);
      }
    } catch {
      setTurmas(TURMAS_INICIAIS);
    }
  };

  const carregarRanking = async (currentUserId?: number) => {
    try {
      const data = await obterRankingUsuariosApi();
      // Atribui streaks simuladas realistas estilo GymRats
      const formatados: RankUser[] = data.map((u: any, idx: number) => ({
        ...u,
        streakDias: Math.max(1, 14 - idx * 2),
      }));
      setRankingGeral(formatados);
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

  const handleCriarTurma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNomeTurma.trim()) {
      notificacao.aviso(isEn ? 'Class name is required.' : 'O nome da turma é obrigatório.');
      return;
    }
    const novoCodigo = `${novoNomeTurma.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, 'FQ')}-${Math.floor(100 + Math.random() * 900)}`;
    const nova: Turma = {
      codigo: novoCodigo,
      nome: novoNomeTurma.trim(),
      materia: novaMateriaTurma.trim() || (isEn ? 'Physical Chemistry' : 'Físico-Química'),
      criador: usuario?.nomeCompleto || 'Aluno',
      membrosIds: usuario ? [usuario.id] : [101],
    };

    const atualizadas = [nova, ...turmas];
    setTurmas(atualizadas);
    localStorage.setItem('lab_quantico_turmas_db', JSON.stringify(atualizadas));
    setTurmaSelecionadaCodigo(novoCodigo);
    setNovoNomeTurma('');
    setNovaMateriaTurma('');
    setModalCriarTurma(false);
    notificacao.sucesso(
      isEn
        ? `Class "${nova.nome}" created! Share code: ${novoCodigo}`
        : `Turma "${nova.nome}" criada! Compartilhe o código: ${novoCodigo}`
    );
  };

  const handleEntrarTurma = (e: React.FormEvent) => {
    e.preventDefault();
    const codigoLimpo = codigoParaEntrar.trim().toUpperCase();
    if (!codigoLimpo) {
      notificacao.aviso(isEn ? 'Enter a valid class code.' : 'Insira um código de turma válido.');
      return;
    }

    const turmaAlvo = turmas.find(t => t.codigo.toUpperCase() === codigoLimpo);
    if (!turmaAlvo) {
      notificacao.erro(isEn ? 'Class code not found.' : 'Código de turma não encontrado.');
      return;
    }

    if (usuario && !turmaAlvo.membrosIds.includes(usuario.id)) {
      turmaAlvo.membrosIds.push(usuario.id);
      const atualizadas = [...turmas];
      setTurmas(atualizadas);
      localStorage.setItem('lab_quantico_turmas_db', JSON.stringify(atualizadas));
    }

    setTurmaSelecionadaCodigo(turmaAlvo.codigo);
    setCodigoParaEntrar('');
    setModalEntrarTurma(false);
    notificacao.sucesso(
      isEn
        ? `Joined class: ${turmaAlvo.nome}!`
        : `Você entrou na turma: ${turmaAlvo.nome}!`
    );
  };

  // Filtra estudantes da turma selecionada
  const turmaAtiva = turmas.find(t => t.codigo === turmaSelecionadaCodigo) || turmas[0];
  const rankingTurma: RankUser[] = turmaAtiva
    ? rankingGeral
        .filter(u => turmaAtiva.membrosIds.includes(u.id))
        .map((u, idx) => ({ ...u, posicao: idx + 1 }))
    : [];

  const pontuacaoTotalTurma = rankingTurma.reduce((acc, u) => acc + (u.pontos || 0), 0);

  return (
    <div className="min-h-screen pb-24">
      <Navbar usuario={usuario} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 space-y-10">
        
        {/* Cabecalho Principal */}
        <div className="quantum-card bg-brand rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-neo border-4 border-dark">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-white border-4 border-dark text-dark flex items-center justify-center shadow-neo-sm transform hover:rotate-6 transition-all rounded-2xl">
              <Trophy className="w-9 h-9 stroke-[2.5]" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-dark text-white border-2 border-dark rounded-md text-xs font-black uppercase tracking-widest shadow-neo-sm">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>
                  {isEn ? 'LEADERBOARDS & SQUADS' : 'RANKINGS & OFENSIVAS DE TURMA'}
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-dark tracking-tighter uppercase font-display leading-tight">
                {isEn ? 'Student Leaderboard' : 'Ranking dos Estudantes'}
              </h1>
            </div>
          </div>

          {/* Abas Alternadoras no Topo (Geral vs Turmas GymRats) */}
          <div className="flex items-center bg-white border-4 border-dark p-1.5 rounded-2xl shadow-neo-sm self-start md:self-auto">
            <button
              onClick={() => setAbaAtiva('GERAL')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                abaAtiva === 'GERAL'
                  ? 'bg-dark text-white shadow-neo-sm'
                  : 'text-dark hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center space-x-1.5">
                <Trophy className="w-4 h-4" />
                <span>{isEn ? 'Global Ranking' : 'Geral (Todos)'}</span>
              </span>
            </button>
            <button
              onClick={() => setAbaAtiva('TURMA')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                abaAtiva === 'TURMA'
                  ? 'bg-dark text-white shadow-neo-sm'
                  : 'text-dark hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center space-x-1.5">
                <Users className="w-4 h-4" />
                <span>{isEn ? 'Class Squads (GymRats)' : 'Turmas (GymRats)'}</span>
              </span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ABA 2: RANKING DE TURMA ESTILO GYMRATS (Item 12)                           */}
        {/* ========================================================================= */}
        {abaAtiva === 'TURMA' && (
          <div className="space-y-8 animate-fade-in">
            {/* Seletor de Turma e Botoes de Acao (Criar / Entrar) */}
            <div className="quantum-card bg-white p-6 sm:p-8 rounded-3xl border-4 border-dark shadow-neo space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-black uppercase tracking-widest text-dark/60">
                    {isEn ? 'CLASS SQUAD SELECTOR' : 'SELETOR DE TURMA / GRUPO'}
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={turmaSelecionadaCodigo}
                      onChange={e => setTurmaSelecionadaCodigo(e.target.value)}
                      className="px-4 py-2.5 bg-yellow-300 border-2 border-dark rounded-xl text-dark font-black text-sm uppercase tracking-wide shadow-neo-sm focus:outline-none cursor-pointer"
                    >
                      {turmas.map(t => (
                        <option key={t.codigo} value={t.codigo}>
                          {t.nome} ({t.codigo})
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(turmaAtiva?.codigo || '');
                        notificacao.sucesso(
                          isEn
                            ? `Class code copied: ${turmaAtiva?.codigo}`
                            : `Código da turma copiado: ${turmaAtiva?.codigo}`
                        );
                      }}
                      className="px-3.5 py-2.5 bg-white border-2 border-dark rounded-xl text-xs font-black uppercase tracking-wider text-dark shadow-neo-sm hover:bg-slate-100 flex items-center space-x-1.5"
                      title={isEn ? 'Copy invite code' : 'Copiar código de convite'}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{turmaAtiva?.codigo}</span>
                    </button>
                  </div>
                </div>

                {/* Botoes de Criar e Entrar */}
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setModalEntrarTurma(true)}
                    className="px-4 py-2.5 bg-white border-2 border-dark rounded-xl text-xs font-black uppercase tracking-wider text-dark shadow-neo-sm hover:bg-slate-100 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{isEn ? 'Join Code' : 'Entrar com Código'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalCriarTurma(true)}
                    className="btn-quantum-primary px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer shadow-neo-sm"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{isEn ? 'Create Squad' : 'Criar Turma'}</span>
                  </button>
                </div>
              </div>

              {/* Banner Informativo da Turma Ativa */}
              {turmaAtiva && (
                <div className="bg-slate-50 border-2 border-dark rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-dark uppercase font-display">
                      {turmaAtiva.nome}
                    </h2>
                    <p className="text-xs font-bold text-dark/70">
                      {isEn ? 'Course:' : 'Matéria:'} {turmaAtiva.materia} •{' '}
                      {isEn ? 'Created by:' : 'Criada por:'} {turmaAtiva.criador}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-black uppercase">
                    <div className="bg-white px-4 py-2 rounded-xl border-2 border-dark shadow-neo-sm text-center">
                      <span className="text-dark/60 block text-[10px]">{isEn ? 'MEMBERS' : 'ALUNOS'}</span>
                      <span className="text-base text-dark">{rankingTurma.length}</span>
                    </div>

                    <div className="bg-white px-4 py-2 rounded-xl border-2 border-dark shadow-neo-sm text-center">
                      <span className="text-dark/60 block text-[10px]">{isEn ? 'TOTAL COINS' : 'TOTAL DE MOEDAS'}</span>
                      <span className="text-base text-amber-500 font-mono flex items-center justify-center space-x-1">
                        <Coins className="w-4 h-4 fill-amber-400" />
                        <span>{pontuacaoTotalTurma}</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Podio GymRats Top 3 da Turma */}
            {rankingTurma.length >= 3 && (
              <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4">
                {/* 2o Lugar */}
                <div className="quantum-card bg-slate-100 p-4 sm:p-6 rounded-3xl border-4 border-dark shadow-neo flex flex-col items-center text-center justify-end transform hover:-translate-y-1 transition-all">
                  <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-dark font-black text-xs flex items-center justify-center mb-2">
                    2
                  </div>
                  <AvatarBadge avatarId={rankingTurma[1].avatarId} size="lg" />
                  <span className="font-black text-xs sm:text-sm text-dark mt-2 truncate max-w-full">
                    {rankingTurma[1].nomeCompleto.split(' ')[0]}
                  </span>
                  <div className="flex items-center space-x-1 text-xs font-black text-dark font-mono mt-1">
                    <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                    <span>{rankingTurma[1].streakDias || 7}d</span>
                  </div>
                  <span className="mt-2 px-2.5 py-1 bg-yellow-300 border border-dark rounded-md text-[11px] font-black text-dark font-mono">
                    {rankingTurma[1].pontos} pts
                  </span>
                </div>

                {/* 1o Lugar (Destaque Central) */}
                <div className="quantum-card bg-brand p-5 sm:p-7 rounded-3xl border-4 border-dark shadow-neo flex flex-col items-center text-center justify-end scale-105 transform hover:-translate-y-1 transition-all relative">
                  <div className="absolute -top-3 px-3 py-0.5 bg-dark text-white text-[10px] font-black uppercase rounded-full border-2 border-dark">
                    👑 {isEn ? 'LEADER' : 'LÍDER'}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-yellow-300 border-2 border-dark font-black text-sm flex items-center justify-center mb-2 shadow-neo-sm">
                    1
                  </div>
                  <AvatarBadge avatarId={rankingTurma[0].avatarId} size="xl" />
                  <span className="font-black text-sm sm:text-base text-dark mt-2 truncate max-w-full">
                    {rankingTurma[0].nomeCompleto.split(' ')[0]}
                  </span>
                  <div className="flex items-center space-x-1 text-xs font-black text-dark font-mono mt-1">
                    <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
                    <span>{rankingTurma[0].streakDias || 14}d {isEn ? 'streak' : 'ofensiva'}</span>
                  </div>
                  <span className="mt-2 px-3 py-1 bg-dark text-white border-2 border-dark rounded-md text-xs font-black font-mono shadow-neo-sm">
                    {rankingTurma[0].pontos} pts
                  </span>
                </div>

                {/* 3o Lugar */}
                <div className="quantum-card bg-orange-100 p-4 sm:p-6 rounded-3xl border-4 border-dark shadow-neo flex flex-col items-center text-center justify-end transform hover:-translate-y-1 transition-all">
                  <div className="w-8 h-8 rounded-full bg-orange-300 border-2 border-dark font-black text-xs flex items-center justify-center mb-2">
                    3
                  </div>
                  <AvatarBadge avatarId={rankingTurma[2].avatarId} size="lg" />
                  <span className="font-black text-xs sm:text-sm text-dark mt-2 truncate max-w-full">
                    {rankingTurma[2].nomeCompleto.split(' ')[0]}
                  </span>
                  <div className="flex items-center space-x-1 text-xs font-black text-dark font-mono mt-1">
                    <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                    <span>{rankingTurma[2].streakDias || 5}d</span>
                  </div>
                  <span className="mt-2 px-2.5 py-1 bg-yellow-300 border border-dark rounded-md text-[11px] font-black text-dark font-mono">
                    {rankingTurma[2].pontos} pts
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TABELA DE RANKING (Aba Geral ou Turma Filtrada)                          */}
        {/* ========================================================================= */}
        {loading ? (
          <div className="quantum-card bg-white border-4 border-dark shadow-neo rounded-3xl p-12 text-center text-sm text-dark font-black uppercase tracking-widest">
            <div className="w-12 h-12 border-4 border-dark border-t-brand rounded-full animate-spin mx-auto mb-4"></div>
            {isEn ? 'Calculating leaderboard...' : 'Calculando classificação...'}
          </div>
        ) : (
          <div className="bg-white border-4 border-dark rounded-3xl overflow-hidden shadow-neo">
            <div className="grid grid-cols-12 px-6 py-5 border-b-4 border-dark text-xs font-black text-dark uppercase tracking-widest bg-brand">
              <div className="col-span-2 sm:col-span-1 text-center">POS</div>
              <div className="col-span-6 sm:col-span-7">
                {isEn ? 'STUDENT & TITLE' : 'ESTUDANTE & TÍTULO'}
              </div>
              <div className="col-span-4 text-right">
                {isEn ? 'POINTS / OFENSIVA' : 'MOEDAS / OFENSIVA'}
              </div>
            </div>

            <div className="divide-y-4 divide-dark">
              {(abaAtiva === 'GERAL' ? rankingGeral : rankingTurma).map(user => {
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
                        <div className="inline-flex items-center justify-center w-10 h-10 border-4 border-dark rounded-full bg-brand text-dark shadow-neo-sm transform group-hover:scale-110 transition-transform text-xs font-black">
                          {formatarOrdinal(1)}
                        </div>
                      ) : user.posicao === 2 ? (
                        <div className="inline-flex items-center justify-center w-10 h-10 border-4 border-dark rounded-full bg-slate-200 text-dark shadow-neo-sm transform group-hover:scale-110 transition-transform text-xs font-black">
                          {formatarOrdinal(2)}
                        </div>
                      ) : user.posicao === 3 ? (
                        <div className="inline-flex items-center justify-center w-10 h-10 border-4 border-dark rounded-full bg-orange-400 text-dark shadow-neo-sm transform group-hover:scale-110 transition-transform text-xs font-black">
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
                    <div className="col-span-6 sm:col-span-7 flex items-center space-x-4 pl-3 sm:pl-0">
                      <AvatarBadge avatarId={user.avatarId} size="sm" />
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2.5">
                          <span className="font-black text-sm sm:text-base text-dark uppercase tracking-tight">
                            {user.nomeCompleto}
                          </span>
                          {isCurrentUser && (
                            <span className="text-[10px] font-black bg-dark text-white px-2 py-0.5 border-2 border-dark rounded-md shadow-neo-sm uppercase tracking-widest">
                              {isEn ? 'YOU' : 'VOCÊ'}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-dark/70 font-bold uppercase tracking-wider block">
                          {traduzirTitulo(user.titulo, lang)}
                        </span>
                      </div>
                    </div>

                    {/* Pontuacao & Ofensiva GymRats */}
                    <div className="col-span-4 flex flex-col items-end justify-center space-y-1.5">
                      <div className="inline-flex items-center space-x-1 bg-yellow-300 text-dark px-2.5 py-1 rounded-md border-2 border-dark text-xs font-mono font-black shadow-neo-sm">
                        <Coins className="w-3.5 h-3.5 text-dark fill-dark" />
                        <span>{user.pontos} pts</span>
                      </div>

                      <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-black text-orange-950 bg-orange-200 border border-orange-400">
                        <Flame className="w-3 h-3 text-orange-600 fill-orange-500" />
                        <span>{user.streakDias || 3}d {isEn ? 'streak' : 'ofensiva'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: CRIAR NOVA TURMA                                                   */}
        {/* ========================================================================= */}
        {modalCriarTurma && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-white border-4 border-dark rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-neo space-y-6 animate-slide-up">
              <div className="flex items-center justify-between border-b-2 border-dark pb-3">
                <h3 className="text-xl font-black text-dark uppercase font-display flex items-center space-x-2">
                  <PlusCircle className="w-6 h-6 text-brand" />
                  <span>{isEn ? 'Create Class Squad' : 'Criar Nova Turma'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setModalCriarTurma(false)}
                  className="p-1 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5 text-dark" />
                </button>
              </div>

              <form onSubmit={handleCriarTurma} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-dark">
                    {isEn ? 'Class / Group Name' : 'Nome da Turma / Grupo'}
                  </label>
                  <input
                    type="text"
                    required
                    value={novoNomeTurma}
                    onChange={e => setNovoNomeTurma(e.target.value)}
                    placeholder={isEn ? 'e.g. Unit Physical Chemistry 2026' : 'Ex: Turma B - Físico-Química UNIT'}
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-dark rounded-xl text-sm font-bold text-dark focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-dark">
                    {isEn ? 'Subject / Specialty' : 'Disciplina / Matéria'}
                  </label>
                  <input
                    type="text"
                    value={novaMateriaTurma}
                    onChange={e => setNovaMateriaTurma(e.target.value)}
                    placeholder={isEn ? 'e.g. Chemical Kinetics & DSC' : 'Ex: Cinética Química & Termodinâmica'}
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-dark rounded-xl text-sm font-bold text-dark focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalCriarTurma(false)}
                    className="px-4 py-2 text-xs font-black uppercase text-dark"
                  >
                    {isEn ? 'Cancel' : 'Cancelar'}
                  </button>
                  <button
                    type="submit"
                    className="btn-quantum-primary px-5 py-2.5 rounded-xl text-xs font-black uppercase shadow-neo-sm"
                  >
                    {isEn ? 'Create & Get Code' : 'Criar e Gerar Código'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: ENTRAR EM TURMA COM CODIGO                                         */}
        {/* ========================================================================= */}
        {modalEntrarTurma && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-white border-4 border-dark rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-neo space-y-6 animate-slide-up">
              <div className="flex items-center justify-between border-b-2 border-dark pb-3">
                <h3 className="text-xl font-black text-dark uppercase font-display flex items-center space-x-2">
                  <KeyRound className="w-6 h-6 text-brand" />
                  <span>{isEn ? 'Join with Class Code' : 'Entrar com Código'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setModalEntrarTurma(false)}
                  className="p-1 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5 text-dark" />
                </button>
              </div>

              <form onSubmit={handleEntrarTurma} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-dark">
                    {isEn ? 'Class Code' : 'Código de Acesso da Turma'}
                  </label>
                  <input
                    type="text"
                    required
                    value={codigoParaEntrar}
                    onChange={e => setCodigoParaEntrar(e.target.value.toUpperCase())}
                    placeholder="Ex: UNIT-FQ1 ou HEWL-LAB"
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-dark rounded-xl text-sm font-mono font-black text-dark uppercase tracking-wider focus:outline-none focus:border-brand"
                  />
                  <p className="text-[11px] text-dark/70 font-medium">
                    {isEn
                      ? 'Ask your instructor or classmate for the 8-character squad code.'
                      : 'Peça ao seu professor ou colega de turma o código de convite.'}
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalEntrarTurma(false)}
                    className="px-4 py-2 text-xs font-black uppercase text-dark"
                  >
                    {isEn ? 'Cancel' : 'Cancelar'}
                  </button>
                  <button
                    type="submit"
                    className="btn-quantum-primary px-5 py-2.5 rounded-xl text-xs font-black uppercase shadow-neo-sm"
                  >
                    {isEn ? 'Join Squad' : 'Entrar na Turma'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
