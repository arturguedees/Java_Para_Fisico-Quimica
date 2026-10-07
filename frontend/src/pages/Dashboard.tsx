import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, BookOpen, CheckCircle, Trophy, Sparkles, Flame, Wind, FlaskConical, HelpCircle, Coins } from 'lucide-react';
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
          setUsuario(user);
          setLoading(false);
        });
    }
  }, [navigate]);

  if (loading || !usuario) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-600">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Carregando ambiente de estudos...</span>
        </div>
      </div>
    );
  }

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
      indice: '01',
      titulo: 'Cinética Química',
      subtitulo: 'Reações de 0ª e 1ª Ordem',
      descricao: 'Simule o decaimento de reagentes ao longo do tempo, compare reações de ordem zero e primeira ordem, e calcule tempo de meia-vida (t½) e tempo de vida médio (τ).',
      rota: '/cinetica',
      tag: 'Simulação Gráfica',
      icone: FlaskConical,
      corTag: 'text-blue-700 bg-blue-50 border-blue-200'
    },
    {
      indice: '02',
      titulo: 'Distribuição de Maxwell-Boltzmann',
      subtitulo: 'Velocidade e Energia dos Gases',
      descricao: 'Visualize o comportamento cinético molecular para Hélio, Argônio e Oxigênio. Calcule v_mp (mais provável), v_média e v_rms sob diferentes temperaturas.',
      rota: '/maxwell',
      tag: 'Termodinâmica',
      icone: Wind,
      corTag: 'text-indigo-700 bg-indigo-50 border-indigo-200'
    },
    {
      indice: '03',
      titulo: 'Calorimetria DSC (Lisozima)',
      subtitulo: 'Desnaturação Térmica e Entalpia',
      descricao: 'Analise o fluxo de calor da proteína Lisozima. Calcule a entalpia de transição (ΔH) utilizando integração numérica de Trapézio e Simpson com Spline Cúbico.',
      rota: '/dsc',
      tag: 'Métodos Numéricos',
      icone: Flame,
      corTag: 'text-amber-700 bg-amber-50 border-amber-200'
    },
    {
      indice: '04',
      titulo: 'Central de Exercícios & Quiz',
      subtitulo: 'Fixação de Conteúdo & Pontuação',
      descricao: 'Resolva questões teóricas e de cálculo físico-químico estilo banco de questões. Ganhe XP e moedas para subir de nível e desbloquear novas insígnias!',
      rota: '/exercicios',
      tag: 'Pratique & Ganhe XP',
      icone: HelpCircle,
      corTag: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 font-sans">
      <Navbar usuario={usuario} />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        
        {/* Card do Estudante (Hero Principal de Boas-vindas) */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Boas-vindas */}
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs text-blue-700 font-semibold">
                <span>PLATAFORMA DE ESTUDOS</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Olá, {usuario.nomeCompleto}! 👋
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
                Bem-vindo ao <strong>Lab Quântico</strong>. Aqui você domina conceitos de Físico-Química através de simulações interativas em tempo real e um banco de questões focado no seu aprendizado.
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  to="/exercicios"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition shadow-sm"
                >
                  <span>Resolver Questões</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/cinetica"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition"
                >
                  <span>Iniciar Simulações</span>
                </Link>
              </div>
            </div>

            {/* Quadro de Status do Aluno */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center space-x-4 pb-3 border-b border-slate-200">
                <AvatarBadge avatarId={usuario.avatarId} size="lg" />
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                    {usuario.titulo}
                  </span>
                  <h3 className="font-bold text-lg text-slate-900">
                    Nível {nivel} de Estudos
                  </h3>
                </div>
              </div>

              {/* Barra de Progresso do Nível */}
              <div className="space-y-1.5 text-xs font-medium">
                <div className="flex justify-between text-slate-600">
                  <span>Progresso do Nível</span>
                  <span className="font-semibold text-slate-800">{xp} / {xpProximo} XP</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300 shadow-sm"
                    style={{ width: `${progressoPercent}%` }}
                  />
                </div>
              </div>

              {/* Métricas Rápidas */}
              <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-slate-500 block text-[11px] font-medium">MOEDAS / PONTOS:</span>
                  <span className="text-lg font-bold text-amber-600 flex items-center space-x-1 mt-0.5">
                    <Coins className="w-4 h-4 inline" />
                    <span>{usuario.pontos} pts</span>
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-slate-500 block text-[11px] font-medium">EXERCÍCIOS:</span>
                  <span className="text-lg font-bold text-emerald-600 flex items-center space-x-1 mt-0.5">
                    <CheckCircle className="w-4 h-4 inline" />
                    <span>{totalExerciciosResolvidos} feitos</span>
                  </span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Grade de Módulos de Estudo */}
        <section className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Módulos de Estudo Interativo
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Escolha um módulo para simular equações ou treinar no banco de exercícios
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {modulos.map((mod) => {
              const Icon = mod.icone;
              return (
                <Link
                  key={mod.indice}
                  to={mod.rota}
                  className="group bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-400">
                          {mod.indice}.
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          {mod.subtitulo}
                        </span>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-xs border font-medium ${mod.corTag}`}>
                        {mod.tag}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {mod.titulo}
                      </h3>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {mod.descricao}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                    <span>ACESSAR MÓDULO</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Atalhos Rápidos para Loja e Ranking */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
            <div className="space-y-2">
              <span className="text-xs text-amber-600 font-bold uppercase tracking-wider">
                PERSONALIZAÇÃO DO PERFIL
              </span>
              <h3 className="text-lg font-bold text-slate-900">Loja de Insígnias & Selos</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Utilize as moedas conquistadas na resolução de exercícios para colecionar novas insígnias históricas e equipar no seu perfil.
              </p>
            </div>
            <Link
              to="/loja"
              className="mt-4 inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <span>EXPLORAR INSÍGNIAS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
            <div className="space-y-2">
              <span className="text-xs text-indigo-600 font-bold uppercase tracking-wider">
                COMUNIDADE DE ESTUDANTES
              </span>
              <h3 className="text-lg font-bold text-slate-900">Ranking da Turma</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Veja sua classificação na turma de Físico-Química com base no total de experiência (XP) e exercícios concluídos.
              </p>
            </div>
            <Link
              to="/ranking"
              className="mt-4 inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <span>VER CLASSIFICAÇÃO</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
