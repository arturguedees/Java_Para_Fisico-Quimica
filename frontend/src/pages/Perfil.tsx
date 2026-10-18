import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Award,
  ShoppingBag,
  Coins,
  ArrowRight,
  User,
  Mail,
  Lock,
  Building2,
  FileText,
  Save,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import Navbar from '../components/Navbar';
import AvatarBadge, { AVATARES_CATALOGO, obterNomeAvatar } from '../components/AvatarBadge';
import {
  buscarPerfilUsuarioApi,
  equiparTituloUsuarioApi,
  equiparAvatarUsuarioApi,
  atualizarPerfilUsuarioApi,
  sanitizarUsuarioSemSenha,
} from '../services/api';
import { traduzirTitulo, useI18n } from '../i18n/i18n';
import { useNotificacao } from '../components/NotificacaoToast';

export default function Perfil() {
  const navigate = useNavigate();
  const { lang, isEn } = useI18n();
  const notificacao = useNotificacao();
  const [usuario, setUsuario] = useState<any>(null);

  // Form states for profile editing
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [instituicao, setInstituicao] = useState('');
  const [bio, setBio] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [senhaConfirmacao, setSenhaConfirmacao] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem('usuario');
    if (!data) {
      navigate('/login');
    } else {
      const u = sanitizarUsuarioSemSenha(JSON.parse(data));
      setUsuario(u);
      setNomeCompleto(u.nomeCompleto || '');
      setEmail(u.email || '');
      setInstituicao(u.instituicao || '');
      setBio(u.bio || '');

      buscarPerfilUsuarioApi(u.id)
        .then(resData => {
          const limpo = sanitizarUsuarioSemSenha(resData);
          setUsuario(limpo);
          setNomeCompleto(limpo.nomeCompleto || '');
          setEmail(limpo.email || '');
          setInstituicao(limpo.instituicao || '');
          setBio(limpo.bio || '');
          localStorage.setItem('usuario', JSON.stringify(limpo));
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

    const anterior = usuario.titulo;
    const provisorio = sanitizarUsuarioSemSenha({ ...usuario, titulo });
    setUsuario(provisorio);
    localStorage.setItem('usuario', JSON.stringify(provisorio));

    try {
      const atualizado = sanitizarUsuarioSemSenha(
        await equiparTituloUsuarioApi(usuario.id, titulo)
      );
      setUsuario(atualizado);
      localStorage.setItem('usuario', JSON.stringify(atualizado));
      notificacao.sucesso(
        isEn ? `Title equipped: ${traduzirTitulo(titulo, lang)}` : `Título equipado: ${traduzirTitulo(titulo, lang)}`
      );
    } catch (err) {
      console.error(err);
      setUsuario((prev: any) => ({ ...prev, titulo: anterior }));
      notificacao.erro(isEn ? 'Could not switch title' : 'Não foi possível alterar o título');
    }
  };

  const handleTrocarAvatar = async (avatarId: string) => {
    if (!usuario || usuario.avatarId === avatarId) return;

    const anterior = usuario.avatarId;
    const provisorio = sanitizarUsuarioSemSenha({ ...usuario, avatarId });
    setUsuario(provisorio);
    localStorage.setItem('usuario', JSON.stringify(provisorio));

    try {
      const atualizado = sanitizarUsuarioSemSenha(
        await equiparAvatarUsuarioApi(usuario.id, avatarId)
      );
      setUsuario(atualizado);
      localStorage.setItem('usuario', JSON.stringify(atualizado));
      notificacao.sucesso(
        isEn ? 'Badge equipped successfully!' : 'Insígnia equipada com sucesso!'
      );
    } catch (err) {
      console.error(err);
      setUsuario((prev: any) => ({ ...prev, avatarId: anterior }));
      notificacao.erro(isEn ? 'Could not equip badge' : 'Não foi possível equipar a insígnia');
    }
  };

  const handleSalvarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomeCompleto.trim()) {
      notificacao.aviso(isEn ? 'Full name cannot be blank.' : 'O nome completo não pode ficar em branco.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      notificacao.aviso(isEn ? 'Please enter a valid email address.' : 'Insira um e-mail válido.');
      return;
    }
    if (senhaNova) {
      if (senhaNova.length < 6) {
        notificacao.aviso(isEn ? 'New password must have at least 6 characters.' : 'A nova senha deve ter pelo menos 6 caracteres.');
        return;
      }
      if (senhaNova !== senhaConfirmacao) {
        notificacao.erro(isEn ? 'Passwords do not match.' : 'As senhas não coincidem.');
        return;
      }
    }

    setSalvando(true);
    try {
      const payload: any = {
        nomeCompleto: nomeCompleto.trim(),
        email: email.trim(),
        instituicao: instituicao.trim(),
        bio: bio.trim(),
      };
      if (senhaNova.trim()) {
        payload.senha = senhaNova.trim();
      }

      const atualizado = await atualizarPerfilUsuarioApi(usuario.id, payload);
      setUsuario(atualizado);
      setSenhaNova('');
      setSenhaConfirmacao('');
      notificacao.sucesso(
        isEn ? 'Profile updated successfully!' : 'Perfil atualizado com sucesso!'
      );
    } catch (err: any) {
      console.error(err);
      notificacao.erro(
        err.response?.data?.mensagem || (isEn ? 'Failed to update profile.' : 'Falha ao salvar alterações do perfil.')
      );
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 relative overflow-hidden">
      {/* Elementos visuais de fundo cientifico escuro (sem poluir a tela) */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-40" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />

      <Navbar usuario={usuario} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 space-y-10 relative z-10">
        
        {/* Cabecalho de Identidade Cientifica (Dark Lab Moderno) */}
        <section className="bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-slate-700">
          <div className="relative group">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-cyan-500 to-lime-400 shadow-lg">
              <AvatarBadge avatarId={usuario.avatarId} size="2xl" />
            </div>
            <Link
              to="/loja"
              className="absolute -bottom-2 -right-2 bg-slate-950 text-cyan-400 border border-slate-700 p-2 rounded-xl text-xs hover:bg-cyan-500 hover:text-slate-950 transition-colors shadow-lg"
              title={isEn ? 'Change badge' : 'Trocar insígnia'}
            >
              <Sparkles className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4 text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs font-bold uppercase tracking-wider">
              <span className="px-3.5 py-1.5 bg-cyan-500/15 border border-cyan-500/30 rounded-lg text-cyan-300 flex items-center space-x-1.5">
                <Award className="w-4 h-4" />
                <span>{traduzirTitulo(usuario.titulo, lang)}</span>
              </span>
              <span className="px-3.5 py-1.5 bg-lime-500/15 border border-lime-500/30 rounded-lg text-lime-300 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>{usuario.experiencia || 0} {isEn ? 'Total XP' : 'XP Total'}</span>
              </span>
              {usuario.instituicao && (
                <span className="px-3.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 flex items-center space-x-1.5">
                  <Building2 className="w-4 h-4" />
                  <span>{usuario.instituicao}</span>
                </span>
              )}
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
                {usuario.nomeCompleto}
              </h1>
              <p className="text-sm sm:text-base text-slate-400 mt-1 flex items-center justify-center md:justify-start space-x-2">
                <Mail className="w-4 h-4 text-slate-500" />
                <span>{usuario.email}</span>
              </p>
              {usuario.bio && (
                <p className="text-sm text-slate-300/80 italic mt-3 max-w-xl bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  "{usuario.bio}"
                </p>
              )}
            </div>
          </div>

          {/* Saldo de Moedas e Acesso a Loja */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 text-center space-y-4 min-w-[220px] shadow-xl">
            <div>
              <span className="text-slate-400 block text-xs font-bold uppercase tracking-widest mb-1.5">
                {isEn ? 'Quantum Coins' : 'Moedas Quânticas'}
              </span>
              <div className="text-4xl font-black text-amber-400 font-mono flex items-center justify-center space-x-2">
                <Coins className="w-8 h-8 text-amber-400 fill-amber-400" />
                <span>{usuario.pontos || 0}</span>
              </div>
            </div>
            <Link
              to="/loja"
              className="block w-full py-2.5 px-4 rounded-xl font-bold uppercase tracking-wider text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition-all shadow-md hover:shadow-amber-500/20"
            >
              {isEn ? 'Visit Shop' : 'Acessar Loja'}
            </Link>
          </div>
        </section>

        {/* Formulario de Personalizacao do Cadastro */}
        <section className="bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">
                {isEn ? 'Edit Account & Security' : 'Personalizar Cadastro & Segurança'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEn
                  ? 'Update your personal info, institution details, or change your password.'
                  : 'Atualize seus dados pessoais, instituição acadêmica ou altere sua senha de acesso.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSalvarPerfil} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Nome Completo */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span>{isEn ? 'Full Name' : 'Nome Completo'}</span>
                </label>
                <input
                  type="text"
                  value={nomeCompleto}
                  onChange={e => setNomeCompleto(e.target.value)}
                  required
                  placeholder={isEn ? 'Your full name' : 'Seu nome completo'}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <span>{isEn ? 'Email Address' : 'Endereço de E-mail'}</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="aluno@universidade.edu"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm transition-all"
                />
              </div>

              {/* Instituicao / Universidade */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <Building2 className="w-4 h-4 text-lime-400" />
                  <span>{isEn ? 'University / Institution' : 'Universidade / Instituição'}</span>
                </label>
                <input
                  type="text"
                  value={instituicao}
                  onChange={e => setInstituicao(e.target.value)}
                  placeholder={isEn ? 'e.g. Unit / UFPE / Sorbonne' : 'Ex: UNIT / UFPE / USP'}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 text-sm transition-all"
                />
              </div>

              {/* Bio / Linha de Pesquisa */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-lime-400" />
                  <span>{isEn ? 'Academic Bio / Research Area' : 'Bio / Linha de Pesquisa'}</span>
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder={isEn ? 'e.g. Physical Chemistry & Kinetics Enthusiast' : 'Ex: Entusiasta de Físico-Química e Termodinâmica'}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 text-sm transition-all"
                />
              </div>
            </div>

            {/* Secao de Redefinicao de Senha Segura */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>{isEn ? 'Change Password (Optional)' : 'Alterar Senha de Acesso (Opcional)'}</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isEn ? 'Leave empty if you do not want to change your password.' : 'Deixe em branco se não quiser alterar sua senha atual.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700"
                >
                  {mostrarSenha ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{mostrarSenha ? (isEn ? 'Hide' : 'Ocultar') : (isEn ? 'Show' : 'Mostrar')}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">{isEn ? 'New Password' : 'Nova Senha'}</label>
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={senhaNova}
                    onChange={e => setSenhaNova(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">{isEn ? 'Confirm New Password' : 'Confirmar Nova Senha'}</label>
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={senhaConfirmacao}
                    onChange={e => setSenhaConfirmacao(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={salvando}
                className="px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center space-x-2 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{salvando ? (isEn ? 'Saving...' : 'Salvando...') : (isEn ? 'Save Changes' : 'Salvar Alterações')}</span>
              </button>
            </div>
          </form>
        </section>

        {/* Titulos Desbloqueados */}
        <section className="bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-xl font-extrabold text-white flex items-center space-x-3">
              <Award className="w-6 h-6 text-cyan-400" />
              <span>{isEn ? 'Unlocked Academic Titles' : 'Títulos Acadêmicos Desbloqueados'}</span>
            </h2>
            <span className="text-xs font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 px-3 py-1.5 rounded-lg">
              {titulosDesbloqueados.length} {isEn ? 'earned' : 'conquistados'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {titulosDesbloqueados.map((tit: string) => {
              const ativo = usuario.titulo === tit;
              return (
                <div
                  key={tit}
                  onClick={() => !ativo && handleTrocarTitulo(tit)}
                  className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between cursor-pointer ${
                    ativo
                      ? 'border-cyan-500 bg-cyan-950/40 text-cyan-100 shadow-lg shadow-cyan-500/10'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <span className="font-bold text-sm">
                    {traduzirTitulo(tit, lang)}
                  </span>

                  <span className="text-xs font-bold">
                    {ativo ? (
                      <span className="text-cyan-950 bg-cyan-400 px-3 py-1 rounded-md flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isEn ? 'ACTIVE' : 'ATIVO'}</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 hover:text-slate-300">
                        {isEn ? 'EQUIP' : 'EQUIPAR'}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Colecao de Insignias Desbloqueadas */}
        <section className="bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
            <h2 className="text-xl font-extrabold text-white flex items-center space-x-3">
              <ShoppingBag className="w-6 h-6 text-lime-400" />
              <span>{isEn ? 'Unlocked Badges' : 'Insígnias Desbloqueadas'}</span>
            </h2>
            <Link
              to="/loja"
              className="text-xs font-bold text-slate-950 bg-lime-400 hover:bg-lime-300 px-4 py-2 rounded-xl transition-all flex items-center space-x-2 self-start sm:self-auto"
            >
              <span>{isEn ? 'Explore More in Shop' : 'Explorar Mais na Loja'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {AVATARES_CATALOGO.filter(a => avataresDesbloqueados.includes(a.id)).map(avatar => {
              const equipado = usuario.avatarId === avatar.id;

              return (
                <div
                  key={avatar.id}
                  onClick={() => !equipado && handleTrocarAvatar(avatar.id)}
                  className={`border rounded-2xl p-4 flex flex-col items-center text-center justify-between cursor-pointer transition-all duration-300 ${
                    equipado
                      ? 'border-lime-500 bg-lime-950/30 shadow-lg shadow-lime-500/10 scale-105'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="transform transition-transform duration-300 hover:scale-110">
                    <AvatarBadge avatarId={avatar.id} size="lg" />
                  </div>
                  <span className="font-bold text-xs text-slate-200 mt-3 block">
                    {obterNomeAvatar(avatar, lang)}
                  </span>

                  <div className="mt-3 w-full text-xs font-bold uppercase tracking-wider">
                    {equipado ? (
                      <span className="block py-1.5 bg-lime-400 text-slate-950 rounded-lg">
                        {isEn ? 'EQUIPPED' : 'EQUIPADA'}
                      </span>
                    ) : (
                      <span className="block py-1.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors">
                        {isEn ? 'USE' : 'USAR'}
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
