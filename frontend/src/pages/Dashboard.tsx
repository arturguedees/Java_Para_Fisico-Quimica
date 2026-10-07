import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, BookOpen, CheckCircle, Trophy, Sparkles, Flame, Wind, FlaskConical, HelpCircle, Coins, Zap } from 'lucide-react';
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-600 font-sans">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white animate-bounce shadow-lg shadow-indigo-500/25">
            <FlaskConical className="w-5 h-5" />
          </div>
          <span className="font-semibold text-slate-700 animate-pulse">Carregando ambiente quântico...</span>
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
      descricao: 'Simule o decaimento exponencial de reagentes no tempo, controle a constante k e visualize o tempo de meia-vida (t½) e vida média (τ).',
      rota: '/cinetica',
      tag: 'Simulação Dinâmica',
      icone: FlaskConical,
      corIcone: 'from-blue-600 to-indigo-600',
      corSombra: 'shadow-blue-500/20',
      tagBadge: 'bg-blue-50 text-blue-700 border-blue-200/80'
    },
    {
      indice: '02',
      titulo: 'Distribuição de Maxwell-Boltzmann',
      subtitulo: 'Velocidade e Energia dos Gases',
      descricao: 'Descubra a agitação molecular dos gases ideais (He, Ar, O₂). Calcule velocidades térmicas (v_mp, v_m, v_rms) sob variações de temperatura.',
      rota: '/maxwell',
      tag: 'Termodinâmica',
      icone: Wind,
      corIcone: 'from-indigo-600 to-violet-600',
      corSombra: 'shadow-indigo-500/20',
      tagBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
    },
    {
      indice: '03',
      titulo: 'Calorimetria DSC (Lisozima)',
      subtitulo: 'Desnaturação Térmica & Entalpia',
      descricao: 'Analise o termograma de desnaturação da proteína. Realize integração numérica (Simpson 1/3 com Spline Cúbico) para quantificar o ΔH de transição.',
      rota: '/dsc',
      tag: 'Métodos Numéricos',
      icone: Flame,
      corIcone: 'from-rose-500 to-amber-600',
      corSombra: 'shadow-rose-500/20',
      tagBadge: 'bg-rose-50 text-rose-700 border-rose-200/80'
    },
    {
      indice: '04',
      titulo: 'Central de Exercícios & Quiz',
      subtitulo: 'Banco de Questões Interativo',
      descricao: 'Pratique questões com resolução passo a passo. Ganhe experiência (XP), moedas para trocar por insígnias e suba no ranking da turma!',
      rota: '/exercicios',
      tag: 'Ganhe XP & Moedas',
      icone: HelpCircle,
      corIcone: 'from-emerald-500 to-teal-600',
      corSombra: 'shadow-emerald-500/20',
      tagBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
    }
  ];

  return (
    <div className="min-h-screen text-slate-800 pb-20 font-sans">
      <Navbar usuario={usuario} />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        
        {/* Card Hero do Estudante com Gradiente Moderno e Iluminação */}
        <section className="relative overflow-hidden bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-sm transition-all">
          {/* Efeito sutil de luz de fundo */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-indigo-200/40 via-blue-200/20 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-gradient-to-tr from-cyan-200/30 via-emerald-200/20 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Boas-vindas e Introdução */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/80 rounded-full text-xs font-bold text-indigo-700 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" style={{ animationDuration: '6s' }} />
                <span>LABORATÓRIO INTERATIVO DE FÍSICO-QUÍMICA</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Olá, {usuario.nomeCompleto}! 🚀
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
                Bem-vindo ao <strong>Lab Quântico</strong>. Aqui você explora fenômenos termodinâmicos e cinéticos através de simulações em tempo real e treina com nosso banco de exercícios gamificado.
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  to="/exercicios"
                  className="btn-quantum-primary inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-sm shadow-md"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Resolver Questões</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/cinetica"
                  className="inline-flex items-center space-x-2 px-5 py-3 bg-slate-100/90 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl font-semibold text-sm transition-all duration-200 border border-slate-200/80 hover:shadow-xs"
                >
                  <span>Abrir Simuladores</span>
                </Link>
              </div>
            </div>

            {/* Quadro de Status do Estudante (Gamificação Dinâmica) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-indigo-100/80 rounded-2xl p-6 space-y-5 shadow-xs">
              <div className="flex items-center space-x-4 pb-4 border-b border-slate-200/70">
                <AvatarBadge avatarId={usuario.avatarId} size="lg" />
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200/60 inline-block">
                    {usuario.titulo}
                  </span>
                  <h3 className="font-extrabold text-lg text-slate-900 flex items-center space-x-2">
                    <span>Nível {nivel}</span>
                    <span className="text-xs font-semibold text-slate-400 font-mono">• {xp} XP</span>
                  </h3>
                </div>
              </div>

              {/* Barra de Progresso com Shimmer */}
              <div className="space-y-2 text-xs font-semibold">
                <div className="flex justify-between text-slate-600">
                  <span>Progresso para o Nível {nivel + 1}</span>
                  <span className="font-mono text-slate-800">{xp} / {xpProximo} XP</span>
                </div>
                <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden relative shadow-inner">
                  <div
                    className="bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400 h-full rounded-full transition-all duration-700 ease-out shadow-xs relative"
                    style={{ width: `${progressoPercent}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                  </div>
                </div>
              </div>

              {/* Métricas Rápidas com Efeito de Hover */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-amber-500/10 hover:-translate-y-0.5 transition-all">
                  <span className="text-slate-500 block text-[11px] font-bold uppercase">Moedas Acumuladas</span>
                  <div className="flex items-center space-x-1.5 mt-1 text-amber-600">
                    <Coins className="w-5 h-5 fill-amber-500" />
                    <span className="text-xl font-extrabold font-mono">{usuario.pontos}</span>
                  </div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-emerald-500/10 hover:-translate-y-0.5 transition-all">
                  <span className="text-slate-500 block text-[11px] font-bold uppercase">Exercícios Feitos</span>
                  <div className="flex items-center space-x-1.5 mt-1 text-emerald-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-xl font-extrabold font-mono">{totalExerciciosResolvidos}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Grade de Módulos de Estudo Interativo */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
                <span>Módulos de Estudo Interativo</span>
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Explore os módulos práticos com simulação gráfica e perguntas de fixação
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modulos.map((mod) => {
              const Icon = mod.icone;
              return (
                <Link
                  key={mod.indice}
                  to={mod.rota}
                  className="quantum-card group rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:-translate-y-1.5 transition-all duration-300"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          {mod.indice}.
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          {mod.subtitulo}
                        </span>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${mod.tagBadge} shadow-2xs`}>
                        {mod.tag}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${mod.corIcone} text-white flex items-center justify-center shadow-md ${mod.corSombra} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {mod.titulo}
                      </h3>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      {mod.descricao}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                    <span className="group-hover:underline">ACESSAR MÓDULO</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Atalhos Rápidos para Loja e Ranking */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="quantum-card rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:-translate-y-1 transition-all">
            <div className="space-y-3">
              <span className="text-xs text-amber-600 font-extrabold uppercase tracking-wider bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200/60 inline-block">
                CONQUISTAS & PERSONALIZAÇÃO
              </span>
              <h3 className="text-lg font-bold text-slate-900">Loja de Insígnias & Selos</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Utilize suas moedas conquistadas nas resoluções para desbloquear selos históricos de Planck, Boltzmann, Curie e equipar no seu perfil.
              </p>
            </div>
            <Link
              to="/loja"
              className="mt-5 inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              <span>EXPLORAR INSÍGNIAS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="quantum-card rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:-translate-y-1 transition-all">
            <div className="space-y-3">
              <span className="text-xs text-indigo-600 font-extrabold uppercase tracking-wider bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200/60 inline-block">
                COMUNIDADE ACADÊMICA
              </span>
              <h3 className="text-lg font-bold text-slate-900">Ranking dos Estudantes</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Acompanhe em tempo real quem está no topo da tabela de classificação geral de Físico-Química com base na experiência obtida.
              </p>
            </div>
            <Link
              to="/ranking"
              className="mt-5 inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
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
