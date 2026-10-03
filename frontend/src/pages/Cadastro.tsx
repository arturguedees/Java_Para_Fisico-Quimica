import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserPlus } from 'lucide-react';

export default function Cadastro() {
  const navigate = useNavigate();
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    try {
      await axios.post('http://localhost:8080/api/usuarios/cadastrar', { 
        nomeCompleto, email, senha 
      });
      alert('Conta criada com sucesso! Faça login.');
      navigate('/login');
    } catch (err: any) {
      if (err.code === 'ERR_NETWORK') {
        setErro('Servidor Java ou Banco de Dados fora do ar! Lembre de rodar "docker-compose up -d" e "./mvnw spring-boot:run".');
      } else if (err.response && err.response.data) {
        setErro(typeof err.response.data === 'string' ? err.response.data : 'Erro ao cadastrar. Verifique os dados.');
      } else {
        setErro('Erro ao criar conta. Tente novamente.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-green-100 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-center">Nova Conta</h1>
          <p className="text-gray-500 text-sm">Crie seu perfil acadêmico</p>
        </div>

        {erro && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">{erro}</div>}

        <form onSubmit={handleCadastro} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input 
              type="text" 
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Isaac Newton"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="seu@email.com"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input 
              type="password" 
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="••••••••"
              required 
            />
          </div>
          <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition">
            Cadastrar
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-600">
          Já tem conta? <Link to="/login" className="text-green-600 font-bold hover:underline">Faça login</Link>
        </p>
      </div>
    </div>
  );
}
