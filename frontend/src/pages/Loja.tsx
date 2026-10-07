import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Coins, Check, Lock, Sparkles, AlertCircle, Award } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 font-sans">
      <Navbar usuario={usuario} />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-6">
        
        {/* Cabeçalho */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-md text-xs font-semibold mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>RECOMPENSAS & CONQUISTAS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Loja de Insígnias Científicas
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Troque os pontos obtidos em exercícios por selos de distinção acadêmica.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs font-semibold">
            <span className="px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-center space-x-1.5 shadow-sm">
              <Coins className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Saldo: <strong>{usuario.pontos} PTS</strong></span>
            </span>
            <span className="px-3.5 py-2 bg-blue-600 text-white rounded-xl shadow-sm">
              Nível {nivelUsuario}
            </span>
          </div>
        </div>

        {mensagem && (
          <div
            className={`p-4 rounded-xl border text-sm font-semibold flex items-center space-x-2 ${
              mensagem.tipo === 'sucesso'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : 'border-rose-200 bg-rose-50 text-rose-900'
            }`}
          >
            {mensagem.tipo === 'sucesso' ? <Sparkles className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
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
                className={`bg-white border rounded-2xl p-6 flex flex-col justify-between transition-all shadow-sm ${
                  equipado
                    ? 'border-blue-500 ring-2 ring-blue-100 shadow-md'
                    : desbloqueado
                    ? 'border-slate-200 hover:border-slate-300'
                    : 'border-slate-200 opacity-90'
                }`}
              >
                <div className="space-y-4">
                  {/* Visualizador da Insígnia */}
                  <div className="h-36 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center relative">
                    <AvatarBadge avatarId={avatar.id} size="xl" />
                    
                    {equipado && (
                      <span className="absolute top-2.5 right-2.5 text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200">
                        EQUIPADA
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-blue-700 font-bold uppercase">{avatar.subtitulo}</span>
                      <span className="text-amber-700 font-extrabold">
                        {avatar.preco === 0 ? 'GRÁTIS' : `${avatar.preco} PTS`}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{avatar.nome}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {avatar.descricao}
                    </p>
                  </div>
                </div>

                {/* Ações */}
                <div className="mt-6 pt-4 border-t border-slate-100 text-xs">
                  {equipado ? (
                    <div className="py-2.5 bg-blue-50 text-blue-700 rounded-xl text-center font-bold border border-blue-200">
                      EM USO NO PERFIL
                    </div>
                  ) : desbloqueado ? (
                    <button
                      onClick={() => handleEquiparAvatar(avatar.id)}
                      disabled={processando}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold border border-slate-300 transition"
                    >
                      EQUIPAR INSÍGNIA
                    </button>
                  ) : (
                    <button
                      onClick={() => handleComprarAvatar(avatar)}
                      disabled={processando || !podeComprar}
                      className={`w-full py-2.5 rounded-xl transition font-bold uppercase tracking-wide ${
                        podeComprar
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
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
