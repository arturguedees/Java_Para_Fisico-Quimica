import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
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
      setMensagem(`Patente "${titulo}" definida como ativa no dossier.`);
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
      setMensagem('Insígnia selecionada como principal.');
    } catch (err) {
      console.error(err);
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1013] text-[#e5e2dc] pb-24 font-sans">
      <Navbar usuario={usuario} />

      <main className="max-w-5xl mx-auto px-4 sm:px-8 pt-10 space-y-10">
        
        {/* Cartão de Identidade Editorial */}
        <section className="border border-[#1d2027] bg-[#14161b] p-6 sm:p-10 flex flex-col sm:flex-row items-center sm:items-start gap-8">
          <AvatarBadge avatarId={usuario.avatarId} size="2xl" />

          <div className="space-y-3 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 font-mono text-xs">
              <span className="px-2.5 py-1 bg-[#0e1013] border border-[#1d2027] text-[#c85a32]">
                DOSSIER DE PESQUISA
              </span>
              <span className="px-2.5 py-1 bg-[#0e1013] border border-[#1d2027] text-[#918b7e]">
                {usuario.experiencia} XP ACUMULADOS
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-[#faf9f5]">
              {usuario.nomeCompleto}
            </h1>
            <p className="font-serif italic text-base text-[#c85a32]">
              {usuario.titulo}
            </p>
            <p className="font-mono text-xs text-[#5e594d]">
              {usuario.email}
            </p>
          </div>

          <div className="border border-[#1d2027] bg-[#0e1013] p-4 text-center font-mono text-xs space-y-3 min-w-[160px]">
            <div>
              <span className="text-[#918b7e] block">SALDO ACADÊMICO:</span>
              <span className="text-xl font-bold text-[#faf9f5]">{usuario.pontos} PTS</span>
            </div>
            <Link
              to="/loja"
              className="block w-full py-1.5 bg-[#c85a32] hover:bg-[#a74521] text-[#faf9f5] font-bold transition-colors uppercase tracking-wider text-[10px]"
            >
              Ir ao Gabinete
            </Link>
          </div>
        </section>

        {mensagem && (
          <div className="p-3.5 border border-[#52754f] bg-[#52754f]/10 text-[#9ebd9c] font-mono text-xs">
            {mensagem}
          </div>
        )}

        {/* Patentes e Títulos */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-[#1d2027] pb-3">
            <h2 className="font-serif text-2xl text-[#faf9f5]">
              Patentes & Títulos Disponíveis
            </h2>
            <span className="font-mono text-xs text-[#918b7e]">
              {titulosDesbloqueados.length} CONQUISTADOS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {titulosDesbloqueados.map((tit: string) => {
              const ativo = usuario.titulo === tit;
              return (
                <div
                  key={tit}
                  onClick={() => !ativo && handleTrocarTitulo(tit)}
                  className={`p-4 border flex items-center justify-between cursor-pointer transition-colors ${
                    ativo
                      ? 'border-[#c85a32] bg-[#c85a32]/10'
                      : 'border-[#1d2027] bg-[#14161b] hover:border-[#2b303b]'
                  }`}
                >
                  <span className="font-serif text-base text-[#faf9f5]">{tit}</span>

                  <span className="font-mono text-xs">
                    {ativo ? (
                      <span className="text-[#c85a32] font-semibold">ATIVO</span>
                    ) : (
                      <span className="text-[#918b7e] hover:text-[#faf9f5]">EQUIPAR</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Acervo de Insígnias */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-[#1d2027] pb-3">
            <h2 className="font-serif text-2xl text-[#faf9f5]">
              Insígnias no Dossier
            </h2>
            <Link to="/loja" className="font-mono text-xs text-[#c85a32] hover:underline">
              ADQUIRIR NOVAS INSÍGNIAS →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {AVATARES_CATALOGO.filter(a => avataresDesbloqueados.includes(a.id)).map(avatar => {
              const equipado = usuario.avatarId === avatar.id;

              return (
                <div
                  key={avatar.id}
                  onClick={() => !equipado && handleTrocarAvatar(avatar.id)}
                  className={`border p-4 flex flex-col items-center text-center justify-between cursor-pointer transition-colors ${
                    equipado
                      ? 'border-[#c85a32] bg-[#c85a32]/5'
                      : 'border-[#1d2027] bg-[#14161b] hover:border-[#2b303b]'
                  }`}
                >
                  <AvatarBadge avatarId={avatar.id} size="lg" />
                  <span className="font-serif text-sm text-[#faf9f5] mt-3 block">{avatar.nome}</span>

                  <div className="mt-3 w-full font-mono text-[10px]">
                    {equipado ? (
                      <span className="block py-1 border border-[#c85a32] text-[#c85a32] font-semibold">
                        ATIVA
                      </span>
                    ) : (
                      <span className="block py-1 border border-[#1d2027] bg-[#0e1013] text-[#918b7e] hover:text-[#faf9f5]">
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
