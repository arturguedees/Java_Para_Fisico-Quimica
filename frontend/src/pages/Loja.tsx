import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Coins, Check, Lock, Sparkles, AlertCircle, Award, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import Navbar from '../components/Navbar';
import AvatarBadge, { AVATARES_CATALOGO, type AvatarDef } from '../components/AvatarBadge';

export default function Loja() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<any>(null);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem('usuario');
    if (!data) {
      navigate('/login');
    } else {
      const u = JSON.parse(data);
      setUsuario(u);
      axios.get(`http://localhost:8080/api/usuarios/${u.id}`)
        .then(res => {
          setUsuario(res.data);
          localStorage.setItem('usuario', JSON.stringify(res.data));
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
    if (usuario.pontos < avatar.preco) {
      setMensagem({ tipo: 'erro', texto: 'Pontos insuficientes! Resolva mais questões no banco de exercícios para acumular saldo.' });
      return;
    }
    if (nivelUsuario < avatar.nivelMinimo) {
      setMensagem({ tipo: 'erro', texto: `Requisito acadêmico: Nível ${avatar.nivelMinimo} de estudos necessário.` });
      return;
    }

    setProcessando(true);
    setMensagem(null);

    try {
      const res = await axios.post(
        `http://localhost:8080/api/usuarios/${usuario.id}/comprar-avatar?avatarId=${avatar.id}&preco=${avatar.preco}`
      );
      setUsuario(res.data);
      localStorage.setItem('usuario', JSON.stringify(res.data));

      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 }
      });

      setMensagem({ tipo: 'sucesso', texto: `Parabéns! A insígnia "${avatar.nome}" foi adquirida e equipada ao seu perfil!` });
    } catch (err: any) {
      const erroMsg = err.response?.data || 'Erro ao processar compra.';
      setMensagem({ tipo: 'erro', texto: typeof erroMsg === 'string' ? erroMsg : 'Falha na transação.' });
    } finally {
      setProcessando(false);
    }
  };

  const handleEquiparAvatar = async (avatarId: string) => {
    setProcessando(true);
    setMensagem(null);

    try {
      const res = await axios.post(
        `http://localhost:8080/api/usuarios/${usuario.id}/equipar-avatar?avatarId=${avatarId}`
      );
      setUsuario(res.data);
      localStorage.setItem('usuario', JSON.stringify(res.data));
      setMensagem({ tipo: 'sucesso', texto: 'Insígnia equipada com sucesso no seu perfil!' });
    } catch (err: any) {
      setMensagem({ tipo: 'erro', texto: 'Não foi possível equipar a insígnia.' });
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-800 pb-24 font-sans">
      <Navbar usuario={usuario} />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-6">
        
        {/* Cabeçalho */}
        <div className="quantum-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-md text-xs font-bold mb-1 border border-amber-200/60 shadow-2xs">
              <Award className="w-3.5 h-3.5" />
              <span>RECOMPENSAS & CONQUISTAS ACADÊMICAS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Loja de Insígnias Científicas
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Colecione os selos dos grandes pioneiros da físico-química e exiba no seu perfil.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs font-bold">
            <span className="px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl text-amber-800 flex items-center space-x-2 shadow-xs">
              <Coins className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
              <span>Saldo: <strong className="font-mono text-sm">{usuario.pontos} PTS</strong></span>
            </span>
            <span className="btn-quantum-primary px-4 py-2 rounded-xl shadow-xs">
              Nível {nivelUsuario}
            </span>
          </div>
        </div>

        {mensagem && (
          <div
            className={`p-4 rounded-2xl border text-sm font-bold flex items-center space-x-2.5 animate-slide-up ${
              mensagem.tipo === 'sucesso'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-950 shadow-sm'
                : 'border-rose-300 bg-rose-50 text-rose-950 shadow-sm'
            }`}
          >
            {mensagem.tipo === 'sucesso' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-bounce" /> : <AlertCircle className="w-5 h-5 text-rose-600 animate-pulse" />}
            <span>{mensagem.texto}</span>
          </div>
        )}

        {/* Grade do Catálogo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AVATARES_CATALOGO.map(avatar => {
            const desbloqueado = avataresDesbloqueadosSet.has(avatar.id);
            const equipado = usuario.avatarId === avatar.id;
            const nivelSuficiente = nivelUsuario >= avatar.nivelMinimo;
            const podeComprar = !desbloqueado && usuario.pontos >= avatar.preco && nivelSuficiente;

            return (
              <div
                key={avatar.id}
                className={`quantum-card rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 ${
                  equipado
                    ? 'border-indigo-500 ring-2 ring-indigo-200 shadow-md scale-102'
                    : desbloqueado
                    ? 'hover:border-indigo-300'
                    : 'opacity-95'
                }`}
              >
                <div className="space-y-4">
                  {/* Visualizador da Insígnia */}
                  <div className="h-40 bg-gradient-to-br from-slate-50 via-slate-50 to-indigo-50/30 rounded-2xl border border-slate-200/80 flex items-center justify-center relative overflow-hidden group">
                    <AvatarBadge avatarId={avatar.id} size="xl" />
                    
                    {equipado && (
                      <span className="absolute top-3 right-3 text-[11px] font-extrabold text-indigo-700 bg-indigo-100/90 px-3 py-1 rounded-full border border-indigo-200 shadow-2xs">
                        EM USO
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-indigo-600 font-bold uppercase tracking-wider">{avatar.subtitulo}</span>
                      <span className="text-amber-600 font-extrabold font-mono text-sm">
                        {avatar.preco === 0 ? 'GRÁTIS' : `${avatar.preco} PTS`}
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{avatar.nome}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      {avatar.descricao}
                    </p>
                  </div>
                </div>

                {/* Ações */}
                <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-bold">
                  {equipado ? (
                    <div className="py-3 bg-indigo-50 text-indigo-700 rounded-xl text-center font-extrabold border border-indigo-200/80">
                      EQUIPADA NO PERFIL
                    </div>
                  ) : desbloqueado ? (
                    <button
                      onClick={() => handleEquiparAvatar(avatar.id)}
                      disabled={processando}
                      className="w-full py-3 bg-white hover:bg-slate-100 text-slate-800 rounded-xl font-extrabold border border-slate-300 hover:border-slate-400 transition shadow-2xs hover:scale-101"
                    >
                      EQUIPAR INSÍGNIA
                    </button>
                  ) : (
                    <button
                      onClick={() => handleComprarAvatar(avatar)}
                      disabled={processando || !podeComprar}
                      className={`w-full py-3 rounded-xl transition font-extrabold uppercase tracking-wide shadow-xs ${
                        podeComprar
                          ? 'btn-quantum-primary hover:scale-101'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      }`}
                    >
                      {!nivelSuficiente
                        ? `EXIGE NÍVEL ${avatar.nivelMinimo}`
                        : usuario.pontos < avatar.preco
                        ? 'PONTOS INSUFICIENTES'
                        : 'DESBLOQUEAR INSÍGNIA'}
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
