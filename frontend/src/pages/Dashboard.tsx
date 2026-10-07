import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowUpRight } from 'lucide-react';
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
      <div className="min-h-screen bg-[#0e1013] flex items-center justify-center font-mono text-xs text-[#918b7e]">
        <span>INICIALIZANDO PLATAFORMA LAB QUÂNTICO...</span>
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
      titulo: 'Cinética Química e Decaimento de Reações',
      subtitulo: 'MODELO DETERMINÍSTICO DE 0ª E 1ª ORDEM',
      descricao: 'Resolução das equações diferenciais de taxa para decaimento de reagentes [A] e surgimento de produtos [B], com cômputo exato de meia-vida (t½) e tempo de vida médio (τ).',
      rota: '/cinetica',
      metrica: 'Simulação Analítica'
    },
    {
      indice: '02',
      titulo: 'Distribuição Estatística de Maxwell-Boltzmann',
      subtitulo: 'DINÂMICA MOLECULAR E ENERGIAS CINÉTICAS',
      descricao: 'Análise de velocidades moleculares f(v) e energias térmicas f(E) para gases nobres e diatômicos entre 100 K e 1500 K, calculando v_mp, v_média e v_rms.',
      rota: '/maxwell',
      metrica: 'Distribuição Contínua'
    },
    {
      indice: '03',
      titulo: 'Calorimetria Exploratória Diferencial (DSC)',
      subtitulo: 'INTEGRAÇÃO NUMÉRICA • SPLINE CÚBICO & SIMPSON',
      descricao: 'Determinação da entalpia calorimétrica (ΔH_cal) e temperatura de transição conformacional (Tm) da proteína Lisozima a partir de dados experimentais brutos.',
      rota: '/dsc',
      metrica: 'Análise Numérica'
    },
    {
      indice: '04',
      titulo: 'Caderno de Desafios e Quizzes Científicos',
      subtitulo: 'AVALIAÇÃO DE CONHECIMENTO & RECOMPENSAS',
      descricao: 'Resolução de problemas conceituais e numéricos baseados nas simulações gráficas para progressão de patente e obtenção de insígnias acadêmicas.',
      rota: '/exercicios',
      metrica: 'Pontuação Real'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0e1013] text-[#e5e2dc] pb-24">
      <Navbar usuario={usuario} />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 space-y-12">
        
        {/* Cabeçalho Editorial com Grid Rígido */}
        <section className="border border-[#1d2027] bg-[#14161b] p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Bloco Principal de Texto */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center space-x-3 text-xs font-mono text-[#c85a32]">
                <span>LAB QUÂNTICO</span>
                <span>/</span>
                <span className="text-[#918b7e]">DOSSIER DO PESQUISADOR</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl font-normal leading-[1.1] text-[#faf9f5]">
                Simulação Computacional de Fenômenos Físico-Químicos
              </h1>

              <p className="text-sm sm:text-base text-[#918b7e] leading-relaxed max-w-2xl font-sans">
                Ambiente interativo desenvolvido para modelagem rigorosa de cinética molecular, distribuições térmicas de gases e termodinâmica de biopolímeros.
              </p>
            </div>

            {/* Credencial do Usuário */}
            <div className="lg:col-span-4 border border-[#1d2027] bg-[#0e1013] p-5 space-y-4 font-mono text-xs">
              <div className="flex items-center space-x-3 pb-3 border-b border-[#1d2027]">
                <AvatarBadge avatarId={usuario.avatarId} size="lg" />
                <div>
                  <span className="block font-serif text-base text-[#faf9f5] font-normal">
                    {usuario.nomeCompleto}
                  </span>
                  <span className="block text-[11px] text-[#c85a32] italic font-serif">
                    {usuario.titulo}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#918b7e]">NÍVEL DE PESQUISA</span>
                  <span className="text-[#faf9f5] font-bold">NV. {nivel}</span>
                </div>
                <div className="w-full bg-[#1d2027] h-1">
                  <div
                    className="bg-[#c85a32] h-1 transition-all duration-500"
                    style={{ width: `${progressoPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#918b7e]">
                  <span>{xp} XP ACUMULADOS</span>
                  <span>META: {xpProximo} XP</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1d2027] text-[11px]">
                <div>
                  <span className="text-[#918b7e] block">CRÉDITOS:</span>
                  <span className="text-[#faf9f5] font-semibold">{usuario.pontos} PTS</span>
                </div>
                <div>
                  <span className="text-[#918b7e] block">DESAFIOS:</span>
                  <span className="text-[#faf9f5] font-semibold">{totalExerciciosResolvidos} RESOLVIDOS</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Grade de Módulos Científicos */}
        <section className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-[#1d2027] pb-3">
            <h2 className="font-serif text-2xl font-normal text-[#faf9f5]">
              Módulos de Investigação & Cálculo
            </h2>
            <span className="font-mono text-xs text-[#918b7e]">
              4 MÓDULOS ATIVOS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modulos.map((mod) => (
              <Link
                key={mod.indice}
                to={mod.rota}
                className="group border border-[#1d2027] bg-[#14161b] hover:border-[#c85a32] p-6 flex flex-col justify-between transition-colors duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-[#918b7e]">
                    <span className="text-[#c85a32] font-semibold">{mod.indice}</span>
                    <span className="tracking-wider uppercase">{mod.subtitulo}</span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl text-[#faf9f5] group-hover:text-[#c85a32] transition-colors">
                    {mod.titulo}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#918b7e] leading-relaxed">
                    {mod.descricao}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#1d2027] flex items-center justify-between font-mono text-xs">
                  <span className="text-[#5e594d]">{mod.metrica}</span>
                  <div className="flex items-center space-x-1 text-[#c85a32] group-hover:translate-x-0.5 transition-transform">
                    <span>ACESSAR MÓDULO</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Rodapé de Navegação Rápida / Acervo */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-[#1d2027] pt-8">
          <div className="border border-[#1d2027] p-6 bg-[#14161b] flex flex-col justify-between">
            <div className="space-y-2">
              <span className="font-mono text-xs text-[#c85a32] tracking-wider uppercase">GABINETE DE INSÍGNIAS</span>
              <h4 className="font-serif text-xl text-[#faf9f5]">Personalização Acadêmica</h4>
              <p className="text-xs text-[#918b7e] leading-relaxed">
                Utilize seus pontos de pesquisa obtidos na resolução de problemas para adquirir selos e insígnias para seu dossier.
              </p>
            </div>
            <Link
              to="/loja"
              className="mt-4 inline-flex items-center space-x-2 text-xs font-mono text-[#c85a32] hover:underline"
            >
              <span>ABRIR CATÁLOGO DE INSÍGNIAS</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="border border-[#1d2027] p-6 bg-[#14161b] flex flex-col justify-between">
            <div className="space-y-2">
              <span className="font-mono text-xs text-[#c85a32] tracking-wider uppercase">REGISTRO DA COMUNIDADE</span>
              <h4 className="font-serif text-xl text-[#faf9f5]">Tábua de Honra dos Pesquisadores</h4>
              <p className="text-xs text-[#918b7e] leading-relaxed">
                Consulte o índice de pontuação geral dos alunos e pesquisadores da Universidade Tiradentes.
              </p>
            </div>
            <Link
              to="/ranking"
              className="mt-4 inline-flex items-center space-x-2 text-xs font-mono text-[#c85a32] hover:underline"
            >
              <span>CONSULTAR CLASSIFICAÇÃO</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
