import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ShoppingBag, 
  Coins, 
  Sparkles, 
  Check, 
  Lock, 
  Crown, 
  Award,
  AlertCircle
} from 'lucide-react';
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
      setMensagem({ tipo: 'erro', texto: 'Moedas insuficientes! Resolva mais exercícios para ganhar pontos.' });
      return;
    }
    if (nivelUsuario < avatar.nivelMinimo) {
      setMensagem({ tipo: 'erro', texto: `Este avatar requer Nível ${avatar.nivelMinimo} de pesquisador!` });
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
      setMensagem({ tipo: 'sucesso', texto: `Parabéns! Você adquiriu o avatar "${avatar.nome}" e ele já foi equipado!` });
    } catch (err: any) {
      const erroMsg = err.response?.data || 'Erro ao processar compra.';
      setMensagem({ tipo: 'erro', texto: typeof erroMsg === 'string' ? erroMsg : 'Erro ao comprar avatar.' });
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
      setMensagem({ tipo: 'sucesso', texto: 'Avatar equipado com sucesso no seu perfil!' });
    } catch (err: any) {
      setMensagem({ tipo: 'erro', texto: 'Não foi possível equipar o avatar.' });
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar usuario={usuario} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Loja de Avatares & Customizações</h1>
              <p className="text-xs text-slate-400">
                Adquira auras animadas e molduras exclusivas para se destacar na comunidade acadêmica
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900 border border-amber-500/30 px-4 py-2 rounded-2xl shadow-sm">
            <Coins className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="text-sm font-bold text-amber-300">
              Saldo: {usuario.pontos} <span className="text-xs font-normal text-amber-400/80">moedas</span>
            </span>
          </div>
        </div>

        {/* Notificação Toast */}
        {mensagem && (
          <div
            className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center space-x-2 ${
              mensagem.tipo === 'sucesso'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}
          >
            {mensagem.tipo === 'sucesso' ? <Sparkles className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{mensagem.texto}</span>
          </div>
        )}

        {/* Grade de Avatares */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {AVATARES_CATALOGO.map(avatar => {
            const desbloqueado = avataresDesbloqueadosSet.has(avatar.id);
            const equipado = usuario.avatarId === avatar.id;
            const nivelSuficiente = nivelUsuario >= avatar.nivelMinimo;
            const podeComprar = !desbloqueado && usuario.pontos >= avatar.preco && nivelSuficiente;

            return (
              <div
                key={avatar.id}
                className={`bg-slate-900 border rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 shadow-xl ${
                  equipado
                    ? 'border-cyan-500/60 ring-2 ring-cyan-500/20 shadow-cyan-500/10'
                    : desbloqueado
                    ? 'border-slate-700 hover:border-slate-600'
                    : 'border-slate-800 opacity-90'
                }`}
              >
                <div>
                  {/* Visualizador do Avatar Animado */}
                  <div className="h-44 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex flex-col items-center justify-center relative overflow-hidden mb-4">
                    <AvatarBadge avatarId={avatar.id} size="xl" showAnimation={true} />
                    
                    {equipado && (
                      <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Equipado
                      </span>
                    )}

                    {!desbloqueado && !nivelSuficiente && (
                      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-3 text-center">
                        <Lock className="w-7 h-7 text-slate-500 mb-1" />
                        <span className="text-xs font-bold text-slate-400">
                          Bloqueado até Nível {avatar.nivelMinimo}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Informações do Item */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-white">{avatar.nome}</h3>
                      <span className="text-xs font-bold text-amber-400 flex items-center space-x-1">
                        <Coins className="w-3.5 h-3.5" />
                        <span>{avatar.preco === 0 ? 'Grátis' : `${avatar.preco} pts`}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">
                      {avatar.descricao}
                    </p>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="mt-6 pt-4 border-t border-slate-800/80">
                  {equipado ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-cyan-400 border border-cyan-500/30 cursor-default flex items-center justify-center space-x-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Em Uso</span>
                    </button>
                  ) : desbloqueado ? (
                    <button
                      onClick={() => handleEquiparAvatar(avatar.id)}
                      disabled={processando}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 transition flex items-center justify-center space-x-1.5"
                    >
                      <span>Equipar Avatar</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleComprarAvatar(avatar)}
                      disabled={processando || !podeComprar}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                        podeComprar
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {!nivelSuficiente
                          ? `Requer Nível ${avatar.nivelMinimo}`
                          : usuario.pontos < avatar.preco
                          ? 'Moedas Insuficientes'
                          : 'Comprar & Equipar'}
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
