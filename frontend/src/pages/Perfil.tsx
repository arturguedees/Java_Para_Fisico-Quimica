import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  User as UserIcon, 
  Award, 
  ShieldCheck, 
  ShoppingBag, 
  Coins, 
  Zap, 
  CheckCircle2,
  Sparkles,
  Check,
  ChevronRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import AvatarBadge, { AVATARES_CATALOGO } from '../components/AvatarBadge';

export default function Perfil() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<any>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
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

  const titulosDesbloqueados = usuario.titulosDesbloqueados
    ? usuario.titulosDesbloqueados.split(',').filter(Boolean)
    : ['Iniciante da Termodinâmica'];

  const avataresDesbloqueados = usuario.avataresDesbloqueados
    ? usuario.avataresDesbloqueados.split(',').filter(Boolean)
    : ['avatar_default'];

  const handleTrocarTitulo = async (titulo: string) => {
    setProcessando(true);
    setMensagem(null);
    try {
      const res = await axios.post(
        `http://localhost:8080/api/usuarios/${usuario.id}/equipar-titulo?titulo=${encodeURIComponent(titulo)}`
      );
      setUsuario(res.data);
      localStorage.setItem('usuario', JSON.stringify(res.data));
      setMensagem(`Título "${titulo}" equipado com sucesso!`);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessando(false);
    }
  };

  const handleTrocarAvatar = async (avatarId: string) => {
    setProcessando(true);
    setMensagem(null);
    try {
      const res = await axios.post(
        `http://localhost:8080/api/usuarios/${usuario.id}/equipar-avatar?avatarId=${avatarId}`
      );
      setUsuario(res.data);
      localStorage.setItem('usuario', JSON.stringify(res.data));
      setMensagem('Avatar equipado com sucesso!');
    } catch (err) {
      console.error(err);
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar usuario={usuario} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Cartão de Perfil Principal */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-2xl relative overflow-hidden">
          <AvatarBadge avatarId={usuario.avatarId} size="2xl" />

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {usuario.titulo}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {usuario.experiencia} XP Acumulados
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">{usuario.nomeCompleto}</h1>
            <p className="text-xs sm:text-sm text-slate-400 font-mono">{usuario.email}</p>
          </div>

          <div className="flex sm:flex-col items-center justify-center gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-sm">
              <Coins className="w-5 h-5 animate-pulse" />
              <span>{usuario.pontos} Moedas</span>
            </div>
            <Link
              to="/loja"
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-bold rounded-xl shadow-md transition"
            >
              Comprar Itens
            </Link>
          </div>
        </div>

        {mensagem && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-2xl flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{mensagem}</span>
          </div>
        )}

        {/* Títulos Desbloqueados */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Award className="w-5 h-5 text-cyan-400" />
              <span>Patentes & Títulos de Pesquisador</span>
            </h2>
            <span className="text-xs text-slate-400">
              {titulosDesbloqueados.length} desbloqueados
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {titulosDesbloqueados.map((tit: string) => {
              const ativo = usuario.titulo === tit;
              return (
                <div
                  key={tit}
                  onClick={() => !ativo && handleTrocarTitulo(tit)}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                    ativo
                      ? 'bg-cyan-950/30 border-cyan-500 text-white ring-1 ring-cyan-500/30'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Award className={`w-5 h-5 ${ativo ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="text-xs sm:text-sm font-bold">{tit}</span>
                  </div>

                  {ativo ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                      Ativo
                    </span>
                  ) : (
                    <span className="text-xs text-cyan-400 font-semibold hover:underline">
                      Equipar
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Coleção de Avatares Desbloqueados */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-purple-400" />
              <span>Seu Inventário de Avatares</span>
            </h2>
            <Link to="/loja" className="text-xs text-cyan-400 hover:underline flex items-center space-x-1">
              <span>Adquirir mais</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {AVATARES_CATALOGO.filter(a => avataresDesbloqueados.includes(a.id)).map(avatar => {
              const equipado = usuario.avatarId === avatar.id;

              return (
                <div
                  key={avatar.id}
                  onClick={() => !equipado && handleTrocarAvatar(avatar.id)}
                  className={`bg-slate-950/70 border rounded-2xl p-4 flex flex-col items-center text-center justify-between cursor-pointer transition ${
                    equipado
                      ? 'border-cyan-500 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <AvatarBadge avatarId={avatar.id} size="lg" />
                  <span className="text-xs font-bold text-white mt-3 block">{avatar.nome}</span>

                  <div className="mt-3 w-full">
                    {equipado ? (
                      <span className="block text-[10px] py-1 bg-cyan-500/20 text-cyan-300 rounded-lg font-bold border border-cyan-500/30">
                        Equipado
                      </span>
                    ) : (
                      <span className="block text-[10px] py-1 bg-slate-800 text-slate-300 hover:text-white rounded-lg font-semibold">
                        Usar
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}
