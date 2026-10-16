import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles, Activity, Atom, FlaskConical, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const response = await axios.post('http://localhost:8080/api/usuarios/login', { email, senha });
      localStorage.setItem('usuario', JSON.stringify(response.data));
      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'ERR_NETWORK' || !err.response) {
        setErro('O servidor do laboratório está temporariamente indisponível. Por favor, verifique se o servidor backend está iniciado ou tente novamente em instantes.');
      } else if (err.response.status === 404 || err.response.data === 'EMAIL_NAO_CADASTRADO') {
        setErro('Não encontramos uma conta com este e-mail. Por favor, crie sua conta para começar!');
      } else if (err.response.status === 401 || err.response.data === 'SENHA_INCORRETA') {
        setErro('E-mail ou senha incorretos. Por favor, confira suas credenciais e tente novamente.');
      } else {
        setErro('Não foi possível entrar no momento. Por favor, tente novamente em instantes.');
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
      {/* Elementos Decorativos Atmosféricos Fluidos */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand/35 rounded-full blur-3xl pointer-events-none animate-pulse-subtle"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-yellow-300/40 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" style={{ animationDelay: '1.5s' }}></div>

      {/* Badges Flutuantes com Fórmulas Físico-Químicas */}
      <div className="hidden xl:flex items-center space-x-2 absolute top-10 left-12 bg-white border-3 border-dark rounded-2xl px-4 py-2.5 shadow-neo rotate-[-3deg] animate-float z-0">
        <Activity className="w-5 h-5 text-dark stroke-[2.5]" />
        <span className="font-mono font-black text-xs text-dark tracking-wide">ΔG° = -RT ln(K)</span>
      </div>

      <div className="hidden xl:flex items-center space-x-2 absolute top-12 right-14 bg-yellow-300 border-3 border-dark rounded-2xl px-4 py-2.5 shadow-neo rotate-[3deg] animate-float z-0" style={{ animationDelay: '1.2s' }}>
        <Sparkles className="w-5 h-5 text-dark stroke-[2.5]" />
        <span className="font-mono font-black text-xs text-dark tracking-wide">[A] = [A]₀ · e⁻ᵏᵗ</span>
      </div>

      <div className="hidden xl:flex items-center space-x-2 absolute bottom-10 left-14 bg-brand border-3 border-dark rounded-2xl px-4 py-2.5 shadow-neo rotate-[4deg] animate-float z-0" style={{ animationDelay: '2s' }}>
        <Atom className="w-5 h-5 text-dark stroke-[2.5]" />
        <span className="font-mono font-black text-xs text-dark tracking-wide">v_rms = √(3RT/M)</span>
      </div>

      <div className="hidden xl:flex items-center space-x-2 absolute bottom-12 right-12 bg-white border-3 border-dark rounded-2xl px-4 py-2.5 shadow-neo rotate-[-2deg] animate-float z-0" style={{ animationDelay: '0.8s' }}>
        <FlaskConical className="w-5 h-5 text-dark stroke-[2.5]" />
        <span className="font-mono font-black text-xs text-dark tracking-wide">ΔH = ∫ ΔCp dT</span>
      </div>

      {/* Container Principal Expandido e Animado */}
      <div className="max-w-5xl lg:max-w-6xl w-full bg-white border-4 border-dark rounded-3xl shadow-[10px_10px_0px_0px_#191A23] hover:shadow-[12px_12px_0px_0px_#191A23] transition-all duration-300 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px] lg:min-h-[680px] animate-scale-in relative z-10">
        
        {/* Coluna Esquerda: Dark / Identidade & Recursos */}
        <div className="lg:col-span-5 bg-dark text-white p-8 sm:p-12 flex flex-col justify-between border-b-4 lg:border-b-0 lg:border-r-4 border-dark relative">
          <div className="space-y-8">
            {/* Logo do Sistema */}
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-white border-3 border-white rounded-2xl p-1.5 flex items-center justify-center shadow-neo-sm transform hover:rotate-12 transition-all duration-300">
                <img src="/logo.png" alt="Lab Quântico" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-2xl font-black uppercase tracking-tight font-display block leading-none text-white">
                  Lab Quântico
                </span>
                <span className="text-[11px] text-brand font-black uppercase tracking-widest block mt-1.5 bg-white/10 px-2 py-0.5 rounded border border-white/20">
                  Físico-Química Computacional
                </span>
              </div>
            </div>

            {/* Boas-Vindas */}
            <div className="space-y-4 pt-2">
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter font-display leading-[1.1] text-white">
                Bem-vindo de volta, Pesquisador!
              </h2>
              <p className="text-sm font-medium text-slate-300 leading-relaxed">
                Entre com suas credenciais para continuar suas investigações termodinâmicas, simulações cinéticas e pontuações na turma.
              </p>
            </div>

            {/* Destaques do Laboratório */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-3 text-xs font-bold text-slate-200 bg-white/5 border border-white/15 px-3.5 py-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-brand flex-shrink-0" />
                <span>Simulações Cinéticas em Tempo Real</span>
              </div>
              <div className="flex items-center space-x-3 text-xs font-bold text-slate-200 bg-white/5 border border-white/15 px-3.5 py-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-brand flex-shrink-0" />
                <span>Distribuição de Maxwell-Boltzmann dos Gases</span>
              </div>
              <div className="flex items-center space-x-3 text-xs font-bold text-slate-200 bg-white/5 border border-white/15 px-3.5 py-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-brand flex-shrink-0" />
                <span>Banco de Questões Gamificado com XP e Títulos</span>
              </div>
            </div>
          </div>

          <div className="pt-8 space-y-4">
            <Link
              to="/cadastro"
              className="w-full py-4 px-6 rounded-xl border-3 border-white hover:border-brand hover:bg-brand hover:text-dark text-white font-black text-xs uppercase tracking-widest text-center shadow-neo-sm hover:shadow-neo hover:-translate-y-1 transition-all duration-300 block"
            >
              Criar Nova Conta de Aluno
            </Link>
            <p className="text-[11px] text-slate-400 text-center font-bold uppercase tracking-wider">
              Plataforma Aberta de Aprendizagem Científica
            </p>
          </div>
        </div>

        {/* Coluna Direita: Formulário de Acesso */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-14 flex flex-col justify-between">
          <div>
            <div className="space-y-2 mb-8">
              <span className="text-xs font-black uppercase tracking-widest text-dark bg-brand px-3 py-1 border-2 border-dark rounded-md inline-block shadow-neo-sm">
                Autenticação Segura
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-dark tracking-tight uppercase font-display">
                Acesse sua conta
              </h1>
              <p className="text-sm text-dark/70 font-bold">
                Informe seu e-mail e senha cadastrados para entrar na plataforma.
              </p>
            </div>

            {erro && (
              <div className="mb-6 p-4 bg-rose-100 border-3 border-dark text-dark rounded-2xl text-xs font-bold flex items-start space-x-3 animate-slide-up shadow-neo-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 stroke-[2.5] mt-0.5" />
                <span className="leading-relaxed">{erro}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-dark block">
                  E-mail Acadêmico
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-dark/60 absolute left-4 top-4 stroke-[2]" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-3 border-dark rounded-xl text-base font-bold text-dark placeholder-dark/40 focus:outline-none focus:bg-white focus:ring-4 focus:ring-brand/40 focus:-translate-y-0.5 focus:shadow-neo transition-all duration-200 shadow-neo-sm"
                    placeholder="seu.email@exemplo.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-dark block">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-dark/60 absolute left-4 top-4 stroke-[2]" />
                  <input
                    type="password"
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-3 border-dark rounded-xl text-base font-bold text-dark placeholder-dark/40 focus:outline-none focus:bg-white focus:ring-4 focus:ring-brand/40 focus:-translate-y-0.5 focus:shadow-neo transition-all duration-200 shadow-neo-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={carregando}
                  className="w-full py-4.5 bg-dark text-white hover:bg-brand hover:text-dark rounded-xl font-black text-sm uppercase tracking-widest border-3 border-dark shadow-neo hover:shadow-neo-hover hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  <span>{carregando ? 'Validando Credenciais...' : 'Entrar no Laboratório'}</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </form>
          </div>

          <div className="pt-8 border-t-3 border-dark/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold text-dark/80">
            <span>Ainda não possui uma conta?</span>
            <Link to="/cadastro" className="text-dark font-black uppercase hover:underline underline-offset-4 flex items-center space-x-1">
              <span>Cadastre-se gratuitamente</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
