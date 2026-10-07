import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FlaskConical, 
  Wind, 
  Flame, 
  BrainCircuit, 
  ShoppingBag, 
  Trophy, 
  Sparkles, 
  ChevronRight, 
  Zap, 
  Target, 
  CheckCircle2, 
  BookOpen
} from 'lucide-react';
import Navbar from '../components/Navbar';
import AvatarBadge from '../components/AvatarBadge';

export default function Dashboard() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = localStorage.getItem('usuario');
    if (!data) {
      navigate('/login');
    } else {
      const user = JSON.parse(data);
      axios.get(`http://localhost:8080/api/usuarios/${user.id}`)
        .then(res => {
          setUsuario(res.data);
          localStorage.setItem('usuario', JSON.stringify(res.data));
          setLoading(false);
        })
        .catch(() => {
          // Fallback para cache local caso o backend esteja iniciando
          setUsuario(user);
          setLoading(false);
        });
    }
  }, [navigate]);

  if (loading || !usuario) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold tracking-wide">Carregando dados do laboratório...</span>
        </div>
      </div>
    );
  }

  // Estatísticas do Usuário
  const exerciciosArray = usuario.exerciciosResolvidos ? usuario.exerciciosResolvidos.split(',').filter(Boolean) : [];
  const totalExerciciosResolvidos = exerciciosArray.length;

  const xp = usuario.experiencia || 0;
  let nivel = 1;
  let xpBase = 0;
  let xpProximo = 100;

  if (xp < 100) { nivel = 1; xpBase = 0; xpProximo = 100; }
  else if (xp < 300) { nivel = 2; xpBase = 100; xpProximo = 300; }
  else if (xp < 600) { nivel = 3; xpBase = 300; xpProximo = 600; }
  else if (xp < 1000) { nivel = 4; xpBase = 600; xpProximo = 1000; }
  else if (xp < 1500) { nivel = 5; xpBase = 1000; xpProximo = 1500; }
  else if (xp < 2500) { nivel = 6; xpBase = 1500; xpProximo = 2500; }
  else { nivel = 7; xpBase = 2500; xpProximo = 5000; }

  const progressoPercent = Math.min(100, Math.max(0, ((xp - xpBase) / (xpProximo - xpBase)) * 100));

  const modulos = [
    {
      titulo: 'Cinética Química',
      descricao: 'Simule reações de Ordem Zero e Primeira Ordem. Analise o decaimento de reagentes [A] e a formação de produtos [B] com tempo de meia-vida.',
      icone: FlaskConical,
      cor: 'from-blue-600 to-cyan-500',
      rota: '/cinetica',
      tag: 'Simulação 2D',
      xpBonus: '+60 XP'
    },
    {
      titulo: 'Distribuição de Maxwell-Boltzmann',
      descricao: 'Explore a distribuição estatística de velocidades e energias cinéticas em gases nobres e moleculares de 100 K a 1500 K.',
      icone: Wind,
      cor: 'from-cyan-500 to-teal-400',
      rota: '/maxwell',
      tag: 'Estatística Térmica',
      xpBonus: '+75 XP'
    },
    {
      titulo: 'Calorimetria DSC (Lisozima)',
      descricao: 'Calcule a entalpia de desnaturação de biopolímeros utilizando Métodos Numéricos Avançados: Regra do Trapézio vs Simpson com Spline Cúbico.',
      icone: Flame,
      cor: 'from-amber-500 to-rose-500',
      rota: '/dsc',
      tag: 'Integração Numérica',
      xpBonus: '+85 XP'
    },
    {
      titulo: 'Central de Desafios & Quiz',
      descricao: 'Resolva exercícios e problemas práticos utilizando os gráficos para faturar Moedas e XP, evoluindo de título e subindo no Ranking.',
      icone: BrainCircuit,
      cor: 'from-purple-600 to-pink-500',
      rota: '/exercicios',
      tag: 'Ganhe Pontos',
      xpBonus: 'Até +110 XP/questão'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar usuario={usuario} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Cartão de Identidade do Cientista (Hero Card) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-800 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            
            {/* Avatar e Dados Pessoais */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <AvatarBadge avatarId={usuario.avatarId} size="xl" />
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Nível {nivel}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {usuario.titulo}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {usuario.nomeCompleto}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md">
                  Laboratório Computacional de Físico-Química. Explore os fenômenos atômicos, resolva desafios e personalize sua insígnia.
                </p>
              </div>
            </div>

            {/* Barra de Progresso e Ações Rápidas */}
            <div className="w-full md:w-80 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3 backdrop-blur-md">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400">Progresso do Nível {nivel}</span>
                <span className="text-cyan-400">{xp} / {xpProximo} XP</span>
              </div>
              
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700/60">
                <div 
                  className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 h-full rounded-full transition-all duration-700 shadow-sm shadow-cyan-500/50"
                  style={{ width: `${progressoPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>{usuario.pontos} Moedas</span>
                </div>
                <Link
                  to="/loja"
                  className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center space-x-1 transition"
                >
                  <span>Ir à Loja</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>

          {/* Cards de Métricas Rápidas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-slate-800/80">
            <div className="bg-slate-950/50 rounded-xl p-3.5 border border-slate-800">
              <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Desafios Concluídos</span>
              </div>
              <span className="text-xl font-black text-white">{totalExerciciosResolvidos}</span>
            </div>

            <div className="bg-slate-950/50 rounded-xl p-3.5 border border-slate-800">
              <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold mb-1">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Experiência Total</span>
              </div>
              <span className="text-xl font-black text-white">{xp} <span className="text-xs font-medium text-slate-500">XP</span></span>
            </div>

            <div className="bg-slate-950/50 rounded-xl p-3.5 border border-slate-800">
              <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold mb-1">
                <ShoppingBag className="w-4 h-4 text-purple-400" />
                <span>Avatares Desbloqueados</span>
              </div>
              <span className="text-xl font-black text-white">
                {usuario.avataresDesbloqueados ? usuario.avataresDesbloqueados.split(',').length : 1}
              </span>
            </div>

            <div className="bg-slate-950/50 rounded-xl p-3.5 border border-slate-800">
              <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold mb-1">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Títulos Obtidos</span>
              </div>
              <span className="text-xl font-black text-white">
                {usuario.titulosDesbloqueados ? usuario.titulosDesbloqueados.split(',').length : 1}
              </span>
            </div>
          </div>

        </div>

        {/* Grade de Módulos & Laboratórios Virtuais */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <FlaskConical className="w-5 h-5 text-cyan-400" />
                <span>Laboratórios & Módulos Científicos</span>
              </h2>
              <p className="text-xs text-slate-400">Selecione um laboratório para simular equações e testar hipóteses</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {modulos.map((mod, idx) => {
              const Icon = mod.icone;
              return (
                <Link
                  key={idx}
                  to={mod.rota}
                  className="group relative bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${mod.cor} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {mod.tag}
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {mod.xpBonus}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition">
                      {mod.titulo}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {mod.descricao}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                    <span>Acessar Laboratório</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Banner de Chamada para a Loja & Ranking */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-500/20 rounded-2xl p-6 flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center space-x-1">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Loja de Avatares Animados</span>
              </span>
              <h3 className="text-lg font-bold text-white">Personalize sua Identidade</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Desbloqueie auras de plasma, anéis quânticos e molduras de supernovas com seus pontos acumulados.
              </p>
              <Link
                to="/loja"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition mt-2"
              >
                <span>Explorar Loja</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/20 rounded-2xl p-6 flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                <Trophy className="w-3.5 h-3.5" />
                <span>Hall da Fama Acadêmico</span>
              </span>
              <h3 className="text-lg font-bold text-white">Ranking de Pesquisadores</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Veja sua posição entre os alunos da Universidade Tiradentes e dispute o topo do ranking de XP.
              </p>
              <Link
                to="/ranking"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-600/30 transition mt-2"
              >
                <span>Ver Classificação</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
