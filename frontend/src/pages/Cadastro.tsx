import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Cadastro() {
  const navigate = useNavigate();
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const response = await axios.post('http://localhost:8080/api/usuarios/cadastrar', {
        nomeCompleto,
        email,
        senha
      });
      localStorage.setItem('usuario', JSON.stringify(response.data));
      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'ERR_NETWORK') {
        setErro('Servidor de dados inacessível. Certifique-se de que o backend Java e PostgreSQL estejam ativos.');
      } else if (err.response && err.response.data) {
        setErro(typeof err.response.data === 'string' ? err.response.data : 'Erro ao cadastrar credencial.');
      } else {
        setErro('Falha no registro.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1013] text-[#e5e2dc] flex flex-col justify-between p-6 sm:p-12 font-sans selection:bg-[#c85a32] selection:text-white">
      
      {/* Header Editorial */}
      <header className="flex items-center justify-between border-b border-[#1d2027] pb-4 font-mono text-xs text-[#918b7e]">
        <span className="text-[#c85a32] font-semibold">● LAB QUÂNTICO</span>
        <span>REGISTRO DE NOVO PESQUISADOR</span>
      </header>

      {/* Caixa Central de Registro */}
      <main className="max-w-md w-full mx-auto my-12 border border-[#1d2027] bg-[#14161b] p-8 sm:p-10 space-y-6">
        <div className="space-y-2 text-center">
          <span className="font-mono text-[11px] text-[#c85a32] tracking-wider uppercase">
            NOVA CREDENCIAL ACADÊMICA
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#faf9f5]">
            Criar Registro
          </h1>
          <p className="text-xs text-[#918b7e] max-w-xs mx-auto leading-relaxed">
            Inicie seu dossier com bônus de 100 créditos para exploração de insígnias.
          </p>
        </div>

        {erro && (
          <div className="p-3 border border-[#853416] bg-[#853416]/10 text-[#f09673] font-mono text-xs">
            {erro}
          </div>
        )}

        <form onSubmit={handleCadastro} className="space-y-4 font-mono text-xs">
          <div className="space-y-1.5">
            <label className="text-[#918b7e] block">NOME COMPLETO</label>
            <input 
              type="text" 
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0e1013] border border-[#1d2027] text-sm text-[#faf9f5] focus:outline-none focus:border-[#c85a32] transition"
              placeholder="Ex: Artur Camboim"
              required 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[#918b7e] block">EMAIL ACADÊMICO</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0e1013] border border-[#1d2027] text-sm text-[#faf9f5] focus:outline-none focus:border-[#c85a32] transition"
              placeholder="exemplo@unit.br"
              required 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[#918b7e] block">CHAVE DE ACESSO</label>
            <input 
              type="password" 
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0e1013] border border-[#1d2027] text-sm text-[#faf9f5] focus:outline-none focus:border-[#c85a32] transition"
              placeholder="••••••••"
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={carregando}
            className="w-full mt-3 py-3 bg-[#c85a32] hover:bg-[#a74521] text-[#faf9f5] font-bold uppercase tracking-wider transition disabled:opacity-50"
          >
            {carregando ? 'REGISTRANDO...' : 'EMITIR CREDENCIAL'}
          </button>
        </form>

        <div className="pt-4 border-t border-[#1d2027] text-center font-mono text-xs text-[#918b7e]">
          Já possui registro?{' '}
          <Link to="/login" className="text-[#c85a32] hover:underline font-semibold">
            Fazer login
          </Link>
        </div>
      </main>

      {/* Rodapé Editorial */}
      <footer className="border-t border-[#1d2027] pt-4 flex flex-col sm:flex-row items-center justify-between font-mono text-[11px] text-[#5e594d]">
        <span>UNIVERSIDADE TIRADENTES • DEPARTAMENTO DE COMPUTAÇÃO</span>
        <span>EDIÇÃO 2026 • TODOS OS DIREITOS RESERVADOS</span>
      </footer>

    </div>
  );
}
