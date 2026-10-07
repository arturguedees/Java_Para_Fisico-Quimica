import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Coins, Check, Lock, Sparkles, AlertCircle } from 'lucide-react';
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
      setMensagem({ tipo: 'erro', texto: 'Pontos insuficientes! Resolva mais exercícios para ganhar créditos.' });
      return;
    }
    if (nivelUsuario < avatar.nivelMinimo) {
      setMensagem({ tipo: 'erro', texto: `Requisito mínimo: Nível ${avatar.nivelMinimo} de estudos.` });
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
      setMensagem({ tipo: 'sucesso', texto: 'Insígnia equipada com sucesso!' });
    } catch (err: any) {
      setMensagem({ tipo: 'erro', texto: 'Não foi possível equipar a insígnia.' });
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-slate-100 pb-24 font-sans">
      <Navbar usuario={usuario} />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-6">
        
        {/* Cabeçalho */}
        <div className="bg-surface border border-border rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
          <div>
            <span className="text-xs font-mono font-bold text-amber-400 uppercase">RECOMPENSAS & CONQUISTAS</span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Loja de Insígnias Científicas
            </h1>
          </div>

          <div className="flex items-center space-x-3 font-mono text-xs">
            <span className="px-3.5 py-1.5 bg-surface-elevated border border-border rounded-lg text-slate-200">
              Seu Saldo: <strong className="text-amber-400 font-bold">{usuario.pontos} PTS</strong>
            </span>
            <span className="px-3.5 py-1.5 bg-brand text-white font-bold rounded-lg">
              Nível Atual: Nv. {nivelUsuario}
            </span>
          </div>
        </div>

        {mensagem && (
          <div
            className={`p-4 rounded-xl border text-sm font-semibold flex items-center space-x-2 ${
              mensagem.tipo === 'sucesso'
                ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                : 'border-rose-500/50 bg-rose-950/40 text-rose-300'
            }`}
          >
            {mensagem.tipo === 'sucesso' ? <Sparkles className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
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
                className={`bg-surface border rounded-xl p-6 flex flex-col justify-between transition-all shadow-md ${
                  equipado
                    ? 'border-brand ring-1 ring-brand'
                    : desbloqueado
                    ? 'border-border-light hover:border-slate-500'
                    : 'border-border opacity-90'
                }`}
              >
                <div className="space-y-4">
                  {/* Visualizador da Insígnia */}
                  <div className="h-36 bg-surface-elevated rounded-lg border border-border flex items-center justify-center relative">
                    <AvatarBadge avatarId={avatar.id} size="xl" />
                    
                    {equipado && (
                      <span className="absolute top-2.5 right-2.5 text-xs font-mono font-bold text-white bg-brand px-2 py-0.5 rounded">
                        EQUIPADA
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between font-mono text-xs">
                      <span className="text-brand font-bold">{avatar.subtitulo}</span>
                      <span className="text-amber-400 font-bold">
                        {avatar.preco === 0 ? 'GRÁTIS' : `${avatar.preco} PTS`}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-white">{avatar.nome}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {avatar.descricao}
                    </p>
                  </div>
                </div>

                {/* Ações */}
                <div className="mt-6 pt-4 border-t border-border font-mono text-xs">
                  {equipado ? (
                    <div className="py-2.5 bg-surface-elevated rounded-lg text-center text-brand font-bold border border-brand/40">
                      EM USO NO PERFIL
                    </div>
                  ) : desbloqueado ? (
                    <button
                      onClick={() => handleEquiparAvatar(avatar.id)}
                      disabled={processando}
                      className="w-full py-2.5 bg-surface-elevated hover:bg-surface-highlight text-white rounded-lg font-bold border border-border transition-colors"
                    >
                      EQUIPAR INSÍGNIA
                    </button>
                  ) : (
                    <button
                      onClick={() => handleComprarAvatar(avatar)}
                      disabled={processando || !podeComprar}
                      className={`w-full py-2.5 rounded-lg transition-colors font-bold uppercase tracking-wider ${
                        podeComprar
                          ? 'bg-brand hover:bg-brand-hover text-white shadow-md'
                          : 'bg-surface-elevated text-slate-500 cursor-not-allowed border border-border'
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
