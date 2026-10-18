import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight, AlertCircle, Sparkles, Activity, Atom, FlaskConical, ShieldCheck } from 'lucide-react';
import { cadastrarUsuarioApi, sanitizarUsuarioSemSenha } from '../services/api';
import { LanguageSelector, useI18n } from '../i18n/i18n';

/**
 * Tela de Cadastro de novos estudantes.
 * Faz validacao de tamanho de senha e confirmacao antes de mandar pro backend,
 * alem de suportar Ingles (padrao) e Portugues!
 */
export default function Cadastro() {
  const navigate = useNavigate();
  const { isEn } = useI18n();
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    // Checa se as duas senhas digitadas sao iguais
    if (senha !== confirmarSenha) {
      setErro(
        isEn
          ? 'Passwords do not match. Please enter the exact same password in both fields.'
          : 'As senhas não coincidem. Por favor, confirme a mesma senha digitada.'
      );
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

    setCarregando(true);

    try {
      const userData = await cadastrarUsuarioApi(nomeCompleto, email, senha);
      localStorage.setItem('usuario', JSON.stringify(sanitizarUsuarioSemSenha(userData)));
      navigate('/dashboard');
    } catch (err: any) {
      const codigoErro = err.response?.data;
      if (codigoErro === 'EMAIL_JA_CADASTRADO' || codigoErro === 'Email já cadastrado!') {
        setErro(
          isEn
            ? 'This email is already registered! Try signing in instead.'
            : 'Este e-mail já está cadastrado! Tente fazer login na sua conta.'
        );
      } else if (typeof codigoErro === 'string' && codigoErro.trim()) {
        setErro(codigoErro);
      } else {
        setErro(
          isEn
            ? 'Could not complete your registration right now. Please try again.'
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
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand/35 rounded-full blur-3xl pointer-events-none animate-pulse-subtle"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-yellow-300/40 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" style={{ animationDelay: '1.5s' }}></div>

      {/* Formulas flutuantes de fundo */}
      <div className="hidden xl:flex items-center space-x-2 absolute top-10 left-12 bg-white border-3 border-dark rounded-2xl px-4 py-2.5 shadow-neo rotate-[-3deg] animate-float z-0">
        <Activity className="w-5 h-5 text-dark stroke-[2.5]" />
        <span className="font-mono font-black text-xs text-dark tracking-wide">k = A · e^(-Ea/RT)</span>
      </div>

      <div className="hidden xl:flex items-center space-x-2 absolute top-16 right-14 bg-yellow-300 border-3 border-dark rounded-2xl px-4 py-2.5 shadow-neo rotate-[3deg] animate-float z-0" style={{ animationDelay: '1.2s' }}>
        <Sparkles className="w-5 h-5 text-dark stroke-[2.5]" />
        <span className="font-mono font-black text-xs text-dark tracking-wide">t₁/₂ = ln(2) / k</span>
      </div>

      <div className="hidden xl:flex items-center space-x-2 absolute bottom-10 left-14 bg-brand border-3 border-dark rounded-2xl px-4 py-2.5 shadow-neo rotate-[4deg] animate-float z-0" style={{ animationDelay: '2s' }}>
        <Atom className="w-5 h-5 text-dark stroke-[2.5]" />
        <span className="font-mono font-black text-xs text-dark tracking-wide">PV = nRT</span>
      </div>

      <div className="hidden xl:flex items-center space-x-2 absolute bottom-12 right-12 bg-white border-3 border-dark rounded-2xl px-4 py-2.5 shadow-neo rotate-[-2deg] animate-float z-0" style={{ animationDelay: '0.8s' }}>
        <FlaskConical className="w-5 h-5 text-dark stroke-[2.5]" />
        <span className="font-mono font-black text-xs text-dark tracking-wide">c = √(γRT / M)</span>
      </div>

      {/* Container Principal */}
      <div className="max-w-5xl lg:max-w-6xl w-full bg-white border-4 border-dark rounded-3xl shadow-[10px_10px_0px_0px_#191A23] hover:shadow-[12px_12px_0px_0px_#191A23] transition-all duration-300 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[660px] lg:min-h-[720px] animate-scale-in relative z-10">
        
        {/* Coluna Esquerda: Boas-vindas */}
        <div className="lg:col-span-5 bg-dark text-white p-8 sm:p-12 flex flex-col justify-between border-b-4 lg:border-b-0 lg:border-r-4 border-dark relative">
          <div className="space-y-8">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-white border-3 border-white rounded-2xl p-1.5 flex items-center justify-center shadow-neo-sm transform hover:rotate-12 transition-all duration-300">
                <img src="/logo.png" alt="Quantum Lab" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-2xl font-black uppercase tracking-tight font-display block leading-none text-white">
                  {isEn ? 'Quantum Lab' : 'Lab Quântico'}
                </span>
                <span className="text-[11px] text-brand font-black uppercase tracking-widest block mt-1.5 bg-white/10 px-2 py-0.5 rounded border border-white/20">
                  {isEn ? 'Computational Physical Chemistry' : 'Físico-Química Computacional'}
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter font-display leading-[1.1] text-white">
                {isEn ? 'Start Your Scientific Journey!' : 'Inicie sua Jornada Científica!'}
              </h2>
              <p className="text-sm font-medium text-slate-300 leading-relaxed">
                {isEn
                  ? 'Create your academic profile to unlock interactive simulators, earn XP with real exercises, and compete on the class leaderboard.'
                  : 'Crie seu perfil acadêmico para desbloquear simuladores avançados, acumular XP com exercícios reais e competir no ranking da turma.'}
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
                    ? 'Unlock historical science badges & titles'
                    : 'Desbloqueio de insígnias históricas da ciência'}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-xs font-bold text-slate-200 bg-white/5 border border-white/15 px-3.5 py-2.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-brand flex-shrink-0" />
                <span>
                  {isEn
                    ? 'Full access to PDF lab reports and CSV exports'
                    : 'Acesso irrestrito a relatórios em PDF e CSV'}
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
              {isEn ? 'Free and Open Access for Students' : 'Acesso Gratuito e Aberto para Estudantes'}
            </p>
          </div>
        </div>

        {/* Coluna Direita: Formulario de Registro */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-14 flex flex-col justify-between">
          <div>
            <div className="space-y-2 mb-8">
              <span className="text-xs font-black uppercase tracking-widest text-dark bg-yellow-300 px-3 py-1 border-2 border-dark rounded-md inline-block shadow-neo-sm">
                {isEn ? 'New Registration' : 'Novo Registro'}
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-dark tracking-tight uppercase font-display">
                {isEn ? 'Create your account' : 'Crie sua conta'}
              </h1>
              <p className="text-sm text-dark/70 font-bold">
                {isEn
                  ? 'Fill in the fields below to create your scientist passport (+100 bonus coins!).'
                  : 'Preencha os campos abaixo para criar seu passaporte de cientista (+100 moedas de bônus!).'}
              </p>
            </div>

            {erro && (
              <div className="mb-6 p-4 bg-rose-100 border-3 border-dark text-dark rounded-2xl text-xs font-bold flex items-start space-x-3 animate-slide-up shadow-neo-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 stroke-[2.5] mt-0.5" />
                <span className="leading-relaxed">{erro}</span>
              </div>
            )}

            <form onSubmit={handleCadastro} className="space-y-5">
              {/* Nome Completo */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-dark block">
                  {isEn ? 'Full Name' : 'Nome Completo'}
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-dark/60 absolute left-4 top-4 stroke-[2]" />
                  <input
                    type="text"
                    value={nomeCompleto}
                    onChange={e => setNomeCompleto(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-3 border-dark rounded-xl text-base font-bold text-dark placeholder-dark/40 focus:outline-none focus:bg-white focus:ring-4 focus:ring-brand/40 focus:-translate-y-0.5 focus:shadow-neo transition-all duration-200 shadow-neo-sm"
                    placeholder={isEn ? 'Your full name' : 'Seu nome completo'}
                    required
                  />
                </div>
              </div>

              {/* E-mail */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-dark block">
                  {isEn ? 'Academic Email' : 'E-mail Acadêmico'}
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-dark/60 absolute left-4 top-4 stroke-[2]" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-3 border-dark rounded-xl text-base font-bold text-dark placeholder-dark/40 focus:outline-none focus:bg-white focus:ring-4 focus:ring-brand/40 focus:-translate-y-0.5 focus:shadow-neo transition-all duration-200 shadow-neo-sm"
                    placeholder={isEn ? 'your.email@university.edu' : 'seu.email@exemplo.com'}
                    required
                  />
                </div>
              </div>

              {/* Senha e Confirmacao */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-dark block">
                    {isEn ? 'Password' : 'Senha'}
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-dark/60 absolute left-4 top-4 stroke-[2]" />
                    <input
                      type="password"
                      value={senha}
                      onChange={e => setSenha(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-3 border-dark rounded-xl text-base font-bold text-dark placeholder-dark/40 focus:outline-none focus:bg-white focus:ring-4 focus:ring-brand/40 focus:-translate-y-0.5 focus:shadow-neo transition-all duration-200 shadow-neo-sm"
                      placeholder={isEn ? 'Min. 6 characters' : 'Mínimo 6 dígitos'}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-dark block">
                    {isEn ? 'Confirm Password' : 'Confirmar Senha'}
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-dark/60 absolute left-4 top-4 stroke-[2]" />
                    <input
                      type="password"
                      value={confirmarSenha}
                      onChange={e => setConfirmarSenha(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-3 border-dark rounded-xl text-base font-bold text-dark placeholder-dark/40 focus:outline-none focus:bg-white focus:ring-4 focus:ring-brand/40 focus:-translate-y-0.5 focus:shadow-neo transition-all duration-200 shadow-neo-sm"
                      placeholder={isEn ? 'Repeat password' : 'Repita a senha'}
                      required
                    />
                  </div>
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
                        ? 'Registering Student...'
                        : 'Registrando Estudante...'
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
            <span>{isEn ? 'Already registered?' : 'Já é cadastrado?'}</span>
            <Link to="/login" className="text-dark font-black uppercase hover:underline underline-offset-4 flex items-center space-x-1">
              <span>{isEn ? 'Sign in to your account' : 'Faça login na sua conta'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
