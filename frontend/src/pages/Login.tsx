import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FlaskConical } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/usuarios/login', { email, senha });
      // Salva dados no localStorage para simular sessão
      localStorage.setItem('usuario', JSON.stringify(response.data));
      navigate('/dashboard');
    } catch (err) {
      setErro('Email ou senha inválidos.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-blue-100 rounded-full mb-4">
            <FlaskConical className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-center">Físico-Química</h1>
          <p className="text-gray-500 text-sm">Faça login para continuar</p>
        </div>

        {erro && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">{erro}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="••••••••"
              required 
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition">
            Entrar
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-600">
          Ainda não tem conta? <Link to="/cadastro" className="text-blue-600 font-bold hover:underline">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}
