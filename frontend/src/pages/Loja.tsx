import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
      setMensagem({ tipo: 'erro', texto: 'Créditos insuficientes no dossier. Resolva novos problemas.' });
      return;
    }
    if (nivelUsuario < avatar.nivelMinimo) {
      setMensagem({ tipo: 'erro', texto: `Requisito mínimo: Nível ${avatar.nivelMinimo} de pesquisador.` });
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
      setMensagem({ tipo: 'sucesso', texto: `Insígnia "${avatar.nome}" outorgada e equipada ao seu dossier.` });
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
      setMensagem({ tipo: 'sucesso', texto: 'Insígnia selecionada como ativa no dossier.' });
    } catch (err: any) {
      setMensagem({ tipo: 'erro', texto: 'Não foi possível equipar a insígnia.' });
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1013] text-[#e5e2dc] pb-24 font-sans">
      <Navbar usuario={usuario} />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 space-y-8">
        
        {/* Cabeçalho */}
        <div className="border-b border-[#1d2027] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="font-mono text-xs text-[#c85a32] uppercase tracking-wider">
              GABINETE ACADÊMICO • ACERVO DE SELOS & INSÍGNIAS
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#faf9f5]">
              Insígnias & Credenciais de Pesquisa
            </h1>
          </div>

          <div className="flex items-center space-x-3 font-mono text-xs">
            <span className="px-3 py-1.5 bg-[#14161b] border border-[#1d2027] text-[#918b7e]">
              SEU SALDO: <strong className="text-[#c85a32]">{usuario.pontos} PTS</strong>
            </span>
            <span className="px-3 py-1.5 bg-[#14161b] border border-[#1d2027] text-[#faf9f5]">
              NÍVEL ATUAL: <strong>NV. {nivelUsuario}</strong>
            </span>
          </div>
        </div>

        {mensagem && (
          <div
            className={`p-4 border font-mono text-xs ${
              mensagem.tipo === 'sucesso'
                ? 'border-[#52754f] bg-[#52754f]/10 text-[#9ebd9c]'
                : 'border-[#853416] bg-[#853416]/10 text-[#f09673]'
            }`}
          >
            {mensagem.texto}
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
                className={`border bg-[#14161b] p-6 flex flex-col justify-between transition-colors ${
                  equipado
                    ? 'border-[#c85a32]'
                    : desbloqueado
                    ? 'border-[#2b303b]'
                    : 'border-[#1d2027] opacity-90'
                }`}
              >
                <div className="space-y-4">
                  {/* Visualizador da Insígnia */}
                  <div className="h-32 bg-[#0e1013] border border-[#1d2027] flex items-center justify-center relative">
                    <AvatarBadge avatarId={avatar.id} size="xl" />
                    
                    {equipado && (
                      <span className="absolute top-2 right-2 text-[10px] font-mono font-bold text-[#c85a32] border border-[#c85a32] px-2 py-0.5">
                        ATIVA
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between font-mono text-xs">
                      <span className="text-[#c85a32] font-semibold">{avatar.subtitulo}</span>
                      <span className="text-[#faf9f5]">
                        {avatar.preco === 0 ? 'CONCEDIDO' : `${avatar.preco} PTS`}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl text-[#faf9f5]">{avatar.nome}</h3>
                    <p className="text-xs text-[#918b7e] leading-relaxed">
                      {avatar.descricao}
                    </p>
                  </div>
                </div>

                {/* Ações */}
                <div className="mt-6 pt-4 border-t border-[#1d2027] font-mono text-xs">
                  {equipado ? (
                    <div className="py-2 border border-[#c85a32] text-center text-[#c85a32] font-bold">
                      INSÍGNIA EQUIPADA
                    </div>
                  ) : desbloqueado ? (
                    <button
                      onClick={() => handleEquiparAvatar(avatar.id)}
                      disabled={processando}
                      className="w-full py-2 border border-[#2b303b] bg-[#0e1013] hover:border-[#c85a32] text-[#faf9f5] transition-colors"
                    >
                      EQUIPAR NO DOSSIER
                    </button>
                  ) : (
                    <button
                      onClick={() => handleComprarAvatar(avatar)}
                      disabled={processando || !podeComprar}
                      className={`w-full py-2 border transition-colors uppercase tracking-wider font-bold ${
                        podeComprar
                          ? 'border-[#c85a32] bg-[#c85a32] hover:bg-[#a74521] text-[#faf9f5]'
                          : 'border-[#1d2027] bg-[#0e1013] text-[#5e594d] cursor-not-allowed'
                      }`}
                    >
                      {!nivelSuficiente
                        ? `EXIGE NÍVEL ${avatar.nivelMinimo}`
                        : usuario.pontos < avatar.preco
                        ? 'CRÉDITOS INSUFICIENTES'
                        : 'ADQUIRIR INSÍGNIA'}
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
