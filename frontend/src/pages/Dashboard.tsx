import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, BookOpen, CheckCircle, Trophy, Sparkles, Flame, Wind, FlaskConical, HelpCircle } from 'lucide-react';
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
      <div className="min-h-screen bg-canvas flex items-center justify-center font-mono text-sm text-slate-300">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
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
      descricao: 'Simule a velocidade com que reagentes se transformam em produtos, visualizando o decaimento exponencial, tempo de meia-vida (t½) e tempo de vida médio (τ).',
      rota: '/cinetica',
      tag: 'Simulação Gráfica',
      icone: FlaskConical,
      corTag: 'text-amber-400 bg-amber-950/40 border-amber-500/40'
    },
    {
      indice: '02',
      titulo: 'Distribuição de Maxwell-Boltzmann',
      subtitulo: 'Velocidade e Energia dos Gases',
      descricao: 'Veja como a temperatura e a massa molar influenciam a velocidade das moléculas em gases como Hélio, Argônio e Oxigênio, calculando v_mp, v_média e v_rms.',
      rota: '/maxwell',
      tag: 'Termodinâmica',
      icone: Wind,
      corTag: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/40'
    },
    {
      indice: '03',
      titulo: 'Calorimetria DSC (Lisozima)',
      subtitulo: 'Desnaturação Térmica e Entalpia',
      descricao: 'Analise o comportamento térmico da proteína Lisozima. Calcule a entalpia de transição (ΔH) utilizando integração numérica por Trapézio e Simpson com Spline Cúbico.',
      rota: '/dsc',
      tag: 'Métodos Numéricos',
      icone: Flame,
      corTag: 'text-rose-400 bg-rose-950/40 border-rose-500/40'
    },
    {
      indice: '04',
      titulo: 'Central de Exercícios & Quiz',
      subtitulo: 'Fixação de Conteúdo & Pontuação',
      descricao: 'Teste seus conhecimentos resolvendo problemas baseados nas simulações para acumular pontos, subir de nível e desbloquear novas insígnias no seu perfil.',
      rota: '/exercicios',
      tag: 'Pratique & Ganhe XP',
      icone: HelpCircle,
      corTag: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40'
    }
  ];

  return (
    <div className="min-h-screen bg-canvas text-slate-100 pb-24 font-sans">
      <Navbar usuario={usuario} />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        
        {/* Card do Estudante (Hero Principal de Alto Contraste) */}
        <section className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Boas-vindas e Introdução */}
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-surface-elevated border border-border-light rounded-full text-xs font-mono text-brand font-semibold">
                <span>LABORATÓRIO DE FÍSICO-QUÍMICA</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
                Olá, {usuario.nomeCompleto}!
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
                Bem-vindo ao <strong>Lab Quântico</strong>. Aqui você explora fenômenos físico-químicos por meio de gráficos interativos e exercícios práticos de fixação.
              </p>
            </div>

            {/* Quadro de Status do Aluno */}
            <div className="lg:col-span-5 bg-surface-elevated border border-border-light rounded-xl p-5 space-y-4">
              <div className="flex items-center space-x-4 pb-3 border-b border-border">
                <AvatarBadge avatarId={usuario.avatarId} size="lg" />
                <div className="space-y-0.5">
                  <span className="text-xs font-mono uppercase tracking-wider text-brand font-bold">
                    {usuario.titulo}
                  </span>
                  <h3 className="font-bold text-lg text-white">
                    Nível {nivel} de Estudos
                  </h3>
                </div>
              </div>

              {/* Barra de Progresso do Nível */}
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-300">Progresso do Nível</span>
                  <span className="text-white">{xp} / {xpProximo} XP</span>
                </div>
                <div className="w-full bg-surface-highlight h-2.5 rounded-full overflow-hidden border border-border">
                  <div
                    className="bg-brand h-full rounded-full transition-all duration-300 shadow-sm"
                    style={{ width: `${progressoPercent}%` }}
                  />
                </div>
              </div>

              {/* Métricas Rápidas */}
              <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                <div className="bg-surface p-3 rounded-lg border border-border">
                  <span className="text-slate-400 block text-[11px]">MOEDAS/PONTOS:</span>
                  <span className="text-lg font-bold text-amber-400">{usuario.pontos} pts</span>
                </div>
                <div className="bg-surface p-3 rounded-lg border border-border">
                  <span className="text-slate-400 block text-[11px]">EXERCÍCIOS:</span>
                  <span className="text-lg font-bold text-emerald-400">{totalExerciciosResolvidos} feitos</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Grade de Módulos de Estudo */}
        <section className="space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="font-serif text-2xl font-bold text-white">
                Módulos de Estudo Interativo
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm">
                Selecione um tópico para simular equações e testar seus conhecimentos
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
                  className="group bg-surface border border-border hover:border-brand hover:bg-surface-elevated rounded-xl p-6 transition-all duration-200 flex flex-col justify-between shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-slate-400">
                          {mod.indice}.
                        </span>
                        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                          {mod.subtitulo}
                        </span>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono border font-medium ${mod.corTag}`}>
                        {mod.tag}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-surface-highlight flex items-center justify-center text-brand">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-white group-hover:text-brand transition-colors">
                        {mod.titulo}
                      </h3>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed font-normal">
                      {mod.descricao}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between font-mono text-xs font-semibold text-brand">
                    <span>ACESSAR LABORATÓRIO</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Atalhos Rápidos para Loja e Ranking */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div className="bg-surface border border-border rounded-xl p-6 flex flex-col justify-between shadow-md">
            <div className="space-y-2">
              <span className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider">
                PERSONALIZAÇÃO DO PERFIL
              </span>
              <h3 className="font-serif text-xl font-bold text-white">Loja de Insígnias & Selos</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Utilize os pontos que você ganha ao resolver exercícios para desbloquear novos selos científicos para seu perfil.
              </p>
            </div>
            <Link
              to="/loja"
              className="mt-4 inline-flex items-center space-x-2 font-mono text-xs font-bold text-brand hover:underline"
            >
              <span>EXPLORAR INSÍGNIAS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 flex flex-col justify-between shadow-md">
            <div className="space-y-2">
              <span className="font-mono text-xs text-cyan-400 font-bold uppercase tracking-wider">
                COMUNIDADE ACADÊMICA
              </span>
              <h3 className="font-serif text-xl font-bold text-white">Ranking da Turma</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Veja o ranking dos estudantes por pontos de experiência (XP) acumulados na disciplina de Físico-Química.
              </p>
            </div>
            <Link
              to="/ranking"
              className="mt-4 inline-flex items-center space-x-2 font-mono text-xs font-bold text-brand hover:underline"
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
