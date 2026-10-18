import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, Check, Lock, AlertCircle, Award, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import Navbar from '../components/Navbar';
import AvatarBadge, {
  AVATARES_CATALOGO,
  obterNomeAvatar,
  obterDescricaoAvatar,
  type AvatarDef,
} from '../components/AvatarBadge';
import {
  buscarPerfilUsuarioApi,
  comprarAvatarUsuarioApi,
  equiparAvatarUsuarioApi,
  sanitizarUsuarioSemSenha,
} from '../services/api';
import { useI18n } from '../i18n/i18n';

/**
 * Loja Gamificada de Insignias dos Pioneiros da Ciencia.
 *
 * Comentario de dev junior:
 * Aqui os estudantes trocam as moedas (pontos) conquistadas nos exercicios por insignias
 * inspiradas em grandes cientistas (Boltzmann, Marie Curie, Prigogine, Lavoisier, Schrodinger).
 * Cada insignia tem requisito de nivel e preco, e toda a loja funciona em Ingles e Portugues!
 */
export default function Loja() {
  const navigate = useNavigate();
  const { lang, isEn } = useI18n();
  const [usuario, setUsuario] = useState<any>(null);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem('usuario');
    if (!data) {
      navigate('/login');
    } else {
      const u = sanitizarUsuarioSemSenha(JSON.parse(data));
      setUsuario(u);
      buscarPerfilUsuarioApi(u.id)
        .then(resData => {
          const limpo = sanitizarUsuarioSemSenha(resData);
          setUsuario(limpo);
          localStorage.setItem('usuario', JSON.stringify(limpo));
        })
        .catch(() => {});
    }
  }, [navigate]);

  if (!usuario) return null;

  const avataresDesbloqueadosSet = new Set(
    usuario.avataresDesbloqueados ? usuario.avataresDesbloqueados.split(',') : ['avatar_default']
  );

  const xp = usuario.experiencia || 0;
  let nivelUsuario = 1;
  if (xp < 100) nivelUsuario = 1;
  else if (xp < 300) nivelUsuario = 2;
  else if (xp < 600) nivelUsuario = 3;
  else if (xp < 1000) nivelUsuario = 4;
  else if (xp < 1500) nivelUsuario = 5;
  else if (xp < 2500) nivelUsuario = 6;
  else nivelUsuario = 7;

  const handleComprarAvatar = async (avatar: AvatarDef) => {
    const nomeBadge = obterNomeAvatar(avatar, lang);

    if (usuario.pontos < avatar.preco) {
      setMensagem({
        tipo: 'erro',
        texto: isEn
          ? 'Insufficient coins! Solve more questions in the exercise bank to earn coins.'
          : 'Pontos insuficientes! Resolva mais questões no banco de exercícios para acumular saldo.',
      });
      return;
    }
    if (nivelUsuario < avatar.nivelMinimo) {
      setMensagem({
        tipo: 'erro',
        texto: isEn
          ? `Academic requirement: Study Level ${avatar.nivelMinimo} required.`
          : `Requisito acadêmico: Nível ${avatar.nivelMinimo} de estudos necessário.`,
      });
      return;
    }

    setProcessando(true);
    setMensagem(null);

    try {
      const atualizado = sanitizarUsuarioSemSenha(
        await comprarAvatarUsuarioApi(usuario.id, avatar.id, avatar.preco)
      );
      setUsuario(atualizado);
      localStorage.setItem('usuario', JSON.stringify(atualizado));

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      setMensagem({
        tipo: 'sucesso',
        texto: isEn
          ? `Congratulations! The "${nomeBadge}" badge was purchased and equipped to your profile!`
          : `Parabéns! A insígnia "${nomeBadge}" foi adquirida e equipada ao seu perfil!`,
      });
    } catch (err: any) {
      const erroMsg =
        err.response?.data ||
        err.message ||
        (isEn ? 'Error processing purchase.' : 'Erro ao processar compra.');
      setMensagem({
        tipo: 'erro',
        texto: typeof erroMsg === 'string' ? erroMsg : isEn ? 'Transaction failed.' : 'Falha na transação.',
      });
    } finally {
      setProcessando(false);
    }
  };

  const handleEquiparAvatar = async (avatarId: string) => {
    setProcessando(true);
    setMensagem(null);

    try {
      const atualizado = sanitizarUsuarioSemSenha(
        await equiparAvatarUsuarioApi(usuario.id, avatarId)
      );
      setUsuario(atualizado);
      localStorage.setItem('usuario', JSON.stringify(atualizado));
      setMensagem({
        tipo: 'sucesso',
        texto: isEn
          ? 'Badge successfully equipped to your profile!'
          : 'Insígnia equipada com sucesso no seu perfil!',
      });
    } catch (err: any) {
      setMensagem({
        tipo: 'erro',
        texto: isEn ? 'Could not equip the badge.' : 'Não foi possível equipar a insígnia.',
      });
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <Navbar usuario={usuario} />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 space-y-10">
        {/* Cabecalho */}
        <div className="quantum-card bg-brand rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-neo border-4 border-dark">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-white text-dark rounded-md text-xs font-black uppercase tracking-widest shadow-neo-sm border-2 border-dark">
              <Award className="w-4 h-4 stroke-[3]" />
              <span>{isEn ? 'REWARDS & ACHIEVEMENTS' : 'RECOMPENSAS & CONQUISTAS'}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-dark tracking-tighter uppercase font-display leading-none">
              {isEn ? 'Badge Shop' : 'Loja de Insígnias'}
            </h1>
            <p className="text-dark/80 text-lg font-bold">
              {isEn
                ? 'Collect pioneer badges and showcase them on your profile.'
                : 'Colecione os selos dos pioneiros e exiba no seu perfil.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs font-black uppercase tracking-widest">
            <div className="px-5 py-3 bg-yellow-300 border-4 border-dark rounded-xl text-dark flex items-center space-x-3 shadow-neo hover:-translate-y-1 transition-transform">
              <Coins className="w-6 h-6 text-dark fill-yellow-400 stroke-[2.5]" />
              <span className="text-base">
                {isEn ? 'Balance:' : 'Saldo:'}{' '}
                <strong className="font-mono text-xl">{usuario.pontos}</strong>
              </span>
            </div>
            <div className="px-5 py-4 bg-white border-4 border-dark rounded-xl text-dark shadow-neo">
              {isEn ? `LEVEL ${nivelUsuario}` : `NÍVEL ${nivelUsuario}`}
            </div>
          </div>
        </div>

        {mensagem && (
          <div
            className={`p-5 rounded-2xl border-4 text-base font-black flex items-center space-x-3 animate-slide-up uppercase tracking-wide ${
              mensagem.tipo === 'sucesso'
                ? 'border-dark bg-brand text-dark shadow-neo'
                : 'border-dark bg-rose-400 text-dark shadow-neo'
            }`}
          >
            {mensagem.tipo === 'sucesso' ? (
              <CheckCircle2 className="w-8 h-8 text-dark stroke-[3] animate-bounce" />
            ) : (
              <AlertCircle className="w-8 h-8 text-dark stroke-[3] animate-pulse" />
            )}
            <span>{mensagem.texto}</span>
          </div>
        )}

        {/* Grade do Catalogo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {AVATARES_CATALOGO.map(avatar => {
            const desbloqueado = avataresDesbloqueadosSet.has(avatar.id);
            const equipado = usuario.avatarId === avatar.id;
            const nivelSuficiente = nivelUsuario >= avatar.nivelMinimo;
            const podeComprar = !desbloqueado && usuario.pontos >= avatar.preco && nivelSuficiente;
            const nomeTraduzido = obterNomeAvatar(avatar, lang);
            const descricaoTraduzida = obterDescricaoAvatar(avatar, lang);

            return (
              <div
                key={avatar.id}
                className={`group border-4 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-500 ease-out ${
                  equipado
                    ? 'border-dark bg-yellow-100 shadow-neo hover:shadow-neo-hover hover:-translate-y-2'
                    : desbloqueado
                    ? 'border-dark bg-white shadow-neo hover:shadow-neo-hover hover:-translate-y-2'
                    : 'border-dark/20 bg-slate-50 opacity-90'
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-5">
                  {/* Badge & Lock */}
                  <div className="relative">
                    <div
                      className={`transition-transform duration-500 ${
                        desbloqueado
                          ? 'group-hover:scale-110 group-hover:rotate-6'
                          : 'grayscale opacity-50'
                      }`}
                    >
                      <AvatarBadge avatarId={avatar.id} size="xl" />
                    </div>
                    {!desbloqueado && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-dark text-white p-3 rounded-full border-2 border-dark shadow-neo-sm">
                          <Lock className="w-8 h-8 stroke-[2.5]" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-dark uppercase tracking-tight font-display">
                      {nomeTraduzido}
                    </h3>
                    <p className="text-sm font-bold text-dark/70 min-h-[40px] leading-relaxed">
                      {descricaoTraduzida}
                    </p>
                  </div>

                  {/* Requisitos (Nivel) */}
                  <div className="w-full pt-4 border-t-4 border-dark/10 flex justify-between items-center text-xs font-black uppercase tracking-widest">
                    <span className="text-dark">{isEn ? 'Requirement' : 'Requisito'}</span>
                    <span
                      className={`px-2.5 py-1 rounded-md border-2 shadow-neo-sm ${
                        nivelSuficiente
                          ? 'bg-brand text-dark border-dark'
                          : 'bg-rose-400 text-dark border-dark'
                      }`}
                    >
                      {isEn ? `Level ${avatar.nivelMinimo}` : `Nível ${avatar.nivelMinimo}`}
                    </span>
                  </div>
                </div>

                <div className="mt-8">
                  {equipado ? (
                    <button
                      disabled
                      className="w-full py-4 bg-dark text-white rounded-xl font-black text-sm uppercase tracking-widest border-4 border-dark shadow-neo flex items-center justify-center space-x-2"
                    >
                      <Check className="w-5 h-5 stroke-[3]" />
                      <span>{isEn ? 'Active Badge' : 'Insígnia Ativa'}</span>
                    </button>
                  ) : desbloqueado ? (
                    <button
                      onClick={() => handleEquiparAvatar(avatar.id)}
                      disabled={processando}
                      className="w-full py-4 bg-white hover:bg-brand text-dark rounded-xl font-black text-sm uppercase tracking-widest border-4 border-dark shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                    >
                      <span>{isEn ? 'Equip Now' : 'Equipar Agora'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleComprarAvatar(avatar)}
                      disabled={processando || !podeComprar}
                      className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest border-4 transition-all duration-300 flex items-center justify-center space-x-2 shadow-neo hover:-translate-y-1 ${
                        podeComprar
                          ? 'bg-yellow-300 hover:bg-yellow-400 text-dark border-dark hover:shadow-neo-hover cursor-pointer'
                          : 'bg-slate-200 text-dark/50 border-dark/20 cursor-not-allowed'
                      }`}
                    >
                      <Coins
                        className={`w-5 h-5 stroke-[2.5] ${
                          podeComprar ? 'fill-yellow-500 text-dark' : 'text-dark/50'
                        }`}
                      />
                      <span>
                        {!nivelSuficiente
                          ? isEn
                            ? `LEVEL ${avatar.nivelMinimo} REQUIRED`
                            : `NÍVEL ${avatar.nivelMinimo} EXIGIDO`
                          : usuario.pontos < avatar.preco
                          ? isEn
                            ? 'INSUFFICIENT COINS'
                            : 'PONTOS INSUFICIENTES'
                          : isEn
                          ? `Buy for ${avatar.preco}`
                          : `Comprar por ${avatar.preco}`}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
