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
    <div className="min-h-screen bg-canvas text-slate-100 pb-24 font-sans">
      <Navbar usuario={usuario} />

      <main className="max-w-5xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        
        {/* Cartão de Perfil */}
        <section className="bg-surface border border-border rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-xl">
          <AvatarBadge avatarId={usuario.avatarId} size="2xl" />

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 font-mono text-xs">
              <span className="px-3 py-1 bg-surface-elevated border border-border rounded-full text-brand font-bold">
                {usuario.titulo}
              </span>
              <span className="px-3 py-1 bg-surface-elevated border border-border rounded-full text-slate-300">
                {usuario.experiencia} XP
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              {usuario.nomeCompleto}
            </h1>
            <p className="font-mono text-xs text-slate-400">
              {usuario.email}
            </p>
          </div>

          <div className="bg-surface-elevated border border-border rounded-xl p-4 text-center font-mono text-xs space-y-3 min-w-[160px]">
            <div>
              <span className="text-slate-400 block text-[11px]">SALDO DE PONTOS:</span>
              <span className="text-xl font-bold text-amber-400">{usuario.pontos} pts</span>
            </div>
            <Link
              to="/loja"
              className="block w-full py-2 bg-brand hover:bg-brand-hover text-white font-bold rounded-lg transition uppercase tracking-wider text-xs"
            >
              Ir à Loja
            </Link>
          </div>
        </section>

        {mensagem && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-sm font-semibold rounded-xl flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>{mensagem}</span>
          </div>
        )}

        {/* Títulos Desbloqueados */}
        <section className="bg-surface border border-border rounded-xl p-6 sm:p-8 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <Award className="w-6 h-6 text-brand" />
              <span>Seus Títulos Desbloqueados</span>
            </h2>
            <span className="font-mono text-xs text-slate-400">
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
                      ? 'border-brand bg-brand/10 text-white ring-1 ring-brand'
                      : 'border-border bg-surface-elevated text-slate-300 hover:text-white hover:border-border-light'
                  }`}
                >
                  <span className="font-bold text-sm sm:text-base">{tit}</span>

                  <span className="font-mono text-xs font-bold">
                    {ativo ? (
                      <span className="text-brand">ATIVO</span>
                    ) : (
                      <span className="text-slate-400 hover:text-white">EQUIPAR</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Coleção de Insígnias */}
        <section className="bg-surface border border-border rounded-xl p-6 sm:p-8 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <ShoppingBag className="w-6 h-6 text-amber-400" />
              <span>Suas Insígnias Desbloqueadas</span>
            </h2>
            <Link to="/loja" className="font-mono text-xs text-brand font-bold hover:underline flex items-center space-x-1">
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
                  className={`bg-surface-elevated border rounded-xl p-4 flex flex-col items-center text-center justify-between cursor-pointer transition ${
                    equipado
                      ? 'border-brand ring-1 ring-brand'
                      : 'border-border hover:border-border-light'
                  }`}
                >
                  <AvatarBadge avatarId={avatar.id} size="lg" />
                  <span className="font-bold text-sm text-white mt-3 block">{avatar.nome}</span>

                  <div className="mt-3 w-full font-mono text-xs font-bold">
                    {equipado ? (
                      <span className="block py-1 bg-brand text-white rounded">
                        EQUIPADA
                      </span>
                    ) : (
                      <span className="block py-1 bg-surface text-slate-300 hover:text-white rounded border border-border">
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
