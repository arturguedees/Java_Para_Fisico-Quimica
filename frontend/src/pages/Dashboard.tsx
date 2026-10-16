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
      <div className="min-h-screen bg-stone-50 flex items-center justify-center text-sm text-stone-600 font-sans">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand to-emerald-500 flex items-center justify-center text-white animate-bounce shadow-lg shadow-brand-500/25">
            <FlaskConical className="w-5 h-5" />
          </div>
          <span className="font-semibold text-stone-700 animate-pulse">Carregando ambiente quântico...</span>
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
      descricao: 'Simule o decaimento exponencial de reagentes no tempo, controle a constante k e visualize o tempo de meia-vida (t½).',
      rota: '/cinetica',
      tag: 'Simulação Dinâmica',
      icone: FlaskConical,
      bgClass: 'quantum-card',
      textClass: 'text-dark',
      iconClass: 'bg-brand text-dark border-4 border-dark shadow-neo-sm',
    },
    {
      indice: '02',
      titulo: 'Distribuição de Maxwell-Boltzmann',
      subtitulo: 'Velocidade dos Gases',
      descricao: 'Descubra a agitação molecular dos gases ideais (He, Ar, O₂). Calcule velocidades térmicas sob variações de temperatura.',
      rota: '/maxwell',
      tag: 'Termodinâmica',
      icone: Wind,
      bgClass: 'quantum-card-lime',
      textClass: 'text-dark',
      iconClass: 'bg-white text-dark border-4 border-dark shadow-neo-sm',
    },
    {
      indice: '03',
      titulo: 'Calorimetria DSC',
      subtitulo: 'Desnaturação Térmica',
      descricao: 'Analise o termograma de desnaturação. Realize integração numérica para quantificar o ΔH de transição.',
      rota: '/dsc',
      tag: 'Métodos Numéricos',
      icone: Flame,
      bgClass: 'quantum-card-dark',
      textClass: 'text-white',
      iconClass: 'bg-brand text-dark border-4 border-dark shadow-neo-sm',
    },
    {
      indice: '04',
      titulo: 'Central de Exercícios',
      subtitulo: 'Banco de Questões',
      descricao: 'Pratique questões passo a passo. Ganhe experiência (XP), moedas para trocar por insígnias e suba no ranking.',
      rota: '/exercicios',
      tag: 'Ganhe XP & Moedas',
      icone: HelpCircle,
      bgClass: 'quantum-card',
      textClass: 'text-dark',
      iconClass: 'bg-yellow-300 text-dark border-4 border-dark shadow-neo-sm',
    }
  ];

  return (
    <div className="min-h-screen pb-20">
      <Navbar usuario={usuario} />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 space-y-12">
        
        {/* Card Hero do Estudante */}
        <section className="quantum-card relative overflow-hidden bg-brand p-8 sm:p-12 transition-all">
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Boas-vindas e Introdução */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-white border-2 border-dark rounded-full text-xs font-bold text-dark shadow-neo-sm uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-dark" />
                <span>Laboratório Físico-Química</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-dark tracking-tighter leading-[1.1] font-display uppercase">
                Olá, {usuario.nomeCompleto}!
              </h1>

              <p className="text-dark/90 text-base sm:text-lg leading-relaxed max-w-2xl font-medium">
                Bem-vindo ao <strong>Lab Quântico</strong>. Aqui você explora fenômenos termodinâmicos e cinéticos através de simulações em tempo real e treina com nosso banco de questões gamificado.
              </p>

              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  to="/exercicios"
                  className="btn-quantum-primary inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl font-bold text-base shadow-neo hover:shadow-neo-hover active:translate-y-1 active:scale-95 active:shadow-none transition-all duration-150"
                >
                  <HelpCircle className="w-5 h-5 stroke-[2]" />
                  <span>Resolver Questões</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform stroke-[2]" />
                </Link>
                <Link
                  to="/cinetica"
                  className="inline-flex items-center space-x-2 px-6 py-3.5 bg-white text-dark hover:bg-dark hover:text-white border-2 border-dark rounded-xl font-bold text-base shadow-neo hover:shadow-neo-hover active:translate-y-1 active:scale-95 active:shadow-none transition-all duration-150"
                >
                  <FlaskConical className="w-5 h-5 stroke-[2]" />
                  <span>Abrir Simuladores</span>
                </Link>
              </div>
            </div>

            {/* Quadro de Status do Estudante (Gamificação Dinâmica) */}
            <div className="lg:col-span-5 bg-white border-4 border-dark rounded-2xl p-6 sm:p-8 space-y-6 shadow-neo">
              <div className="flex items-center space-x-4 pb-5 border-b-2 border-dark">
                <AvatarBadge avatarId={usuario.avatarId} size="lg" />
                <div className="space-y-1.5">
                  <span className="text-xs font-black uppercase tracking-widest text-dark bg-brand px-2.5 py-1 rounded-sm border-2 border-dark inline-block shadow-neo-sm">
                    {usuario.titulo}
                  </span>
                  <h3 className="font-black text-2xl text-dark flex items-center space-x-2 font-display uppercase tracking-tight">
                    <span>Nível {nivel}</span>
                    <span className="text-sm font-bold text-dark/40 font-mono">• {xp} XP</span>
                  </h3>
                </div>
              </div>

              {/* Barra de Progresso */}
              <div className="space-y-2 text-sm font-bold">
                <div className="flex justify-between text-dark">
                  <span>PRÓXIMO NÍVEL</span>
                  <span className="font-mono">{xp} / {xpProximo} XP</span>
                </div>
                <div className="w-full bg-white border-2 border-dark h-4 rounded-full overflow-hidden relative shadow-neo-sm">
                  <div
                    className="bg-brand border-r-2 border-dark h-full transition-all duration-700 ease-out relative"
                    style={{ width: `${progressoPercent}%` }}
                  >
                  </div>
                </div>
              </div>

              {/* Métricas Rápidas */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-white p-4 rounded-2xl border-4 border-dark shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
                  <span className="text-dark block text-xs font-bold uppercase tracking-wider">Moedas</span>
                  <div className="flex items-center space-x-2 mt-2 text-dark">
                    <Coins className="w-6 h-6 stroke-[2]" />
                    <span className="text-2xl font-black font-mono">{usuario.pontos}</span>
                  </div>
                </div>
                <div className="bg-dark p-4 rounded-2xl border-4 border-dark shadow-neo-lime hover:shadow-neo hover:-translate-y-1 transition-all text-white">
                  <span className="text-brand block text-xs font-bold uppercase tracking-wider">Exercícios</span>
                  <div className="flex items-center space-x-2 mt-2">
                    <CheckCircle className="w-6 h-6 stroke-[2] text-brand" />
                    <span className="text-2xl font-black font-mono">{totalExerciciosResolvidos}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Grade de Módulos de Estudo Interativo */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b-4 border-dark pb-4">
            <div>
              <h2 className="text-3xl font-black text-dark tracking-tighter uppercase font-display">
                Módulos de Estudo Interativo
              </h2>
              <p className="text-dark/80 text-sm mt-1 font-bold">
                Explore os módulos práticos com simulação gráfica e perguntas de fixação
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {modulos.map((mod) => {
              const Icon = mod.icone;
              return (
                <Link
                  key={mod.indice}
                  to={mod.rota}
                  className={`${mod.bgClass} group rounded-3xl p-6 sm:p-8 flex flex-col justify-between active:scale-[0.98] active:translate-y-1 cursor-pointer transition-all duration-150`}
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-black font-mono border-2 ${mod.bgClass === 'quantum-card-dark' ? 'border-brand bg-brand text-dark' : 'border-dark bg-white text-dark'} px-2 py-0.5 rounded-sm shadow-neo-sm`}>
                          {mod.indice}
                        </span>
                        <span className={`text-xs font-bold uppercase tracking-wider ${mod.textClass} opacity-90`}>
                          {mod.subtitulo}
                        </span>
                      </div>

                      <span className={`px-3 py-1 ${mod.bgClass === 'quantum-card-dark' ? 'bg-dark text-white border-white' : 'bg-white text-dark border-dark'} border-2 shadow-neo-sm rounded-full text-[10px] font-black uppercase tracking-wider`}>
                        {mod.tag}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className={`w-14 h-14 rounded-xl ${mod.iconClass} flex items-center justify-center group-hover:scale-105 group-hover:rotate-6 transition-all duration-300`}>
                        <Icon className={`w-7 h-7 stroke-[2.5] ${mod.bgClass === 'quantum-card-dark' ? 'text-dark' : 'text-dark'}`} />
                      </div>
                      <h3 className={`text-2xl font-black ${mod.textClass} font-display uppercase tracking-tight`}>
                        {mod.titulo}
                      </h3>
                    </div>

                    <p className={`text-base ${mod.textClass} opacity-90 font-medium leading-relaxed`}>
                      {mod.descricao}
                    </p>
                  </div>

                  <div className={`mt-8 pt-6 border-t-2 ${mod.bgClass === 'quantum-card-dark' ? 'border-white/20' : 'border-dark/20'} flex items-center justify-between text-sm font-black ${mod.textClass} uppercase tracking-widest`}>
                    <span className="group-hover:underline">ACESSAR MÓDULO</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-200 stroke-[2.5]" />
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
              <span className="text-xs text-amber-700 font-extrabold uppercase tracking-wider bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200/60 inline-block">
                CONQUISTAS & PERSONALIZAÇÃO
              </span>
              <h3 className="text-lg font-bold text-stone-900 font-serif">Loja de Insígnias & Selos</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Utilize suas moedas conquistadas nas resoluções para desbloquear selos históricos de Planck, Boltzmann, Curie e equipar no seu perfil.
              </p>
            </div>
            <Link
              to="/loja"
              className="mt-5 inline-flex items-center space-x-1.5 text-xs font-bold text-brand hover:text-brand-hover"
            >
              <span>EXPLORAR INSÍGNIAS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="quantum-card rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:-translate-y-1 transition-all">
            <div className="space-y-3">
              <span className="text-xs text-brand font-extrabold uppercase tracking-wider bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-200/60 inline-block">
                COMUNIDADE ACADÊMICA
              </span>
              <h3 className="text-lg font-bold text-stone-900 font-serif">Ranking dos Estudantes</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Acompanhe em tempo real quem está no topo da tabela de classificação geral de Físico-Química com base na experiência obtida.
              </p>
            </div>
            <Link
              to="/ranking"
              className="mt-5 inline-flex items-center space-x-1.5 text-xs font-bold text-brand hover:text-brand-hover"
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
