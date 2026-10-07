import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Award, ShoppingBag, Coins, Zap, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
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
      setMensagem(`Título "${titulo}" ativado com sucesso!`);
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
      setMensagem('Insígnia equipada com sucesso!');
    } catch (err) {
      console.error(err);
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-800 pb-24 font-sans">
      <Navbar usuario={usuario} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        
        {/* Cartão de Perfil Elevado */}
        <section className="quantum-card rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm">
          <AvatarBadge avatarId={usuario.avatarId} size="2xl" />

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-bold">
              <span className="px-3 py-1 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/80 rounded-full text-indigo-700 shadow-2xs">
                {usuario.titulo}
              </span>
              <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-slate-700">
                {usuario.experiencia} XP Total
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {usuario.nomeCompleto}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              {usuario.email}
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-indigo-100 rounded-2xl p-5 text-center text-xs space-y-3 min-w-[170px] shadow-xs">
            <div>
              <span className="text-slate-500 block text-[11px] font-bold uppercase tracking-wider">Saldo de Moedas</span>
              <span className="text-2xl font-extrabold text-amber-600 font-mono flex items-center justify-center space-x-1 mt-0.5">
                <Coins className="w-5 h-5 fill-amber-500 inline" />
                <span>{usuario.pontos}</span>
              </span>
            </div>
            <Link
              to="/loja"
              className="btn-quantum-primary block w-full py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs shadow-xs"
            >
              Ir à Loja
            </Link>
          </div>
        </section>

        {mensagem && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 text-sm font-bold rounded-2xl flex items-center space-x-2.5 animate-slide-up shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-bounce" />
            <span>{mensagem}</span>
          </div>
        )}

        {/* Títulos Desbloqueados */}
        <section className="quantum-card rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <span>Seus Títulos Desbloqueados</span>
            </h2>
            <span className="text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-full">
              {titulosDesbloqueados.length} conquistados
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {titulosDesbloqueados.map((tit: string) => {
              const ativo = usuario.titulo === tit;
              return (
                <div
                  key={tit}
                  onClick={() => !ativo && handleTrocarTitulo(tit)}
                  className={`p-4.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all duration-200 ${
                    ativo
                      ? 'border-indigo-600 bg-gradient-to-r from-indigo-50/90 to-blue-50/50 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span className="font-bold text-sm sm:text-base">{tit}</span>

                  <span className="text-xs font-extrabold">
                    {ativo ? (
                      <span className="text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full shadow-2xs">ATIVO</span>
                    ) : (
                      <span className="text-slate-400 hover:text-slate-800">EQUIPAR</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Coleção de Insígnias */}
        <section className="quantum-card rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              <span>Suas Insígnias Desbloqueadas</span>
            </h2>
            <Link to="/loja" className="text-xs text-indigo-600 font-extrabold hover:underline flex items-center space-x-1">
              <span>Explorar Mais Insígnias</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {AVATARES_CATALOGO.filter(a => avataresDesbloqueados.includes(a.id)).map(avatar => {
              const equipado = usuario.avatarId === avatar.id;

              return (
                <div
                  key={avatar.id}
                  onClick={() => !equipado && handleTrocarAvatar(avatar.id)}
                  className={`bg-white border rounded-2xl p-4 flex flex-col items-center text-center justify-between cursor-pointer transition-all duration-200 ${
                    equipado
                      ? 'border-indigo-500 ring-2 ring-indigo-200 shadow-md scale-102'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <AvatarBadge avatarId={avatar.id} size="lg" />
                  <span className="font-extrabold text-sm text-slate-900 mt-3 block">{avatar.nome}</span>

                  <div className="mt-3 w-full text-xs font-bold">
                    {equipado ? (
                      <span className="block py-1.5 bg-indigo-600 text-white rounded-xl shadow-2xs">
                        EQUIPADA
                      </span>
                    ) : (
                      <span className="block py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl border border-slate-200">
                        USAR
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
}
