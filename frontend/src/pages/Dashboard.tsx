import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Award, Coins, BookOpen, LogOut } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem('usuario');
    if (!data) {
      navigate('/login');
    } else {
      const user = JSON.parse(data);
      // Busca dados atualizados do servidor
      axios.get(`http://localhost:8080/api/usuarios/${user.id}`)
        .then(res => setUsuario(res.data))
        .catch(() => navigate('/login'));
    }
  }, [navigate]);

  if (!usuario) return <div className="text-center p-10">Carregando...</div>;

  const xpMaxNivel = usuario.experiencia < 50 ? 50 : 
                     usuario.experiencia < 200 ? 200 : 
                     usuario.experiencia < 500 ? 500 : 1000;
  
  const progresso = Math.min((usuario.experiencia / xpMaxNivel) * 100, 100);

  const sair = () => {
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Cabeçalho do Perfil */}
        <div className="bg-white rounded-2xl p-6 shadow flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-lg">
              <User className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{usuario.nomeCompleto}</h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 mt-1">
                <Award className="w-4 h-4 mr-1" /> {usuario.titulo}
              </span>
            </div>
          </div>
          <button onClick={sair} className="text-gray-500 hover:text-red-500 flex items-center">
            <LogOut className="w-5 h-5 mr-1" /> Sair
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card de Progresso */}
          <div className="bg-white rounded-2xl p-6 shadow md:col-span-2">
            <h2 className="text-lg font-bold mb-4 flex items-center text-gray-700">
              <BookOpen className="w-5 h-5 mr-2 text-indigo-500" /> Progresso de Estudo
            </h2>
            <div className="flex justify-between text-sm mb-1 font-medium">
              <span>Experiência (XP)</span>
              <span>{usuario.experiencia} / {xpMaxNivel} XP</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div className="bg-indigo-500 h-4 rounded-full transition-all duration-1000" style={{ width: `${progresso}%` }}></div>
            </div>
            <p className="text-sm text-gray-500">Continue resolvendo exercícios para subir de nível e ganhar novos títulos!</p>
          </div>

          {/* Card de Loja/Moedas */}
          <div className="bg-white rounded-2xl p-6 shadow flex flex-col items-center justify-center text-center">
            <Coins className="w-12 h-12 text-yellow-500 mb-2" />
            <h3 className="text-2xl font-bold">{usuario.pontos} <span className="text-lg text-gray-500 font-normal">pts</span></h3>
            <p className="text-sm text-gray-500 mt-2">Use seus pontos para comprar animações de perfil em breve.</p>
          </div>
        </div>

        {/* Exercícios */}
        <div className="bg-white rounded-2xl p-6 shadow">
          <h2 className="text-lg font-bold mb-4">Módulos Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/cinetica" className="block border rounded-xl p-4 hover:border-blue-500 hover:shadow-md transition group">
              <h3 className="font-bold text-lg text-blue-600 group-hover:text-blue-700">Cinética Química</h3>
              <p className="text-gray-600 text-sm mt-1">Simule reações de 1ª e 0ª ordem e ganhe até 50 XP respondendo os exercícios.</p>
            </Link>
            <div className="block border rounded-xl p-4 opacity-60 cursor-not-allowed">
              <h3 className="font-bold text-lg text-gray-600">Distribuição de Maxwell</h3>
              <p className="text-gray-600 text-sm mt-1">Em breve. Analise a velocidade dos gases e ganhe recompensas.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
