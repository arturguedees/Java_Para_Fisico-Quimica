import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles, Activity, Atom, FlaskConical, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { cadastrarUsuarioApi, sanitizarUsuarioSemSenha } from '../services/api';
import { LanguageSelector, useI18n } from '../i18n/i18n';
import { useNotificacao } from '../components/NotificacaoToast';

export default function Cadastro() {
  const navigate = useNavigate();
  const { isEn } = useI18n();
  const notificacao = useNotificacao();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Se o estudante ja estiver autenticado, vai direto pro Dashboard
  useEffect(() => {
    const salvo = localStorage.getItem('usuario');
    if (salvo) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    const emailLimpo = email.trim().toLowerCase();
    if (!emailLimpo || !emailLimpo.includes('@')) {
      setErro(isEn ? 'Please enter a valid email address.' : 'Por favor, insira um endereço de e-mail válido.');
      return;
    }

    if (senha.length < 6) {
      setErro(
        isEn
          ? 'Password must be at least 6 characters long for your security.'
          : 'A senha deve ter no mínimo 6 caracteres para sua segurança.'
      );
      return;
    }

    if (senha !== confirmarSenha) {
      setErro(
        isEn
          ? 'Passwords do not match. Please enter the same password in both fields.'
          : 'As senhas não coincidem. Por favor, confirme a mesma senha digitada.'
      );
      return;
    }

    setCarregando(true);

    try {
      // O nome e derivado automaticamente a partir do email para agilizar o cadastro
      const prefixo = emailLimpo.split('@')[0];
      const nomeDerivado = prefixo ? prefixo.charAt(0).toUpperCase() + prefixo.slice(1) : 'Estudante';

      const userData = await cadastrarUsuarioApi(nomeDerivado, emailLimpo, senha);
      const usuarioLimpo = sanitizarUsuarioSemSenha(userData);
      localStorage.setItem('usuario', JSON.stringify(usuarioLimpo));

      notificacao.sucesso(
        isEn ? `Welcome to LabQuântico, ${usuarioLimpo.nomeCompleto}!` : `Bem-vindo ao LabQuântico, ${usuarioLimpo.nomeCompleto}!`
      );

      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const codigoErro = err.response?.data;
      if (codigoErro === 'EMAIL_JA_CADASTRADO' || codigoErro === 'Email já cadastrado!') {
        setErro(
          isEn
            ? 'This email is already registered! Please sign in.'
            : 'Este e-mail já está cadastrado! Faça login na sua conta.'
        );
      } else if (typeof codigoErro === 'string' && codigoErro.trim()) {
        setErro(codigoErro);
      } else {
        setErro(
          isEn
            ? 'Could not complete registration right now. Please try again.'
            : 'Não foi possível concluir seu cadastro. Tente novamente em instantes.'
        );
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#F4FEE5] relative overflow-hidden flex items-center justify-center p-4 sm:p-8 font-sans"
      style={{
        backgroundImage: 'radial-gradient(#191A23 1.25px, transparent 1.25px)',
        backgroundSize: '28px 28px'
      }}
    >
      {/* Seletor de Idioma no topo da tela */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-8 z-50">
        <LanguageSelector />
      </div>

      {/* Luzes difusas decorativas */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand/35 rounded-full blur-3xl pointer-events-none transform-gpu"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-yellow-300/40 rounded-full blur-3xl pointer-events-none transform-gpu"></div>

      {/* Formulas flutuantes de fundo */}
      <div className="hidden xl:flex items-center space-x-2 absolute top-10 left-12 bg-white border-3 border-dark rounded-2xl px-4 py-2.5 shadow-neo rotate-[-3deg] z-0">
        <Activity className="w-5 h-5 text-dark stroke-[2.5]" />
        <span className="font-mono font-black text-xs text-dark tracking-wide">k = A · e^(-Ea/RT)</span>
      </div>

      <div className="hidden xl:flex items-center space-x-2 absolute top-16 right-14 bg-yellow-300 border-3 border-dark rounded-2xl px-4 py-2.5 shadow-neo rotate-[3deg] z-0">
        <Sparkles className="w-5 h-5 text-dark stroke-[2.5]" />
        <span className="font-mono font-black text-xs text-dark tracking-wide">t₁/₂ = ln(2) / k</span>
      </div>

      <div className="hidden xl:flex items-center space-x-2 absolute bottom-10 left-14 bg-brand border-3 border-dark rounded-2xl px-4 py-2.5 shadow-neo rotate-[4deg] z-0">
        <Atom className="w-5 h-5 text-dark stroke-[2.5]" />
        <span className="font-mono font-black text-xs text-dark tracking-wide">PV = nRT</span>
      </div>

      <div className="hidden xl:flex items-center space-x-2 absolute bottom-12 right-12 bg-white border-3 border-dark rounded-2xl px-4 py-2.5 shadow-neo rotate-[-2deg] z-0">
        <FlaskConical className="w-5 h-5 text-dark stroke-[2.5]" />
        <span className="font-mono font-black text-xs text-dark tracking-wide">c = √(γRT / M)</span>
      </div>

      {/* Container Principal */}
      <div className="max-w-5xl lg:max-w-6xl w-full bg-white border-4 border-dark rounded-3xl shadow-[10px_10px_0px_0px_#191A23] hover:shadow-[12px_12px_0px_0px_#191A23] transition-all duration-300 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px] lg:min-h-[680px] relative z-10">
        
        {/* Coluna Esquerda: Boas-vindas ao LabQuântico */}
        <div className="lg:col-span-5 bg-dark text-white p-8 sm:p-12 flex flex-col justify-between border-b-4 lg:border-b-0 lg:border-r-4 border-dark relative">
          <div className="space-y-8">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-white border-3 border-white rounded-2xl p-1.5 flex items-center justify-center shadow-neo-sm transform hover:rotate-12 transition-all duration-300">
                <img src="/logo.png" alt="LabQuântico" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-2xl font-black uppercase tracking-tight font-display block leading-none text-white">
                  LabQuântico
                </span>
                <span className="text-[11px] text-brand font-black uppercase tracking-widest block mt-1.5 bg-white/10 px-2 py-0.5 rounded border border-white/20">
                  {isEn ? 'Physical Chemistry for Students' : 'Físico-Química para Estudantes'}
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter font-display leading-[1.1] text-white">
                {isEn ? 'Start Studying with LabQuântico!' : 'Comece a Estudar com o LabQuântico!'}
              </h2>
              <p className="text-sm font-medium text-slate-300 leading-relaxed">
                {isEn
                  ? 'Create your free student account to explore interactive physical chemistry formulas, practice exercises with hints, and level up your understanding.'
                  : 'Crie sua conta gratuita de estudante para explorar simuladores interativos de físico-química, resolver exercícios práticos com dicas e turbinar seu aprendizado.'}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-3 text-xs font-bold text-slate-200 bg-white/5 border border-white/15 px-3.5 py-2.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-brand flex-shrink-0" />
                <span>
                  {isEn
                    ? 'Saves your progress and scores automatically'
                    : 'Salva seu progresso e notas automaticamente'}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-xs font-bold text-slate-200 bg-white/5 border border-white/15 px-3.5 py-2.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-brand flex-shrink-0" />
                <span>
                  {isEn
                    ? 'Unlock pioneer scientist badges & titles'
                    : 'Desbloqueio de insígnias e títulos de cientistas'}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-xs font-bold text-slate-200 bg-white/5 border border-white/15 px-3.5 py-2.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-brand flex-shrink-0" />
                <span>
                  {isEn
                    ? 'Free student access to calculators and simulators'
                    : 'Acesso 100% gratuito a calculadoras e simulações'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-8 space-y-4">
            <Link
              to="/login"
              className="w-full py-4 px-6 rounded-xl border-3 border-white hover:border-brand hover:bg-brand hover:text-dark text-white font-black text-xs uppercase tracking-widest text-center shadow-neo-sm hover:shadow-neo hover:-translate-y-1 transition-all duration-300 block"
            >
              {isEn ? 'I Already Have an Account' : 'Já Possuo uma Conta'}
            </Link>
            <p className="text-[11px] text-slate-400 text-center font-bold uppercase tracking-wider">
              {isEn ? 'Open and Free Platform for Students' : 'Plataforma Aberta e Gratuita para Estudantes'}
            </p>
          </div>
        </div>

        {/* Coluna Direita: Formulario de Registro Simplificado (Apenas E-mail e Senha) */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-14 flex flex-col justify-between">
          <div>
            <div className="space-y-2 mb-8">
              <span className="text-xs font-black uppercase tracking-widest text-dark bg-yellow-300 px-3 py-1 border-2 border-dark rounded-md inline-block shadow-neo-sm">
                {isEn ? 'Quick Registration' : 'Cadastro Rápido'}
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-dark tracking-tight uppercase font-display">
                {isEn ? 'Create your account' : 'Crie sua conta'}
              </h1>
              <p className="text-sm text-dark/70 font-bold">
                {isEn
                  ? 'Enter your email and a password to start practicing right away (+100 bonus coins!).'
                  : 'Digite apenas seu e-mail e uma senha para começar a praticar na hora (+100 moedas de bônus!).'}
              </p>
            </div>

            {erro && (
              <div className="mb-6 p-4 bg-rose-100 border-3 border-dark text-dark rounded-2xl text-xs font-bold flex items-start space-x-3 animate-slide-up shadow-neo-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 stroke-[2.5] mt-0.5" />
                <span className="leading-relaxed">{erro}</span>
              </div>
            )}

            <form onSubmit={handleCadastro} className="space-y-5">
              {/* E-mail (Apenas e-mail, sem nome academico) */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-dark block">
                  {isEn ? 'Email' : 'E-mail'}
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-dark/60 absolute left-4 top-4 stroke-[2]" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-3 border-dark rounded-xl text-base font-bold text-dark placeholder-dark/40 focus:outline-none focus:bg-white focus:ring-4 focus:ring-brand/40 focus:-translate-y-0.5 focus:shadow-neo transition-all duration-200 shadow-neo-sm"
                    placeholder="estudante@exemplo.com"
                    required
                  />
                </div>
              </div>

              {/* Senha com icone de olho para ver/ocultar senha */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-dark block">
                  {isEn ? 'Password' : 'Senha'}
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-dark/60 absolute left-4 top-4 stroke-[2]" />
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border-3 border-dark rounded-xl text-base font-bold text-dark placeholder-dark/40 focus:outline-none focus:bg-white focus:ring-4 focus:ring-brand/40 focus:-translate-y-0.5 focus:shadow-neo transition-all duration-200 shadow-neo-sm"
                    placeholder={isEn ? 'Min. 6 characters' : 'Mínimo 6 dígitos'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-4 top-4 text-dark/60 hover:text-dark focus:outline-none cursor-pointer"
                    title={mostrarSenha ? (isEn ? 'Hide password' : 'Ocultar senha') : (isEn ? 'Show password' : 'Ver senha')}
                  >
                    {mostrarSenha ? <EyeOff className="w-5 h-5 stroke-[2]" /> : <Eye className="w-5 h-5 stroke-[2]" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Senha com icone de olho */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-dark block">
                  {isEn ? 'Confirm Password' : 'Confirmar Senha'}
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-dark/60 absolute left-4 top-4 stroke-[2]" />
                  <input
                    type={mostrarConfirmarSenha ? 'text' : 'password'}
                    value={confirmarSenha}
                    onChange={e => setConfirmarSenha(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border-3 border-dark rounded-xl text-base font-bold text-dark placeholder-dark/40 focus:outline-none focus:bg-white focus:ring-4 focus:ring-brand/40 focus:-translate-y-0.5 focus:shadow-neo transition-all duration-200 shadow-neo-sm"
                    placeholder={isEn ? 'Repeat password' : 'Repita a senha'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                    className="absolute right-4 top-4 text-dark/60 hover:text-dark focus:outline-none cursor-pointer"
                    title={mostrarConfirmarSenha ? (isEn ? 'Hide password' : 'Ocultar senha') : (isEn ? 'Show password' : 'Ver senha')}
                  >
                    {mostrarConfirmarSenha ? <EyeOff className="w-5 h-5 stroke-[2]" /> : <Eye className="w-5 h-5 stroke-[2]" />}
                  </button>
                </div>
              </div>

              {/* Botao de Envio */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={carregando}
                  className="w-full py-4.5 bg-dark text-white hover:bg-brand hover:text-dark rounded-xl font-black text-sm uppercase tracking-widest border-3 border-dark shadow-neo hover:shadow-neo-hover hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  <span>
                    {carregando
                      ? isEn
                        ? 'Creating Account...'
                        : 'Criando Conta...'
                      : isEn
                      ? 'Create My Account'
                      : 'Criar Minha Conta'}
                  </span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </form>
          </div>

          <div className="pt-8 border-t-3 border-dark/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold text-dark/80">
            <span>{isEn ? 'Already have an account?' : 'Já possui uma conta?'}</span>
            <Link to="/login" className="text-dark font-black uppercase hover:underline underline-offset-4 flex items-center space-x-1">
              <span>{isEn ? 'Sign in here' : 'Faça login aqui'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
