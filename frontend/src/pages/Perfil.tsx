import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Award, ShoppingBag, Coins, Zap, CheckCircle, ArrowRight } from 'lucide-react';
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
      setMensagem(`Título "${titulo}" definido como ativo no seu perfil!`);
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
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 font-sans">
      <Navbar usuario={usuario} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        
        {/* Cartão de Perfil */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm">
          <AvatarBadge avatarId={usuario.avatarId} size="2xl" />

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
              <span className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 font-bold">
                {usuario.titulo}
              </span>
              <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-slate-700 font-medium">
                {usuario.experiencia} XP Total
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {usuario.nomeCompleto}
            </h1>
            <p className="text-sm text-slate-500">
              {usuario.email}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center text-xs space-y-2.5 min-w-[160px]">
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">SALDO DE PONTOS:</span>
              <span className="text-xl font-bold text-amber-600 font-mono">{usuario.pontos} pts</span>
            </div>
            <Link
              to="/loja"
              className="block w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition uppercase tracking-wider text-xs shadow-sm"
            >
              Ir à Loja
            </Link>
          </div>
        </section>

        {mensagem && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold rounded-xl flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>{mensagem}</span>
          </div>
        )}

        {/* Títulos Desbloqueados */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <Award className="w-5 h-5 text-blue-600" />
              <span>Seus Títulos Desbloqueados</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              {titulosDesbloqueados.length} conquistados
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {titulosDesbloqueados.map((tit: string) => {
              const ativo = usuario.titulo === tit;
              return (
                <div
                  key={tit}
                  onClick={() => !ativo && handleTrocarTitulo(tit)}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    ativo
                      ? 'border-blue-600 bg-blue-50/70 text-blue-950 ring-1 ring-blue-500'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span className="font-bold text-sm sm:text-base">{tit}</span>

                  <span className="text-xs font-bold">
                    {ativo ? (
                      <span className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">ATIVO</span>
                    ) : (
                      <span className="text-slate-500 hover:text-slate-900">EQUIPAR</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Coleção de Insígnias */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              <span>Suas Insígnias Desbloqueadas</span>
            </h2>
            <Link to="/loja" className="text-xs text-blue-600 font-bold hover:underline flex items-center space-x-1">
              <span>Ver Loja Completa</span>
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
                  className={`bg-slate-50 border rounded-xl p-4 flex flex-col items-center text-center justify-between cursor-pointer transition ${
                    equipado
                      ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-200'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <AvatarBadge avatarId={avatar.id} size="lg" />
                  <span className="font-bold text-sm text-slate-900 mt-3 block">{avatar.nome}</span>

                  <div className="mt-3 w-full text-xs font-bold">
                    {equipado ? (
                      <span className="block py-1 bg-blue-600 text-white rounded-lg">
                        EQUIPADA
                      </span>
                    ) : (
                      <span className="block py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg border border-slate-300">
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
