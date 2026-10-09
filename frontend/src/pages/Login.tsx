import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-8 font-sans">
      <div className="max-w-4xl w-full bg-white border-4 border-dark rounded-3xl shadow-neo overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[540px]">
        
        {/* Coluna Esquerda: Dark / Identidade do Sistema */}
        <div className="md:col-span-5 bg-dark text-white p-8 sm:p-10 flex flex-col justify-between border-b-4 md:border-b-0 md:border-r-4 border-dark relative">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white border-2 border-white rounded-xl p-1 flex items-center justify-center">
                <img src="/logo.png" alt="Lab Quântico" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-xl font-black uppercase tracking-tight font-display block leading-none text-white">
                  Lab Quântico
                </span>
                <span className="text-[10px] text-brand font-bold uppercase tracking-widest block mt-1">
                  Físico-Química
                </span>
              </div>
            </div>

            <div className="pt-6 sm:pt-10 space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter font-display leading-tight text-white">
                Bem-vindo de volta!
              </h2>
              <p className="text-sm font-medium text-slate-300 leading-relaxed">
                Acesse sua conta para continuar suas investigações científicas, simulações e conquistas.
              </p>
            </div>
          </div>

          <div className="pt-8 space-y-4">
            <Link
              to="/cadastro"
              className="w-full py-3.5 px-6 rounded-full border-2 border-white hover:border-brand hover:text-brand text-white font-black text-xs uppercase tracking-widest text-center transition-all block"
            >
              Criar Conta
            </Link>
            <p className="text-[11px] text-slate-400 text-center font-medium">
              Plataforma Aberta de Físico-Química
            </p>
          </div>
        </div>

        {/* Coluna Direita: Formulário de Acesso */}
        <div className="md:col-span-7 bg-white p-8 sm:p-12 flex flex-col justify-between">
          <div>
            <div className="space-y-1 mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-dark tracking-tight uppercase font-display">
                Acesse sua conta
              </h1>
              <p className="text-sm text-dark/70 font-bold">
                Preencha seus dados de acesso
              </p>
            </div>

            {erro && (
              <div className="mb-6 p-4 bg-rose-100 border-2 border-dark text-dark rounded-xl text-xs font-bold flex items-start space-x-2.5 animate-slide-up shadow-neo-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-dark stroke-[2.5] mt-0.5" />
                <span className="leading-relaxed">{erro}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-dark block">E-mail</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-dark/50 absolute left-4 top-3.5 stroke-[2]" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-dark rounded-xl text-sm font-bold text-dark placeholder-dark/40 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand transition shadow-neo-sm"
                    placeholder="seu.email@exemplo.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-dark block">Senha</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-dark/50 absolute left-4 top-3.5 stroke-[2]" />
                  <input
                    type="password"
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-dark rounded-xl text-sm font-bold text-dark placeholder-dark/40 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand transition shadow-neo-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={carregando}
                  className="w-full py-4 bg-dark text-white hover:bg-brand hover:text-dark rounded-xl font-black text-sm uppercase tracking-widest border-2 border-dark shadow-neo hover:shadow-neo-hover hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  <span>{carregando ? 'Verificando...' : 'Entrar'}</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </form>
          </div>

          <div className="pt-6 border-t-2 border-dark/10 flex items-center justify-between text-xs font-bold text-dark/70">
            <span>Ainda não tem conta?</span>
            <Link to="/cadastro" className="text-dark font-black uppercase hover:underline underline-offset-4">
              Cadastre-se aqui
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
