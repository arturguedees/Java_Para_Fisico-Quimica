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
    if (!usuario || usuario.titulo === titulo) return;
    
    // Atualização otimista imediata para transição instantânea e suave
    const anterior = usuario.titulo;
    setUsuario((prev: any) => ({ ...prev, titulo }));
    localStorage.setItem('usuario', JSON.stringify({ ...usuario, titulo }));

    try {
      const res = await axios.post(
        `http://localhost:8080/api/usuarios/${usuario.id}/equipar-titulo?titulo=${encodeURIComponent(titulo)}`
      );
      setUsuario(res.data);
      localStorage.setItem('usuario', JSON.stringify(res.data));
    } catch (err) {
      console.error(err);
      setUsuario((prev: any) => ({ ...prev, titulo: anterior }));
    }
  };

  const handleTrocarAvatar = async (avatarId: string) => {
    if (!usuario || usuario.avatarId === avatarId) return;

    // Atualização otimista imediata
    const anterior = usuario.avatarId;
    setUsuario((prev: any) => ({ ...prev, avatarId }));
    localStorage.setItem('usuario', JSON.stringify({ ...usuario, avatarId }));

    try {
      const res = await axios.post(
        `http://localhost:8080/api/usuarios/${usuario.id}/equipar-avatar?avatarId=${avatarId}`
      );
      setUsuario(res.data);
      localStorage.setItem('usuario', JSON.stringify(res.data));
    } catch (err) {
      console.error(err);
      setUsuario((prev: any) => ({ ...prev, avatarId: anterior }));
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <Navbar usuario={usuario} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 space-y-10">
        
        {/* Cartão de Perfil Brutalista */}
        <section className="quantum-card bg-brand rounded-3xl p-6 sm:p-10 flex flex-col sm:flex-row items-center sm:items-start gap-8 shadow-neo border-4 border-dark transition-all duration-500 ease-in-out hover:shadow-neo-hover">
          <AvatarBadge avatarId={usuario.avatarId} size="2xl" />

          <div className="space-y-4 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs font-black uppercase tracking-widest">
              <span className="px-4 py-1.5 bg-white border-2 border-dark rounded-md text-dark shadow-neo-sm transform hover:scale-105 transition-transform duration-300">
                {usuario.titulo}
              </span>
              <span className="px-4 py-1.5 bg-dark border-2 border-dark rounded-md text-white shadow-neo-sm transform hover:scale-105 transition-transform duration-300">
                {usuario.experiencia} XP Total
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-dark tracking-tighter uppercase font-display leading-none">
              {usuario.nomeCompleto}
            </h1>
            <p className="text-lg text-dark/80 font-bold">
              {usuario.email}
            </p>
          </div>

          <div className="bg-white border-4 border-dark rounded-2xl p-6 text-center text-xs space-y-4 min-w-[200px] shadow-neo transform hover:-translate-y-1 transition-all duration-300">
            <div>
              <span className="text-dark block text-xs font-black uppercase tracking-widest mb-2">Saldo de Moedas</span>
              <span className="text-4xl font-black text-dark font-mono flex items-center justify-center space-x-2">
                <Coins className="w-8 h-8 text-yellow-400 fill-yellow-400 stroke-dark stroke-[2]" />
                <span>{usuario.pontos}</span>
              </span>
            </div>
            <Link
              to="/loja"
              className="btn-quantum-primary block w-full py-3 rounded-xl font-black uppercase tracking-widest text-sm shadow-neo hover:shadow-neo-hover"
            >
              Ir à Loja
            </Link>
          </div>
        </section>

        {/* Títulos Desbloqueados */}
        <section className="bg-white border-4 border-dark rounded-3xl p-6 sm:p-8 space-y-6 shadow-neo">
          <div className="flex items-center justify-between border-b-4 border-dark pb-4">
            <h2 className="text-2xl font-black text-dark flex items-center space-x-3 uppercase font-display">
              <Award className="w-8 h-8 text-dark stroke-[2.5]" />
              <span>Seus Títulos Desbloqueados</span>
            </h2>
            <span className="text-sm text-dark font-black bg-brand px-4 py-2 border-2 border-dark rounded-md shadow-neo-sm uppercase">
              {titulosDesbloqueados.length} conquistados
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {titulosDesbloqueados.map((tit: string) => {
              const ativo = usuario.titulo === tit;
              return (
                <div
                  key={tit}
                  onClick={() => !ativo && handleTrocarTitulo(tit)}
                  className={`p-5 rounded-2xl border-4 flex items-center justify-between cursor-pointer transition-all duration-300 uppercase tracking-wide ${
                    ativo
                      ? 'border-dark bg-dark text-white shadow-neo scale-[1.02]'
                      : 'border-dark bg-white text-dark hover:bg-brand hover:-translate-y-1 hover:shadow-neo'
                  }`}
                >
                  <span className="font-black text-sm sm:text-base">{tit}</span>

                  <span className="text-xs font-black">
                    {ativo ? (
                      <span className="text-dark bg-brand px-3 py-1.5 border-2 border-dark rounded-md shadow-neo-sm">ATIVO</span>
                    ) : (
                      <span className="text-dark/50 hover:text-dark">EQUIPAR</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Coleção de Insígnias */}
        <section className="bg-white border-4 border-dark rounded-3xl p-6 sm:p-10 space-y-6 shadow-neo">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-4 border-dark pb-4 gap-4">
            <h2 className="text-2xl font-black text-dark flex items-center space-x-3 uppercase font-display">
              <ShoppingBag className="w-8 h-8 text-dark stroke-[2.5]" />
              <span>Suas Insígnias Desbloqueadas</span>
            </h2>
            <Link to="/loja" className="text-sm text-dark font-black bg-yellow-300 hover:bg-brand border-2 border-dark px-4 py-2 shadow-neo-sm hover:shadow-neo rounded-md transition-all uppercase flex items-center space-x-2">
              <span>Explorar Mais</span>
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {AVATARES_CATALOGO.filter(a => avataresDesbloqueados.includes(a.id)).map(avatar => {
              const equipado = usuario.avatarId === avatar.id;

              return (
                <div
                  key={avatar.id}
                  onClick={() => !equipado && handleTrocarAvatar(avatar.id)}
                  className={`bg-white border-4 rounded-2xl p-5 flex flex-col items-center text-center justify-between cursor-pointer transition-all duration-500 ease-out group ${
                    equipado
                      ? 'border-dark shadow-neo scale-105 bg-yellow-100'
                      : 'border-dark hover:shadow-neo-hover hover:-translate-y-2 hover:bg-slate-50'
                  }`}
                >
                  <div className="transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <AvatarBadge avatarId={avatar.id} size="lg" />
                  </div>
                  <span className="font-black text-sm text-dark mt-4 block uppercase tracking-tight">{avatar.nome}</span>

                  <div className="mt-4 w-full text-xs font-black uppercase tracking-widest">
                    {equipado ? (
                      <span className="block py-2 bg-dark text-white rounded-md border-2 border-dark shadow-neo-sm">
                        EQUIPADA
                      </span>
                    ) : (
                      <span className="block py-2 bg-white text-dark hover:bg-brand rounded-md border-2 border-dark transition-colors duration-300">
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
