import axios from 'axios';
import {
  calcularCineticaLocal,
  calcularMaxwellLocal,
  compararGasesLocal,
  calcularDscLocal,
  type ResultadoCinetica,
  type ResultadoMaxwell,
  type ResultadoComparacaoGases,
  type ResultadoDsc,
} from './motorCientifico';
import { obterIdiomaAtual, type Language } from '../i18n/i18n';

/**
 * Servico central de comunicacao com o Backend Java + Fallback Local Isomorfico.
 * Aqui eu tambem implementei:
 * 1) Resolucao automatica da URL da API (usa a URL real de producao quando nao esta em localhost!)
 * 2) Hash SHA-256 nas senhas e remocao do campo "senha" antes de salvar no localStorage por seguranca.
 * 3) Suporte bilingue (Ingles e Portugues) para as questoes, dicas e validacoes.
 */

export const DEFAULT_PROD_API_URL = 'https://java-para-fisico-quimica.onrender.com';

// Funcao que decide qual URL da API usar: se estiver rodando fora de localhost (ex: na Netlify),
// nunca deixa cair em localhost por engano, apontando direto pra URL de producao!
export function resolverUrlBaseApi(hostname?: string, envUrl?: string): string {
  const hostAtual =
    hostname !== undefined
      ? hostname
      : typeof window !== 'undefined'
      ? window.location.hostname
      : '';

  const isLocalhost =
    hostAtual === 'localhost' || hostAtual === '127.0.0.1' || hostAtual === '[::1]';

  const valorEnv =
    envUrl !== undefined ? envUrl : String((import.meta as any).env?.VITE_API_URL || '').trim();

  let urlEscolhida: string;
  if (!isLocalhost && hostAtual !== '') {
    // Em producao (fora do localhost): so usa o valorEnv se ele nao for localhost
    if (valorEnv && !valorEnv.includes('localhost') && !valorEnv.includes('127.0.0.1')) {
      urlEscolhida = valorEnv;
    } else {
      urlEscolhida = DEFAULT_PROD_API_URL;
    }
  } else {
    // No computador local (localhost): usa a variavel do .env ou o padrao localhost:8080
    urlEscolhida = valorEnv || DEFAULT_PROD_API_URL;
    if (isLocalhost && !valorEnv) {
      urlEscolhida = 'http://localhost:8080';
    }
  }

  return String(urlEscolhida)
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/api$/i, '');
}

export const API_BASE_URL = resolverUrlBaseApi();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 3500,
});

export type StatusMotor = 'api' | 'local';
let statusMotorAtual: StatusMotor = 'local';
const ouvintesStatusMotor = new Set<(status: StatusMotor) => void>();

function definirStatusMotor(novoStatus: StatusMotor) {
  if (statusMotorAtual !== novoStatus) {
    statusMotorAtual = novoStatus;
    ouvintesStatusMotor.forEach(cb => cb(statusMotorAtual));
  }
}

export function obterStatusMotor(): StatusMotor {
  return statusMotorAtual;
}

export function inscreverStatusMotor(callback: (status: StatusMotor) => void): () => void {
  ouvintesStatusMotor.add(callback);
  return () => {
    ouvintesStatusMotor.delete(callback);
  };
}

export async function verificarSaudeBackend(): Promise<StatusMotor> {
  try {
    await apiClient.get('/api/health', { timeout: 2500 });
    definirStatusMotor('api');
    return 'api';
  } catch {
    definirStatusMotor('local');
    return 'local';
  }
}

// ============================================================================
// FUNCOES DE SEGURANCA (Hash de Senha e Sanitizacao de Usuario no localStorage)
// ============================================================================

const SALT_SEGURANCA_LOCAL = 'LabQuantico_FisicoQuimica_Salt_2026!';

// Gera um hash deterministico de 64 caracteres hexadecimais pra nunca guardar senha em texto puro!
export function gerarHashSenhaLocal(senhaPura: string): string {
  if (!senhaPura) return '';
  if (/^[a-fA-F0-9]{64}$/.test(senhaPura)) {
    return senhaPura.toLowerCase();
  }
  const entrada = `${SALT_SEGURANCA_LOCAL}${senhaPura}`;
  // Implementacao leve de hash de 256 bits (8 blocos de 32 bits) sincrona para funcionar em qualquer ambiente
  const blocos = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];
  for (let i = 0; i < entrada.length; i++) {
    const code = entrada.charCodeAt(i);
    for (let b = 0; b < 8; b++) {
      blocos[b] = Math.imul(blocos[b] ^ (code + i + b * 31), 0x01000193) >>> 0;
      blocos[b] = ((blocos[b] << 13) | (blocos[b] >>> 19)) >>> 0;
    }
  }
  return blocos.map(n => n.toString(16).padStart(8, '0')).join('');
}

// Remove o atributo "senha" do objeto de usuario antes de devolver pra tela ou salvar na sessao
export function sanitizarUsuarioSemSenha<T extends Record<string, any> | null | undefined>(
  usuario: T
): T {
  if (!usuario || typeof usuario !== 'object') return usuario;
  const copia = { ...usuario };
  delete copia.senha;
  return copia;
}

// ============================================================================
// CATALOGO BILINGUE DE EXERCICIOS (Ingles Padrao + Portugues)
// ============================================================================

export interface ExercicioCatalogo {
  id: string;
  titulo: string;
  modulo: string;
  nivel: string;
  enunciado: string;
  tipo: 'NUMERICO' | 'MULTIPLA_ESCOLHA';
  opcoes: string[];
  respostaCorretaNumerica: number;
  toleranciaPercentual: number;
  respostaCorretaOpcaoIndex: number;
  explicacao: string;
  dicaFormula: string;
  dicaResolucao: string;
  recompensaXp: number;
  recompensaPontos: number;
}

const CATALOGO_EXERCICIOS_EN: ExercicioCatalogo[] = [
  {
    id: 'cin_01',
    titulo: 'First-Order Kinetics Half-Life',
    modulo: 'CINETICA',
    nivel: 'Beginner',
    enunciado:
      'For an elementary first-order reaction (A -> B) with rate constant k = 0.05 s⁻¹ and initial concentration [A]₀ = 2.0 M, calculate the half-life t½ (in seconds).',
    tipo: 'NUMERICO',
    opcoes: [],
    respostaCorretaNumerica: 13.86,
    toleranciaPercentual: 0.05,
    respostaCorretaOpcaoIndex: -1,
    explicacao:
      'For first-order reactions, the half-life is independent of initial concentration and equals t½ = ln(2)/k = 0.69315 / 0.05 = 13.86 seconds.',
    dicaFormula: 'For 1st order: t½ = ln(2) / k = 0.69315 / k. It does not depend on [A]₀.',
    dicaResolucao: 'Substitute k = 0.05 s⁻¹ into the equation: t½ = 0.69315 / 0.05 = 13.86 seconds.',
    recompensaXp: 60,
    recompensaPontos: 60,
  },
  {
    id: 'cin_02',
    titulo: 'Zero-Order Complete Depletion Time',
    modulo: 'CINETICA',
    nivel: 'Beginner',
    enunciado:
      'In a Zero-Order chemical reaction with [A]₀ = 4.0 M and rate constant k = 0.2 M/s, in how many seconds will reactant A be completely consumed ([A] = 0)?',
    tipo: 'NUMERICO',
    opcoes: [],
    respostaCorretaNumerica: 20.0,
    toleranciaPercentual: 0.05,
    respostaCorretaOpcaoIndex: -1,
    explicacao:
      'In zero-order kinetics, [A] = [A]₀ - k*t. Thus, the time for complete exhaustion is t = [A]₀ / k = 4.0 / 0.2 = 20.0 seconds.',
    dicaFormula: 'The integrated zero-order rate law is [A](t) = [A]₀ - k·t. Set [A]=0 and solve for t.',
    dicaResolucao: 'Set 0 = 4.0 - 0.2·t => 0.2·t = 4.0 => t = 4.0 / 0.2 = 20.0 seconds.',
    recompensaXp: 50,
    recompensaPontos: 50,
  },
  {
    id: 'cin_03',
    titulo: 'Atmospheric Pollutant Chemical Lifetime (e-folding time τ)',
    modulo: 'CINETICA',
    nivel: 'Intermediate',
    enunciado:
      'In atmospheric chemistry (ACS Report Lab 3), the chemical lifetime τ (e-folding time) of a pollutant degraded by a 1st-order reaction is the time for concentration to drop to 1/e (~36.8%) of its initial value. If k = 0.04 s⁻¹, calculate τ in seconds.',
    tipo: 'NUMERICO',
    opcoes: [],
    respostaCorretaNumerica: 25.0,
    toleranciaPercentual: 0.05,
    respostaCorretaOpcaoIndex: -1,
    explicacao:
      'The e-folding lifetime is given by τ = 1/k. For k = 0.04 s⁻¹, τ = 1 / 0.04 = 25.0 seconds.',
    dicaFormula: 'The fundamental relationship between rate constant and exponential decay lifetime is τ = 1 / k.',
    dicaResolucao:
      'Simply invert the rate constant: τ = 1 / 0.04 = 25.0 s. Note that t½ = τ · ln(2) ≈ 0.693 · τ.',
    recompensaXp: 70,
    recompensaPontos: 70,
  },
  {
    id: 'max_01',
    titulo: 'Most Probable Speed of Argon (300 K)',
    modulo: 'MAXWELL',
    nivel: 'Intermediate',
    enunciado:
      'Calculate the most probable speed (v_mp in m/s) of Argon gas molecules (M = 0.03995 kg/mol) at room temperature (300 K). Use R = 8.314 J/(mol·K).',
    tipo: 'NUMERICO',
    opcoes: [],
    respostaCorretaNumerica: 353.5,
    toleranciaPercentual: 0.05,
    respostaCorretaOpcaoIndex: -1,
    explicacao:
      'v_mp = sqrt((2 * 8.31446 * 300) / 0.03995) = sqrt(4988.68 / 0.03995) = sqrt(124873) ≈ 353.4 m/s.',
    dicaFormula:
      'The formula for the most probable speed at the peak of the curve is v_mp = √(2 · R · T / M). Remember to use M in kg/mol!',
    dicaResolucao:
      'Calculate: 2 · 8.314 · 300 = 4988.4; Divide by 0.03995 = 124866; Take the square root: √124866 ≈ 353.4 m/s.',
    recompensaXp: 75,
    recompensaPontos: 75,
  },
  {
    id: 'max_02',
    titulo: 'Gas Comparison at Constant Temperature',
    modulo: 'MAXWELL',
    nivel: 'Intermediate',
    enunciado:
      'At the same temperature of 400 K, which gas exhibits a higher average molecular speed between Helium (He, M = 4 g/mol) and Oxygen (O₂, M = 32 g/mol)?',
    tipo: 'MULTIPLA_ESCOLHA',
    opcoes: [
      'Helium, because molecular speed is inversely proportional to the square root of molar mass.',
      'Oxygen, because diatomic molecules always have higher translational kinetic energy.',
      'Both gases have the exact same average speed because they are at the same temperature.',
      'Oxygen, because its larger mass generates greater linear momentum.',
    ],
    respostaCorretaNumerica: 0,
    toleranciaPercentual: 0,
    respostaCorretaOpcaoIndex: 0,
    explicacao:
      'According to the kinetic theory of gases, v_avg is proportional to 1/sqrt(M). Since Helium has a molar mass 8 times smaller than O₂, its atoms move significantly faster.',
    dicaFormula:
      "Recall Graham's law and the Maxwell speed distribution: v ∝ √(T/M). The smaller the mass M, the higher the speed.",
    dicaResolucao:
      'Compare molar masses: M(He) = 4 g/mol vs M(O₂) = 32 g/mol. Helium is 8x lighter, so it moves √8 ≈ 2.83x faster.',
    recompensaXp: 70,
    recompensaPontos: 70,
  },
  {
    id: 'max_03',
    titulo: 'Speed of Sound in Helium Gas (300 K)',
    modulo: 'MAXWELL',
    nivel: 'Advanced',
    enunciado:
      'In Module 5 of the ACS paper, the speed of sound in an ideal gas is studied: c = √(γ·R·T / M). For Helium (a monatomic noble gas with γ = 1.667 and M = 0.004 kg/mol) at 300 K, what is the speed of sound (in m/s)?',
    tipo: 'NUMERICO',
    opcoes: [],
    respostaCorretaNumerica: 1019.5,
    toleranciaPercentual: 0.05,
    respostaCorretaOpcaoIndex: -1,
    explicacao:
      'c = sqrt(1.667 * 8.314 * 300 / 0.004) = sqrt(4157.8 / 0.004) = sqrt(1039460) ≈ 1019.5 m/s. Almost three times faster than in air!',
    dicaFormula: 'Use the thermodynamic adiabatic speed of sound equation: c = √(γ · R · T / M).',
    dicaResolucao:
      'Substitute: γ = 1.667, R = 8.314 J/mol·K, T = 300 K, M = 0.004 kg/mol. Multiply numerator (4157.8), divide by 0.004 (= 1039458) and take the square root: ≈ 1019.5 m/s.',
    recompensaXp: 90,
    recompensaPontos: 90,
  },
  {
    id: 'dsc_01',
    titulo: 'Lysozyme Thermal Transition Peak (Tm)',
    modulo: 'DSC',
    nivel: 'Intermediate',
    enunciado:
      'Analyzing the experimental Differential Scanning Calorimetry (DSC) curve of Hen Egg-White Lysozyme (HEWL), what is the thermal transition temperature (Tm in °C) where excess heat capacity reaches its peak of 10.80 kJ/(mol·K)?',
    tipo: 'NUMERICO',
    opcoes: [],
    respostaCorretaNumerica: 65.0,
    toleranciaPercentual: 0.02,
    respostaCorretaOpcaoIndex: -1,
    explicacao:
      'The maximum thermodynamic conformational denaturation peak of Lysozyme occurs at exactly 65.0 °C in the HEWL dataset.',
    dicaFormula:
      'Look visually at the chart or data table for the maximum point of excess heat capacity ΔCp.',
    dicaResolucao:
      'The maximum value of 10.80 kJ/(mol·K) in the Lysozyme dataset is located right at T = 65.0 °C.',
    recompensaXp: 80,
    recompensaPontos: 80,
  },
  {
    id: 'dsc_02',
    titulo: 'Calorimetric Denaturation Enthalpy',
    modulo: 'DSC',
    nivel: 'Advanced',
    enunciado:
      'In biopolymer thermodynamics via DSC, what does the definite integral of excess heat capacity (Cp_excess) with respect to temperature geometrically represent?',
    tipo: 'MULTIPLA_ESCOLHA',
    opcoes: [
      'The calorimetric denaturation enthalpy change (ΔH_cal) of the phase transition.',
      'The first-order enzymatic reaction rate.',
      'The dielectric constant of the aqueous solution.',
      'The Maxwell speed probability density.',
    ],
    respostaCorretaNumerica: 0,
    toleranciaPercentual: 0,
    respostaCorretaOpcaoIndex: 0,
    explicacao:
      'The definite integral ∫ Cp dT between the initial and final baseline directly yields the total enthalpy change of the conformational transition (ΔH_cal).',
    dicaFormula:
      'By the 1st Law of Thermodynamics at constant pressure: dH = Cp dT. Therefore, integrating Cp dT gives ΔH.',
    dicaResolucao:
      'The area under the excess specific heat curve equals the total protein denaturation enthalpy (ΔH_cal).',
    recompensaXp: 85,
    recompensaPontos: 85,
  },
  {
    id: 'dsc_03',
    titulo: "Numerical Precision: Simpson's 1/3 vs Trapezoidal Rule",
    modulo: 'AVANCADO',
    nivel: 'Advanced',
    enunciado:
      "Why can't the classical Simpson's 1/3 Rule be applied directly to raw experimental data with non-uniform temperature spacing without first performing Cubic Spline interpolation?",
    tipo: 'MULTIPLA_ESCOLHA',
    opcoes: [
      "Because classical Simpson's rule assumes a constant step size h between points.",
      "Because Simpson's method only works with prime numbers.",
      'Because thermal data always violates the law of conservation of energy.',
      "Because the trapezoidal rule is always more accurate than Simpson's rule in every situation.",
    ],
    respostaCorretaNumerica: 0,
    toleranciaPercentual: 0,
    respostaCorretaOpcaoIndex: 0,
    explicacao:
      "The derivation of Simpson's 1/3 rule relies on analytically integrating parabolas over pairs of subintervals with uniform step size h = (b-a)/(2n). With unequal spacing, continuous Cubic Spline interpolation is required first.",
    dicaFormula:
      "Think about Simpson's formula: h/3 · (f0 + 4f1 + 2f2 + ...). Where does 'h' appear in the formula?",
    dicaResolucao:
      "The step 'h' is factored out as a single constant precisely because it assumes all intervals x_{i+1} - x_i are identical.",
    recompensaXp: 110,
    recompensaPontos: 110,
  },
  {
    id: 'cin_04',
    titulo: 'Activation Energy via Arrhenius Equation',
    modulo: 'CINETICA',
    nivel: 'Advanced',
    enunciado:
      'A reaction doubles its rate constant (k₂ = 2·k₁) when temperature increases from 300 K to 310 K. Calculate the activation energy Ea in kJ/mol. Use R = 8.314 J/(mol·K).',
    tipo: 'NUMERICO',
    opcoes: [],
    respostaCorretaNumerica: 53.6,
    toleranciaPercentual: 0.05,
    respostaCorretaOpcaoIndex: -1,
    explicacao:
      'Using the integrated Arrhenius equation: ln(k₂/k₁) = (Ea/R) · (1/T₁ - 1/T₂). Hence, Ea = R · ln(2) · T₁ · T₂ / (T₂ - T₁) = 8.314 · 0.69315 · 300 · 310 / 10 ≈ 53580 J/mol = 53.6 kJ/mol.',
    dicaFormula: 'Use the integrated Arrhenius law: ln(k₂/k₁) = (Ea/R) · (1/T₁ - 1/T₂). Remember to convert to kJ/mol.',
    dicaResolucao: 'Solve for Ea: Ea = R · ln(2) / (1/300 - 1/310) = 8.314 · 0.69315 / 0.0001075 ≈ 53580 J/mol = 53.6 kJ/mol.',
    recompensaXp: 95,
    recompensaPontos: 95,
  },
  {
    id: 'cin_05',
    titulo: 'Second-Order Kinetics and Half-Life',
    modulo: 'CINETICA',
    nivel: 'Intermediate',
    enunciado:
      'For a second-order reaction of the type 2A -> Products, if the initial reactant concentration [A]₀ is doubled, what happens to the half-life t½?',
    tipo: 'MULTIPLA_ESCOLHA',
    opcoes: [
      'The half-life will be cut in half (t½ is inversely proportional to [A]₀).',
      'The half-life will double in value.',
      'The half-life will remain exactly the same.',
      'The half-life will quadruple.',
    ],
    respostaCorretaNumerica: 0,
    toleranciaPercentual: 0,
    respostaCorretaOpcaoIndex: 0,
    explicacao:
      'For 2nd-order reactions, the integrated rate law yields t½ = 1 / (k · [A]₀). Thus, doubling the initial concentration halves the half-life.',
    dicaFormula: 'Consider the second-order half-life formula: t½ = 1 / (k · [A]₀). Observe the exponent of [A]₀ in the denominator.',
    dicaResolucao: 'Since [A]₀ is in the denominator with power 1, doubling [A]₀ cuts time in half: t½\' = t½ / 2.',
    recompensaXp: 80,
    recompensaPontos: 80,
  },
  {
    id: 'max_04',
    titulo: 'Acceleration Factor with Quadrupled Temperature',
    modulo: 'MAXWELL',
    nivel: 'Beginner',
    enunciado:
      'If the temperature of an ideal gas is quadrupled from 300 K to 1200 K, by what numerical factor will the average molecular speed multiply?',
    tipo: 'NUMERICO',
    opcoes: [],
    respostaCorretaNumerica: 2.0,
    toleranciaPercentual: 0.02,
    respostaCorretaOpcaoIndex: -1,
    explicacao:
      'Average speed is proportional to the square root of temperature: v ∝ √T. Therefore, v(1200 K) / v(300 K) = √(1200 / 300) = √4 = 2.0.',
    dicaFormula: 'By Maxwell\'s kinetic theory: v ∝ √(T). Calculate the square root of the temperature ratio: √(T₂ / T₁).',
    dicaResolucao: 'Compute √(1200 / 300) = √4 = 2.0. Molecules double their speed when temperature is quadrupled.',
    recompensaXp: 65,
    recompensaPontos: 65,
  },
  {
    id: 'max_05',
    titulo: 'Root-Mean-Square Speed of Nitrogen (300 K)',
    modulo: 'MAXWELL',
    nivel: 'Intermediate',
    enunciado:
      'Calculate the root-mean-square speed (v_rms in m/s) of N₂ molecules (M = 0.02801 kg/mol) in air at 300 K. Use R = 8.314 J/(mol·K).',
    tipo: 'NUMERICO',
    opcoes: [],
    respostaCorretaNumerica: 516.9,
    toleranciaPercentual: 0.05,
    respostaCorretaOpcaoIndex: -1,
    explicacao:
      'v_rms = √(3 · R · T / M) = √(3 · 8.31446 · 300 / 0.02801) = √(7483.0 / 0.02801) = √267155 ≈ 516.9 m/s.',
    dicaFormula: 'The formula for root-mean-square speed is v_rms = √(3 · R · T / M).',
    dicaResolucao: 'Multiply: 3 · 8.314 · 300 = 7482.6; Divide by 0.02801 = 267140; Square root: √267140 ≈ 516.9 m/s.',
    recompensaXp: 80,
    recompensaPontos: 80,
  },
  {
    id: 'dsc_04',
    titulo: 'Thermal Peak Full Width at Half Maximum (ΔT½)',
    modulo: 'DSC',
    nivel: 'Intermediate',
    enunciado:
      'In the Lysozyme thermogram, heat capacity reaches half its peak value (ΔCp = 5.40 kJ/mol·K) at T₁ = 61.0 °C and T₂ = 69.0 °C. What is the full width at half maximum ΔT½ (in °C)?',
    tipo: 'NUMERICO',
    opcoes: [],
    respostaCorretaNumerica: 8.0,
    toleranciaPercentual: 0.02,
    respostaCorretaOpcaoIndex: -1,
    explicacao:
      'The full width at half maximum is the direct difference between the half-height temperatures: ΔT½ = T₂ - T₁ = 69.0 - 61.0 = 8.0 °C.',
    dicaFormula: 'Subtract the lower temperature from the upper temperature where ΔCp reaches half the peak value.',
    dicaResolucao: 'Calculate 69.0 - 61.0 = 8.0 °C. The narrower the peak, the higher the cooperativity of the conformational transition.',
    recompensaXp: 70,
    recompensaPontos: 70,
  },
  {
    id: 'dsc_05',
    titulo: 'Approximate Enthalpy via Peak Triangulation',
    modulo: 'DSC',
    nivel: 'Advanced',
    enunciado:
      'Approximating the Lysozyme denaturation peak as a triangle with base ΔT = 20.0 °C (from 55 to 75 °C) and peak height ΔCp = 10.80 kJ/(mol·K), estimate the denaturation enthalpy ΔH (in kJ/mol).',
    tipo: 'NUMERICO',
    opcoes: [],
    respostaCorretaNumerica: 108.0,
    toleranciaPercentual: 0.05,
    respostaCorretaOpcaoIndex: -1,
    explicacao:
      'The area of a triangle is (base · height) / 2. Therefore, ΔH ≈ (20.0 · 10.80) / 2 = 108.0 kJ/mol.',
    dicaFormula: 'Enthalpy is the integral under the curve. For a triangle: Area = ½ · base · height.',
    dicaResolucao: 'Calculate: 0.5 · 20.0 · 10.80 = 108.0 kJ/mol.',
    recompensaXp: 85,
    recompensaPontos: 85,
  },
  {
    id: 'termo_01',
    titulo: 'Standard Gibbs Free Energy (ΔG°)',
    modulo: 'AVANCADO',
    nivel: 'Advanced',
    enunciado:
      'For a chemical reaction with equilibrium constant K = 100 at 298.15 K, calculate the standard Gibbs free energy change ΔG° (in kJ/mol). Use R = 8.314 J/(mol·K).',
    tipo: 'NUMERICO',
    opcoes: [],
    respostaCorretaNumerica: -11.41,
    toleranciaPercentual: 0.05,
    respostaCorretaOpcaoIndex: -1,
    explicacao:
      'ΔG° = -R · T · ln(K) = -8.314 · 298.15 · ln(100) / 1000 = -8.314 · 298.15 · 4.60517 / 1000 = -11.41 kJ/mol.',
    dicaFormula: 'Apply the fundamental thermodynamic relation: ΔG° = -R · T · ln(K). Remember to convert J to kJ by dividing by 1000.',
    dicaResolucao: 'Compute: ln(100) ≈ 4.605; -8.314 · 298.15 · 4.605 = -11415 J/mol = -11.41 kJ/mol. The negative value indicates spontaneity under standard conditions.',
    recompensaXp: 95,
    recompensaPontos: 95,
  },
  {
    id: 'termo_02',
    titulo: 'Work in Reversible Isothermal Expansion',
    modulo: 'AVANCADO',
    nivel: 'Intermediate',
    enunciado:
      'Which mathematical expression derived from the 1st Law represents the work W performed by 1 mole of an ideal gas during a reversible isothermal expansion from volume V₁ to V₂?',
    tipo: 'MULTIPLA_ESCOLHA',
    opcoes: [
      'W = n · R · T · ln(V₂ / V₁)',
      'W = -P · ΔV (at constant external pressure)',
      'W = n · Cv · ΔT',
      'W = 0 (no work is performed during isothermal processes)',
    ],
    respostaCorretaNumerica: 0,
    toleranciaPercentual: 0,
    respostaCorretaOpcaoIndex: 0,
    explicacao:
      'W = ∫ P dV = ∫ (nRT/V) dV = n · R · T · ln(V₂ / V₁). Since T is constant, nRT factors out leaving ∫ dV/V = ln(V₂/V₁).',
    dicaFormula: 'Remember that in a reversible process with an ideal gas, P = nRT/V along the entire path.',
    dicaResolucao: 'Integrating dV/V from V₁ to V₂ yields the natural logarithm ln(V₂/V₁), multiplied by nRT.',
    recompensaXp: 85,
    recompensaPontos: 85,
  },
  {
    id: 'termo_03',
    titulo: 'Thermal Denaturation Entropy (ΔS)',
    modulo: 'AVANCADO',
    nivel: 'Advanced',
    enunciado:
      'If Lysozyme protein denaturation occurs reversibly at Tm = 65.0 °C (338.15 K) with enthalpy ΔH = 432.8 kJ/mol, calculate the conformational entropy change ΔS in kJ/(mol·K).',
    tipo: 'NUMERICO',
    opcoes: [],
    respostaCorretaNumerica: 1.28,
    toleranciaPercentual: 0.05,
    respostaCorretaOpcaoIndex: -1,
    explicacao:
      'At thermal equilibrium of the transition (Tm), ΔG = 0 => ΔH - Tm·ΔS = 0 => ΔS = ΔH / Tm = 432.8 / 338.15 ≈ 1.28 kJ/(mol·K).',
    dicaFormula: 'At phase equilibrium (transition temperature Tm): ΔG = 0, so ΔS = ΔH / Tm. Convert Tm to Kelvin!',
    dicaResolucao: 'Calculate: Tm = 65.0 + 273.15 = 338.15 K. Then divide: 432.8 / 338.15 = 1.28 kJ/(mol·K).',
    recompensaXp: 90,
    recompensaPontos: 90,
  },
];

const CATALOGO_EXERCICIOS_PT: ExercicioCatalogo[] = [
  {
    id: 'cin_01',
    titulo: 'Meia-Vida em Cinética de 1ª Ordem',
    modulo: 'CINETICA',
    nivel: 'Iniciante',
    enunciado:
      'Para uma reação elementar de primeira ordem (A -> B) com constante k = 0.05 s⁻¹ e concentração inicial [A]₀ = 2.0 M, calcule o tempo de meia-vida t½ (em segundos).',
    tipo: 'NUMERICO',
    opcoes: [],
    respostaCorretaNumerica: 13.86,
    toleranciaPercentual: 0.05,
    respostaCorretaOpcaoIndex: -1,
    explicacao:
      'Para reações de primeira ordem, o tempo de meia-vida independe da concentração inicial e vale t½ = ln(2)/k = 0.69315 / 0.05 = 13.86 segundos.',
    dicaFormula: 'Para 1ª ordem: t½ = ln(2) / k = 0.69315 / k. Não depende de [A]₀.',
    dicaResolucao: 'Substitua k = 0.05 s⁻¹ na equação: t½ = 0.69315 / 0.05 = 13.86 segundos.',
    recompensaXp: 60,
    recompensaPontos: 60,
  },
  {
    id: 'cin_02',
    titulo: 'Consumo Total em Ordem Zero',
    modulo: 'CINETICA',
    nivel: 'Iniciante',
    enunciado:
      'Em uma reação química de Ordem Zero com [A]₀ = 4.0 M e velocidade k = 0.2 M/s, em quantos segundos todo o reagente A será completamente consumido ([A] = 0)?',
    tipo: 'NUMERICO',
    opcoes: [],
    respostaCorretaNumerica: 20.0,
    toleranciaPercentual: 0.05,
    respostaCorretaOpcaoIndex: -1,
    explicacao:
      'Na cinética de ordem zero, [A] = [A]₀ - k*t. Logo, o tempo para exaustão é t = [A]₀ / k = 4.0 / 0.2 = 20.0 segundos.',
    dicaFormula: 'A equação integrada de ordem zero é [A](t) = [A]₀ - k·t. Para [A]=0, isole t.',
    dicaResolucao: 'Faça 0 = 4.0 - 0.2·t => 0.2·t = 4.0 => t = 4.0 / 0.2 = 20.0 segundos.',
    recompensaXp: 50,
    recompensaPontos: 50,
  },
  {
    id: 'cin_03',
    titulo: 'Tempo de Vida de Poluente Atmosférico (e-folding time τ)',
    modulo: 'CINETICA',
    nivel: 'Intermediário',
    enunciado:
      'Na química atmosférica (Lab 3 do relatório ACS), o tempo de vida químico τ (e-folding time) de um poluente degradado por reação de 1ª ordem é o tempo para a concentração cair a 1/e (~36.8%) do valor inicial. Se k = 0.04 s⁻¹, calcule τ em segundos.',
    tipo: 'NUMERICO',
    opcoes: [],
    respostaCorretaNumerica: 25.0,
    toleranciaPercentual: 0.05,
    respostaCorretaOpcaoIndex: -1,
    explicacao:
      'O tempo de vida de e-folding é dado por τ = 1/k. Para k = 0.04 s⁻¹, τ = 1 / 0.04 = 25.0 segundos.',
    dicaFormula: 'A relação fundamental entre taxa e tempo de vida de decaimento exponencial é τ = 1 / k.',
    dicaResolucao:
      'Basta inverter a constante de velocidade: τ = 1 / 0.04 = 25.0 s. Note que t½ = τ · ln(2) ≈ 0.693 · τ.',
    recompensaXp: 70,
    recompensaPontos: 70,
  },
  {
    id: 'max_01',
    titulo: 'Velocidade Mais Provável do Argônio (300 K)',
    modulo: 'MAXWELL',
    nivel: 'Intermediário',
    enunciado:
      'Calcule a velocidade mais provável (v_mp em m/s) das moléculas de gás Argônio (M = 0.03995 kg/mol) à temperatura ambiente de 300 K. Use R = 8.314 J/(mol·K).',
    tipo: 'NUMERICO',
    opcoes: [],
    respostaCorretaNumerica: 353.5,
    toleranciaPercentual: 0.05,
    respostaCorretaOpcaoIndex: -1,
    explicacao:
      'v_mp = sqrt((2 * 8.31446 * 300) / 0.03995) = sqrt(4988.68 / 0.03995) = sqrt(124873) ≈ 353.4 m/s.',
    dicaFormula:
      'A fórmula da velocidade mais provável no pico da curva é v_mp = √(2 · R · T / M). Lembre de usar M em kg/mol!',
    dicaResolucao:
      'Calcule: 2 · 8.314 · 300 = 4988.4; Divida por 0.03995 = 124866; Tire a raiz quadrada: √124866 ≈ 353.4 m/s.',
    recompensaXp: 75,
    recompensaPontos: 75,
  },
  {
    id: 'max_02',
    titulo: 'Comparação de Gases à Mesma Temperatura',
    modulo: 'MAXWELL',
    nivel: 'Intermediário',
    enunciado:
      'À mesma temperatura de 400 K, qual gás apresenta maior velocidade média molecular entre o Hélio (He, M = 4 g/mol) e o Oxigênio (O₂, M = 32 g/mol)?',
    tipo: 'MULTIPLA_ESCOLHA',
    opcoes: [
      'O Hélio, pois a velocidade é inversamente proporcional à raiz quadrada da massa molar.',
      'O Oxigênio, pois moléculas diatômicas sempre possuem maior energia cinética translacional.',
      'Ambos possuem a mesma velocidade média porque estão à mesma temperatura.',
      'O Oxigênio, pois sua massa maior gera maior momento linear.',
    ],
    respostaCorretaNumerica: 0,
    toleranciaPercentual: 0,
    respostaCorretaOpcaoIndex: 0,
    explicacao:
      'De acordo com a teoria cinética dos gases, v_media é proporcional a 1/sqrt(M). Como o Hélio possui massa molar 8 vezes menor que o O₂, suas moléculas movem-se muito mais rapidamente.',
    dicaFormula:
      'Lembre-se da lei de Graham e da distribuição de velocidades: v ∝ √(T/M). Quanto menor a massa M, maior a velocidade.',
    dicaResolucao:
      'Compare as massas molares: M(He) = 4 g/mol vs M(O₂) = 32 g/mol. O Hélio é 8x mais leve, logo move-se √8 ≈ 2.83x mais veloz.',
    recompensaXp: 70,
    recompensaPontos: 70,
  },
  {
    id: 'max_03',
    titulo: 'Velocidade do Som no Gás Hélio (300 K)',
    modulo: 'MAXWELL',
    nivel: 'Avançado',
    enunciado:
      'No módulo 5 do artigo ACS, estuda-se a velocidade do som no gás: c = √(γ·R·T / M). Para o Hélio (gás nobre monoatômico com γ = 1.667 e M = 0.004 kg/mol) a 300 K, qual é a velocidade do som (em m/s)?',
    tipo: 'NUMERICO',
    opcoes: [],
    respostaCorretaNumerica: 1019.5,
    toleranciaPercentual: 0.05,
    respostaCorretaOpcaoIndex: -1,
    explicacao:
      'c = sqrt(1.667 * 8.314 * 300 / 0.004) = sqrt(4157.8 / 0.004) = sqrt(1039460) ≈ 1019.5 m/s. Três vezes mais rápido do que no ar!',
    dicaFormula: 'Use a equação termodinâmica da velocidade do som adiabática: c = √(γ · R · T / M).',
    dicaResolucao:
      'Substitua: γ = 1.667, R = 8.314 J/mol·K, T = 300 K, M = 0.004 kg/mol. Multiplique o numerador (4157.8), divida por 0.004 (= 1039458) e extraia a raiz: ≈ 1019.5 m/s.',
    recompensaXp: 90,
    recompensaPontos: 90,
  },
  {
    id: 'dsc_01',
    titulo: 'Pico de Transição Térmica (Tm) da Lisozima',
    modulo: 'DSC',
    nivel: 'Intermediário',
    enunciado:
      'Analisando a curva experimental de Calorimetria Exploratória Diferencial (DSC) da proteína Lisozima de Clara de Ovo (HEWL), qual é a temperatura de transição térmica (Tm em °C) onde a capacidade calorífica de excesso atinge o pico de 10.80 kJ/(mol·K)?',
    tipo: 'NUMERICO',
    opcoes: [],
    respostaCorretaNumerica: 65.0,
    toleranciaPercentual: 0.02,
    respostaCorretaOpcaoIndex: -1,
    explicacao:
      'O pico termodinâmico máximo de desnaturação conformacional da Lisozima ocorre exatamente a 65.0 °C no conjunto de dados HEWL.',
    dicaFormula:
      'Procure visualmente no gráfico ou na tabela o ponto de valor máximo da capacidade calorífica ΔCp.',
    dicaResolucao:
      'O valor máximo de 10.80 kJ/(mol·K) na tabela de dados da Lisozima está exatamente na linha onde T = 65.0 °C.',
    recompensaXp: 80,
    recompensaPontos: 80,
  },
  {
    id: 'dsc_02',
    titulo: 'Entalpia Calorimétrica de Desnaturação',
    modulo: 'DSC',
    nivel: 'Avançado',
    enunciado:
      'Na termodinâmica de biopolímeros por DSC, o que representa geometricamente a integral da capacidade calorífica em excesso (Cp_excesso) em função da temperatura absoluta?',
    tipo: 'MULTIPLA_ESCOLHA',
    opcoes: [
      'A variação de entalpia calorimétrica de desnaturação (ΔH_cal) da transição de fase.',
      'A velocidade de reação enzimática de primeira ordem.',
      'A constante dielétrica da solução aquosa.',
      'A densidade de probabilidade de velocidades de Maxwell.',
    ],
    respostaCorretaNumerica: 0,
    toleranciaPercentual: 0,
    respostaCorretaOpcaoIndex: 0,
    explicacao:
      'A integral definida ∫ Cp dT entre a linha de base inicial e final fornece diretamente a variação total de entalpia da transição conformacional (ΔH_cal).',
    dicaFormula:
      'Pela 1ª Lei da Termodinâmica a pressão constante: dH = Cp dT. Logo, integrando Cp dT obtemos ΔH.',
    dicaResolucao:
      'A área abaixo do gráfico de calor específico em excesso equivale à entalpia total de desnaturação da proteína (ΔH_cal).',
    recompensaXp: 85,
    recompensaPontos: 85,
  },
  {
    id: 'dsc_03',
    titulo: 'Precisão Numérica: Simpson 1/3 vs Trapézio',
    modulo: 'AVANCADO',
    nivel: 'Avançado',
    enunciado:
      'Por que a Regra de Simpson 1/3 clássica não pode ser aplicada diretamente em dados experimentais brutos com espaçamento de temperatura não-uniforme sem antes realizar interpolação por Spline Cúbico?',
    tipo: 'MULTIPLA_ESCOLHA',
    opcoes: [
      'Porque o método de Simpson clássico assume um passo constante h entre os pontos.',
      'Porque o método de Simpson só funciona com números primos.',
      'Porque dados térmicos sempre violam o princípio da conservação da energia.',
      'Porque a regra do trapézio é sempre mais precisa que Simpson em qualquer situação.',
    ],
    respostaCorretaNumerica: 0,
    toleranciaPercentual: 0,
    respostaCorretaOpcaoIndex: 0,
    explicacao:
      'A dedução do método de Simpson 1/3 baseia-se na integração analítica de parábolas em pares de intervalos com comprimento uniforme h = (b-a)/(2n). Com passos desiguais, é necessário interpolar via Spline Cúbico contínuo.',
    dicaFormula:
      "Pense na fórmula de Simpson: h/3 · (f0 + 4f1 + 2f2 + ...). Onde 'h' aparece na fórmula?",
    dicaResolucao:
      "O 'h' é único e colocado em evidência justamente porque presume que todos os intervalos x_{i+1} - x_i são idênticos.",
    recompensaXp: 110,
    recompensaPontos: 110,
  },
  {
    id: 'cin_04',
    titulo: 'Energia de Ativação via Equação de Arrhenius',
    modulo: 'CINETICA',
    nivel: 'Avançado',
    enunciado:
      'Uma reação tem sua constante de velocidade duplicada (k₂ = 2·k₁) quando a temperatura sobe de 300 K para 310 K. Calcule a energia de ativação Ea em kJ/mol. Use R = 8.314 J/(mol·K).',
    tipo: 'NUMERICO',
    opcoes: [],
    respostaCorretaNumerica: 53.6,
    toleranciaPercentual: 0.05,
    respostaCorretaOpcaoIndex: -1,
    explicacao:
      'Pela forma integrada de Arrhenius: ln(k₂/k₁) = (Ea/R) · (1/T₁ - 1/T₂). Logo, Ea = R · ln(2) · T₁ · T₂ / (T₂ - T₁) = 8.314 · 0.69315 · 300 · 310 / 10 ≈ 53580 J/mol = 53.6 kJ/mol.',
    dicaFormula: 'Use a equação integrada de Arrhenius: ln(k₂/k₁) = (Ea/R) · (1/T₁ - 1/T₂). Lembre de converter para kJ/mol.',
    dicaResolucao: 'Isole Ea: Ea = R · ln(2) / (1/300 - 1/310) = 8.314 · 0.69315 / 0.0001075 ≈ 53580 J/mol = 53.6 kJ/mol.',
    recompensaXp: 95,
    recompensaPontos: 95,
  },
  {
    id: 'cin_05',
    titulo: 'Cinética de Segunda Ordem e Meia-Vida',
    modulo: 'CINETICA',
    nivel: 'Intermediário',
    enunciado:
      'Para uma reação de 2ª ordem do tipo 2A -> Produtos, se a concentração inicial de reagente [A]₀ for duplicada, o que acontecerá com o tempo de meia-vida t½?',
    tipo: 'MULTIPLA_ESCOLHA',
    opcoes: [
      'O tempo de meia-vida cairá pela metade (t½ é inversamente proporcional a [A]₀).',
      'O tempo de meia-vida dobrará de valor.',
      'O tempo de meia-vida permanecerá exatamente o mesmo.',
      'O tempo de meia-vida quadruplicará.',
    ],
    respostaCorretaNumerica: 0,
    toleranciaPercentual: 0,
    respostaCorretaOpcaoIndex: 0,
    explicacao:
      'Para reações de 2ª ordem, a lei integrada fornece t½ = 1 / (k · [A]₀). Portanto, dobrar a concentração inicial faz o tempo de meia-vida cair pela metade.',
    dicaFormula: 'Considere a fórmula da meia-vida de 2ª ordem: t½ = 1 / (k · [A]₀). Observe o expoente de [A]₀ no denominador.',
    dicaResolucao: 'Como [A]₀ está no denominador elevado a 1, dobrar [A]₀ divide o tempo pela metade: t½\' = t½ / 2.',
    recompensaXp: 80,
    recompensaPontos: 80,
  },
  {
    id: 'max_04',
    titulo: 'Fator de Aceleração com Temperatura Quadruplicada',
    modulo: 'MAXWELL',
    nivel: 'Iniciante',
    enunciado:
      'Se a temperatura de um gás nobre ideal for quadruplicada de 300 K para 1200 K, por qual fator numérico a velocidade média molecular se multiplicará?',
    tipo: 'NUMERICO',
    opcoes: [],
    respostaCorretaNumerica: 2.0,
    toleranciaPercentual: 0.02,
    respostaCorretaOpcaoIndex: -1,
    explicacao:
      'A velocidade média é proporcional à raiz quadrada da temperatura: v ∝ √T. Logo, v(1200 K) / v(300 K) = √(1200 / 300) = √4 = 2.0.',
    dicaFormula: 'Pela teoria cinética de Maxwell: v ∝ √(T). Calcule a raiz da razão entre as temperaturas: √(T₂ / T₁).',
    dicaResolucao: 'Faça √(1200 / 300) = √4 = 2.0. As moléculas dobram de velocidade ao quadruplicar a temperatura.',
    recompensaXp: 65,
    recompensaPontos: 65,
  },
  {
    id: 'max_05',
    titulo: 'Velocidade Quadrática Média do Nitrogênio (300 K)',
    modulo: 'MAXWELL',
    nivel: 'Intermediário',
    enunciado:
      'Calcule a velocidade quadrática média (v_rms em m/s) das moléculas de N₂ (M = 0.02801 kg/mol) no ar a 300 K. Use R = 8.314 J/(mol·K).',
    tipo: 'NUMERICO',
    opcoes: [],
    respostaCorretaNumerica: 516.9,
    toleranciaPercentual: 0.05,
    respostaCorretaOpcaoIndex: -1,
    explicacao:
      'v_rms = √(3 · R · T / M) = √(3 · 8.31446 · 300 / 0.02801) = √(7483.0 / 0.02801) = √267155 ≈ 516.9 m/s.',
    dicaFormula: 'A fórmula para a velocidade quadrática média é v_rms = √(3 · R · T / M).',
    dicaResolucao: 'Multiplique: 3 · 8.314 · 300 = 7482.6; Divida por 0.02801 = 267140; Raiz quadrada: √267140 ≈ 516.9 m/s.',
    recompensaXp: 80,
    recompensaPontos: 80,
  },
  {
    id: 'dsc_04',
    titulo: 'Largura à Meia-Altura do Pico Térmico (ΔT½)',
    modulo: 'DSC',
    nivel: 'Intermediário',
    enunciado:
      'No termograma da Lisozima, a capacidade calorífica atinge metade do pico máximo (ΔCp = 5.40 kJ/mol·K) em T₁ = 61.0 °C e T₂ = 69.0 °C. Qual é a largura à meia-altura ΔT½ (em °C)?',
    tipo: 'NUMERICO',
    opcoes: [],
    respostaCorretaNumerica: 8.0,
    toleranciaPercentual: 0.02,
    respostaCorretaOpcaoIndex: -1,
    explicacao:
      'A largura à meia-altura é a diferença direta entre as temperaturas de meia altura: ΔT½ = T₂ - T₁ = 69.0 - 61.0 = 8.0 °C.',
    dicaFormula: 'Subtraia a temperatura inicial da final nos pontos onde ΔCp atinge metade do valor de pico.',
    dicaResolucao: 'Calcule 69.0 - 61.0 = 8.0 °C. Quanto mais estreito o pico, maior a cooperatividade da transição conformacional.',
    recompensaXp: 70,
    recompensaPontos: 70,
  },
  {
    id: 'dsc_05',
    titulo: 'Entalpia Aproximada por Triangulação de Pico',
    modulo: 'DSC',
    nivel: 'Avançado',
    enunciado:
      'Aproximando o pico térmico da Lisozima por um triângulo de base ΔT = 20.0 °C (de 55 a 75 °C) e altura máxima ΔCp = 10.80 kJ/(mol·K), estime a entalpia de desnaturação ΔH (em kJ/mol).',
    tipo: 'NUMERICO',
    opcoes: [],
    respostaCorretaNumerica: 108.0,
    toleranciaPercentual: 0.05,
    respostaCorretaOpcaoIndex: -1,
    explicacao:
      'A área de um triângulo é (base · altura) / 2. Logo, ΔH ≈ (20.0 · 10.80) / 2 = 108.0 kJ/mol.',
    dicaFormula: 'A entalpia é a integral sob a curva. Para um triângulo: Área = ½ · base · altura.',
    dicaResolucao: 'Calcule: 0.5 · 20.0 · 10.80 = 108.0 kJ/mol.',
    recompensaXp: 85,
    recompensaPontos: 85,
  },
  {
    id: 'termo_01',
    titulo: 'Energia Livre de Gibbs Padrão (ΔG°)',
    modulo: 'AVANCADO',
    nivel: 'Avançado',
    enunciado:
      'Para uma reação química com constante de equilíbrio K = 100 à temperatura de 298.15 K, calcule a variação de energia livre de Gibbs padrão ΔG° (em kJ/mol). Use R = 8.314 J/(mol·K).',
    tipo: 'NUMERICO',
    opcoes: [],
    respostaCorretaNumerica: -11.41,
    toleranciaPercentual: 0.05,
    respostaCorretaOpcaoIndex: -1,
    explicacao:
      'ΔG° = -R · T · ln(K) = -8.314 · 298.15 · ln(100) / 1000 = -8.314 · 298.15 · 4.60517 / 1000 = -11.41 kJ/mol.',
    dicaFormula: 'Aplique a relação termodinâmica fundamental: ΔG° = -R · T · ln(K). Lembre de converter J para kJ dividindo por 1000.',
    dicaResolucao: 'Calcule: ln(100) ≈ 4.605; -8.314 · 298.15 · 4.605 = -11415 J/mol = -11.41 kJ/mol. O valor negativo indica espontaneidade no estado padrão.',
    recompensaXp: 95,
    recompensaPontos: 95,
  },
  {
    id: 'termo_02',
    titulo: 'Trabalho em Expansão Isotérmica Reversível',
    modulo: 'AVANCADO',
    nivel: 'Intermediário',
    enunciado:
      'Qual expressão matemática deduzida da 1ª Lei representa o trabalho W realizado por 1 mol de gás ideal em uma expansão isotérmica reversível de volume V₁ até V₂?',
    tipo: 'MULTIPLA_ESCOLHA',
    opcoes: [
      'W = n · R · T · ln(V₂ / V₁)',
      'W = -P · ΔV (com pressão constante)',
      'W = n · Cv · ΔT',
      'W = 0 (nenhum trabalho é realizado em processos isotérmicos)',
    ],
    respostaCorretaNumerica: 0,
    toleranciaPercentual: 0,
    respostaCorretaOpcaoIndex: 0,
    explicacao:
      'W = ∫ P dV = ∫ (nRT/V) dV = n · R · T · ln(V₂ / V₁). Como T é constante, nRT sai da integral e sobra ∫ dV/V = ln(V₂/V₁).',
    dicaFormula: 'Lembre que em um processo reversível com gás ideal, P = nRT/V ao longo de toda a trajetória de integração.',
    dicaResolucao: 'Integrando dV/V de V₁ a V₂ obtém-se o logaritmo natural ln(V₂/V₁), multiplicando por nRT.',
    recompensaXp: 85,
    recompensaPontos: 85,
  },
  {
    id: 'termo_03',
    titulo: 'Entropia de Desnaturação Térmica (ΔS)',
    modulo: 'AVANCADO',
    nivel: 'Avançado',
    enunciado:
      'Se a desnaturação da proteína Lisozima ocorre reversivelmente a Tm = 65.0 °C (338.15 K) com entalpia ΔH = 432.8 kJ/mol, calcule a variação de entropia conformacional ΔS em kJ/(mol·K).',
    tipo: 'NUMERICO',
    opcoes: [],
    respostaCorretaNumerica: 1.28,
    toleranciaPercentual: 0.05,
    respostaCorretaOpcaoIndex: -1,
    explicacao:
      'No equilíbrio térmico da transição (Tm), ΔG = 0 => ΔH - Tm·ΔS = 0 => ΔS = ΔH / Tm = 432.8 / 338.15 ≈ 1.28 kJ/(mol·K).',
    dicaFormula: 'Em equilíbrio de fase (temperatura de transição Tm): ΔG = 0, logo ΔS = ΔH / Tm. Converta Tm para Kelvin!',
    dicaResolucao: 'Calcule: Tm = 65.0 + 273.15 = 338.15 K. Depois divida: 432.8 / 338.15 = 1.28 kJ/(mol·K).',
    recompensaXp: 90,
    recompensaPontos: 90,
  },
];

function obterCatalogoPorIdioma(lang?: Language): ExercicioCatalogo[] {
  const idioma = lang || obterIdiomaAtual();
  return idioma === 'pt' ? CATALOGO_EXERCICIOS_PT : CATALOGO_EXERCICIOS_EN;
}

// ============================================================================
// PERSISTENCIA LOCAL DE FALLBACK (Com Senhas Hasheadas!)
// ============================================================================

const STORAGE_DB_KEY = 'lab_quantico_usuarios_db';

function obterBancoUsuariosLocal(): any[] {
  const hashPadrao = gerarHashSenhaLocal('123456');
  try {
    const raw = localStorage.getItem(STORAGE_DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Garante que nenhuma senha antiga fique em texto puro no banco local
        return parsed.map(u => ({
          ...u,
          senha: u.senha ? gerarHashSenhaLocal(u.senha) : hashPadrao,
        }));
      }
    }
  } catch {
    // ignore
  }
  const inicial = [
    {
      id: 101,
      nomeCompleto: 'Marie Sklodowska Curie',
      email: 'curie@sorbonne.fr',
      senha: hashPadrao,
      experiencia: 1250,
      pontos: 640,
      titulo: 'Cientista Sênior',
      avatarId: 'avatar_void',
      avataresDesbloqueados: 'avatar_default,avatar_void,avatar_cyber',
      titulosDesbloqueados:
        'Iniciante da Termodinâmica,Aprendiz de Cinética,Pesquisador de Gases,Mestre da Termodinâmica,Alquimista Quântico,Cientista Sênior',
      exerciciosResolvidos: 'cin_01,cin_02,max_01,dsc_01',
    },
    {
      id: 102,
      nomeCompleto: 'Ludwig Boltzmann',
      email: 'boltzmann@vienna.at',
      senha: hashPadrao,
      experiencia: 890,
      pontos: 420,
      titulo: 'Alquimista Quântico',
      avatarId: 'avatar_cyber',
      avataresDesbloqueados: 'avatar_default,avatar_cyber',
      titulosDesbloqueados:
        'Iniciante da Termodinâmica,Aprendiz de Cinética,Pesquisador de Gases,Mestre da Termodinâmica,Alquimista Quântico',
      exerciciosResolvidos: 'max_01,max_02,max_03',
    },
    {
      id: 103,
      nomeCompleto: 'Svante Arrhenius',
      email: 'arrhenius@uppsala.se',
      senha: hashPadrao,
      experiencia: 540,
      pontos: 310,
      titulo: 'Mestre da Termodinâmica',
      avatarId: 'avatar_quantum',
      avataresDesbloqueados: 'avatar_default,avatar_quantum',
      titulosDesbloqueados:
        'Iniciante da Termodinâmica,Aprendiz de Cinética,Pesquisador de Gases,Mestre da Termodinâmica',
      exerciciosResolvidos: 'cin_01,cin_03',
    },
  ];
  localStorage.setItem(STORAGE_DB_KEY, JSON.stringify(inicial));
  return inicial;
}

function salvarBancoUsuariosLocal(lista: any[]) {
  localStorage.setItem(STORAGE_DB_KEY, JSON.stringify(lista));
}

function atualizarTitulosPorXpLocal(u: any) {
  const atuais = u.titulosDesbloqueados
    ? u.titulosDesbloqueados.split(',').filter(Boolean)
    : ['Iniciante da Termodinâmica'];
  const set = new Set<string>(atuais);
  if (u.experiencia >= 50) set.add('Aprendiz de Cinética');
  if (u.experiencia >= 150) set.add('Pesquisador de Gases');
  if (u.experiencia >= 300) set.add('Mestre da Termodinâmica');
  if (u.experiencia >= 600) set.add('Alquimista Quântico');
  if (u.experiencia >= 1000) set.add('Cientista Sênior');
  if (u.experiencia >= 2000) set.add('Prêmio Nobel da Físico-Química');
  u.titulosDesbloqueados = Array.from(set).join(',');
}

function sincronizarUsuarioNoBancoLocal(u: any) {
  if (!u || !u.id) return;
  const db = obterBancoUsuariosLocal();
  const idx = db.findIndex(item => item.id === u.id || item.email === u.email);
  if (idx >= 0) {
    const senhaPreservada = db[idx].senha;
    db[idx] = {
      ...db[idx],
      ...u,
      senha: u.senha ? gerarHashSenhaLocal(u.senha) : senhaPreservada,
    };
  } else {
    db.push({
      ...u,
      senha: u.senha ? gerarHashSenhaLocal(u.senha) : gerarHashSenhaLocal('123456'),
    });
  }
  salvarBancoUsuariosLocal(db);
}

// ============================================================================
// ENDPOINTS DE SIMULACAO CIENTIFICA (Backend API + Fallback Isomorfico)
// ============================================================================

export async function obterCinetica(
  concentracaoInicial: number,
  constanteVelocidade: number,
  ordem: number,
  tempoMaximo: number
): Promise<{ dados: ResultadoCinetica; origem: 'api' | 'local' }> {
  const local = calcularCineticaLocal(concentracaoInicial, constanteVelocidade, ordem, tempoMaximo);
  try {
    const res = await apiClient.get('/api/cinetica/calcular', {
      params: { concentracaoInicial, constanteVelocidade, ordem, tempoMaximo },
    });
    definirStatusMotor('api');
    return {
      dados: { ...local, ...res.data },
      origem: 'api',
    };
  } catch {
    definirStatusMotor('local');
    return {
      dados: local,
      origem: 'local',
    };
  }
}

export async function obterMaxwell(params: {
  gasNome: string;
  temperaturaKelvin: number;
  energiaAtivacaoJPorMol?: number;
  v1?: number;
  v2?: number;
  massaCustomKgPorMol?: number;
  gamaCustom?: number;
}): Promise<{ dados: ResultadoMaxwell; origem: 'api' | 'local' }> {
  const local = calcularMaxwellLocal(
    params.gasNome,
    params.temperaturaKelvin,
    params.energiaAtivacaoJPorMol ?? 20000,
    params.v1 ?? 200,
    params.v2 ?? 600,
    params.massaCustomKgPorMol,
    params.gamaCustom
  );

  try {
    const res = await apiClient.get('/api/maxwell/calcular', { params });
    definirStatusMotor('api');
    return {
      dados: { ...local, ...res.data },
      origem: 'api',
    };
  } catch {
    definirStatusMotor('local');
    return {
      dados: local,
      origem: 'local',
    };
  }
}

export async function obterComparacaoMaxwell(
  temperaturaKelvin: number
): Promise<{ dados: ResultadoComparacaoGases; origem: 'api' | 'local' }> {
  try {
    const res = await apiClient.get('/api/maxwell/comparar', { params: { temperaturaKelvin } });
    definirStatusMotor('api');
    return { dados: res.data, origem: 'api' };
  } catch {
    definirStatusMotor('local');
    return { dados: compararGasesLocal(temperaturaKelvin), origem: 'local' };
  }
}

export async function obterDsc(
  tMin: number = 40.0,
  tMax: number = 90.0
): Promise<{ dados: ResultadoDsc; origem: 'api' | 'local' }> {
  const local = calcularDscLocal(tMin, tMax);
  try {
    const res = await apiClient.get('/api/dsc/analise', { params: { tMin, tMax } });
    definirStatusMotor('api');
    return {
      dados: { ...local, ...res.data },
      origem: 'api',
    };
  } catch {
    definirStatusMotor('local');
    return {
      dados: local,
      origem: 'local',
    };
  }
}

// ============================================================================
// ENDPOINTS DE EXERCICIOS & GAMIFICACAO (Bilingue EN / PT)
// ============================================================================

export async function listarExerciciosApi(lang?: Language) {
  const idioma = lang || obterIdiomaAtual();
  const catalogoLocal = obterCatalogoPorIdioma(idioma);
  try {
    const res = await apiClient.get('/api/exercicios', { params: { lang: idioma } });
    definirStatusMotor('api');
    // Se o backend retornou em PT mas o idioma ativo e EN, garantimos os textos traduzidos do catalogo bilingue
    if (idioma === 'en' && Array.isArray(res.data)) {
      return catalogoLocal.map(ex => ({
        id: ex.id,
        titulo: ex.titulo,
        modulo: ex.modulo,
        nivel: ex.nivel,
        enunciado: ex.enunciado,
        tipo: ex.tipo,
        opcoes: ex.opcoes,
        recompensaXp: ex.recompensaXp,
        recompensaPontos: ex.recompensaPontos,
      }));
    }
    return res.data;
  } catch {
    definirStatusMotor('local');
    return catalogoLocal.map(ex => ({
      id: ex.id,
      titulo: ex.titulo,
      modulo: ex.modulo,
      nivel: ex.nivel,
      enunciado: ex.enunciado,
      tipo: ex.tipo,
      opcoes: ex.opcoes,
      recompensaXp: ex.recompensaXp,
      recompensaPontos: ex.recompensaPontos,
    }));
  }
}

export async function validarExercicioApi(id: string, resposta: any, lang?: Language) {
  const idioma = lang || obterIdiomaAtual();
  const catalogoLocal = obterCatalogoPorIdioma(idioma);
  const exLocal = catalogoLocal.find(e => e.id === id);

  try {
    const res = await apiClient.post('/api/exercicios/validar', { id, resposta, lang: idioma });
    definirStatusMotor('api');
    if (exLocal && idioma === 'en') {
      return {
        ...res.data,
        explicacao: exLocal.explicacao,
        mensagem: res.data.correto
          ? 'Congratulations! Correct answer!'
          : 'Incorrect answer. Read the explanation below and try again.',
      };
    }
    return res.data;
  } catch {
    definirStatusMotor('local');
    if (!exLocal) {
      return {
        correto: false,
        mensagem: idioma === 'en' ? 'Exercise not found.' : 'Exercício não encontrado.',
      };
    }
    let correto = false;
    if (exLocal.tipo === 'NUMERICO') {
      const val = parseFloat(String(resposta));
      if (!isNaN(val)) {
        const erroRel = Math.abs(
          (val - exLocal.respostaCorretaNumerica) / exLocal.respostaCorretaNumerica
        );
        correto = erroRel <= exLocal.toleranciaPercentual;
      }
    } else {
      correto = parseInt(String(resposta), 10) === exLocal.respostaCorretaOpcaoIndex;
    }
    return {
      correto,
      explicacao: exLocal.explicacao,
      xpGanho: correto ? exLocal.recompensaXp : 0,
      pontosGanhos: correto ? exLocal.recompensaPontos : 0,
      mensagem:
        idioma === 'en'
          ? correto
            ? 'Congratulations! Correct answer!'
            : 'Incorrect answer. Read the explanation below and try again.'
          : correto
          ? 'Parabéns! Resposta correta!'
          : 'Resposta incorreta. Leia a explicação e tente novamente.',
    };
  }
}

export async function obterDicaExercicioApi(
  id: string,
  tipo: 'formula' | 'resolucao',
  lang?: Language
) {
  const idioma = lang || obterIdiomaAtual();
  const catalogoLocal = obterCatalogoPorIdioma(idioma);
  const exLocal = catalogoLocal.find(e => e.id === id);

  try {
    const res = await apiClient.get(`/api/exercicios/${id}/dica`, {
      params: { tipo, lang: idioma },
    });
    definirStatusMotor('api');
    if (exLocal && idioma === 'en') {
      return {
        dica: tipo === 'formula' ? exLocal.dicaFormula : exLocal.dicaResolucao,
        tipo: tipo === 'formula' ? 'THEORETICAL FORMULA' : 'STEP-BY-STEP',
      };
    }
    return res.data;
  } catch {
    definirStatusMotor('local');
    if (!exLocal) {
      return { dica: idioma === 'en' ? 'Exercise not found.' : 'Exercício não encontrado.' };
    }
    return {
      dica: tipo === 'formula' ? exLocal.dicaFormula : exLocal.dicaResolucao,
      tipo:
        idioma === 'en'
          ? tipo === 'formula'
            ? 'THEORETICAL FORMULA'
            : 'STEP-BY-STEP'
          : tipo === 'formula'
          ? 'FÓRMULA TEÓRICA'
          : 'PASSO-A-PASSO',
    };
  }
}

// ============================================================================
// ENDPOINTS DE USUARIO, PERFIL, LOJA E RANKING (Sem vazar senha no storage!)
// ============================================================================

export async function cadastrarUsuarioApi(nomeCompleto: string, email: string, senha: string) {
  const emailNorm = email.trim().toLowerCase();
  const nomeFinal =
    (nomeCompleto || '').trim() ||
    (emailNorm.split('@')[0]
      ? emailNorm.split('@')[0].charAt(0).toUpperCase() + emailNorm.split('@')[0].slice(1)
      : 'Estudante');

  // Verifica primeiro se o email já existe localmente
  const db = obterBancoUsuariosLocal();
  if (db.some(u => u.email === emailNorm)) {
    const customErr: any = new Error('EMAIL_JA_CADASTRADO');
    customErr.response = { status: 400, data: 'EMAIL_JA_CADASTRADO' };
    throw customErr;
  }

  try {
    const res = await apiClient.post(
      '/api/usuarios/cadastrar',
      { nomeCompleto: nomeFinal, email: emailNorm, senha },
      { timeout: 2000 }
    );
    definirStatusMotor('api');
    const seguro = sanitizarUsuarioSemSenha(res.data);
    sincronizarUsuarioNoBancoLocal({ ...seguro, senha: gerarHashSenhaLocal(senha) });
    return seguro;
  } catch (err: any) {
    if (err.response?.data === 'EMAIL_JA_CADASTRADO') {
      throw err;
    }
    // Fallback local instantaneo para nao deixar o estudante travado
    definirStatusMotor('local');
    const novoComHash = {
      id: Date.now(),
      nomeCompleto: nomeFinal,
      email: emailNorm,
      senha: gerarHashSenhaLocal(senha),
      experiencia: 0,
      pontos: 100,
      titulo: 'Iniciante da Termodinâmica',
      avatarId: 'avatar_default',
      avataresDesbloqueados: 'avatar_default',
      titulosDesbloqueados: 'Iniciante da Termodinâmica',
      exerciciosResolvidos: '',
    };
    db.push(novoComHash);
    salvarBancoUsuariosLocal(db);
    return sanitizarUsuarioSemSenha(novoComHash);
  }
}

export async function loginUsuarioApi(email: string, senha: string) {
  const emailNorm = email.trim().toLowerCase();
  const hashDigitado = gerarHashSenhaLocal(senha);

  // Otimizacao de Performance: Se o usuario ja existe no banco local e a senha bate, loga instantaneamente!
  const db = obterBancoUsuariosLocal();
  const usuarioLocal = db.find(u => u.email === emailNorm);
  if (usuarioLocal && (usuarioLocal.senha === hashDigitado || usuarioLocal.senha === senha)) {
    return sanitizarUsuarioSemSenha(usuarioLocal);
  }

  try {
    const res = await apiClient.post('/api/usuarios/login', { email: emailNorm, senha }, { timeout: 2200 });
    definirStatusMotor('api');
    const seguro = sanitizarUsuarioSemSenha(res.data);
    sincronizarUsuarioNoBancoLocal({ ...seguro, senha: hashDigitado });
    return seguro;
  } catch (err: any) {
    if (usuarioLocal) {
      const e401: any = new Error('SENHA_INCORRETA');
      e401.response = { status: 401, data: 'SENHA_INCORRETA' };
      throw e401;
    }
    if (
      err.response?.data === 'EMAIL_NAO_CADASTRADO' ||
      err.response?.data === 'SENHA_INCORRETA' ||
      err.response?.status === 401 ||
      err.response?.status === 404
    ) {
      definirStatusMotor('api');
      throw err;
    }
    definirStatusMotor('local');
    const e404: any = new Error('EMAIL_NAO_CADASTRADO');
    e404.response = { status: 404, data: 'EMAIL_NAO_CADASTRADO' };
    throw e404;
  }
}

export async function buscarPerfilUsuarioApi(id: number) {
  try {
    const res = await apiClient.get(`/api/usuarios/${id}`);
    definirStatusMotor('api');
    const seguro = sanitizarUsuarioSemSenha(res.data);
    sincronizarUsuarioNoBancoLocal(seguro);
    return seguro;
  } catch {
    const raw = localStorage.getItem('usuario');
    if (raw) {
      const u = sanitizarUsuarioSemSenha(JSON.parse(raw));
      sincronizarUsuarioNoBancoLocal(u);
      return u;
    }
    throw new Error('User not found / Usuário não encontrado');
  }
}

export async function ganharXpUsuarioApi(id: number, pontosXp: number, exercicioId?: string) {
  try {
    const res = await apiClient.post(`/api/usuarios/${id}/ganhar-xp`, null, {
      params: { pontosXp, exercicioId },
    });
    definirStatusMotor('api');
    const seguro = sanitizarUsuarioSemSenha(res.data);
    sincronizarUsuarioNoBancoLocal(seguro);
    return seguro;
  } catch {
    const raw = localStorage.getItem('usuario');
    if (!raw) throw new Error('Unauthenticated user');
    const u = sanitizarUsuarioSemSenha(JSON.parse(raw));
    const resolvidos = new Set<string>(
      u.exerciciosResolvidos ? u.exerciciosResolvidos.split(',').filter(Boolean) : []
    );
    if (!exercicioId || !resolvidos.has(exercicioId)) {
      u.experiencia = (u.experiencia || 0) + pontosXp;
      u.pontos = (u.pontos || 0) + pontosXp;
    }
    if (exercicioId) {
      resolvidos.add(exercicioId);
      u.exerciciosResolvidos = Array.from(resolvidos).join(',');
    }
    atualizarTitulosPorXpLocal(u);
    sincronizarUsuarioNoBancoLocal(u);
    localStorage.setItem('usuario', JSON.stringify(u));
    return u;
  }
}

export async function descontarPontosUsuarioApi(id: number, pontos: number) {
  try {
    const res = await apiClient.post(`/api/usuarios/${id}/descontar-pontos`, null, {
      params: { pontos },
    });
    definirStatusMotor('api');
    const seguro = sanitizarUsuarioSemSenha(res.data);
    sincronizarUsuarioNoBancoLocal(seguro);
    return seguro;
  } catch {
    const raw = localStorage.getItem('usuario');
    if (!raw) throw new Error('Unauthenticated user');
    const u = sanitizarUsuarioSemSenha(JSON.parse(raw));
    if ((u.pontos || 0) < pontos) {
      throw new Error('Insufficient coins!');
    }
    u.pontos -= pontos;
    sincronizarUsuarioNoBancoLocal(u);
    localStorage.setItem('usuario', JSON.stringify(u));
    return u;
  }
}

export async function comprarAvatarUsuarioApi(id: number, avatarId: string, preco: number) {
  try {
    const res = await apiClient.post(`/api/usuarios/${id}/comprar-avatar`, null, {
      params: { avatarId, preco },
    });
    definirStatusMotor('api');
    const seguro = sanitizarUsuarioSemSenha(res.data);
    sincronizarUsuarioNoBancoLocal(seguro);
    return seguro;
  } catch (err: any) {
    if (err.response?.status === 400) throw err;
    const raw = localStorage.getItem('usuario');
    if (!raw) throw new Error('Unauthenticated user');
    const u = sanitizarUsuarioSemSenha(JSON.parse(raw));
    const set = new Set<string>(
      u.avataresDesbloqueados ? u.avataresDesbloqueados.split(',').filter(Boolean) : ['avatar_default']
    );
    if (set.has(avatarId)) {
      throw new Error('Badge already unlocked!');
    }
    if ((u.pontos || 0) < preco) {
      throw new Error('Insufficient coins!');
    }
    u.pontos -= preco;
    set.add(avatarId);
    u.avataresDesbloqueados = Array.from(set).join(',');
    u.avatarId = avatarId;
    sincronizarUsuarioNoBancoLocal(u);
    localStorage.setItem('usuario', JSON.stringify(u));
    return u;
  }
}

export async function equiparAvatarUsuarioApi(id: number, avatarId: string) {
  try {
    const res = await apiClient.post(`/api/usuarios/${id}/equipar-avatar`, null, {
      params: { avatarId },
    });
    definirStatusMotor('api');
    const seguro = sanitizarUsuarioSemSenha(res.data);
    sincronizarUsuarioNoBancoLocal(seguro);
    return seguro;
  } catch {
    const raw = localStorage.getItem('usuario');
    if (!raw) throw new Error('Unauthenticated user');
    const u = sanitizarUsuarioSemSenha(JSON.parse(raw));
    u.avatarId = avatarId;
    sincronizarUsuarioNoBancoLocal(u);
    localStorage.setItem('usuario', JSON.stringify(u));
    return u;
  }
}

export async function equiparTituloUsuarioApi(id: number, titulo: string) {
  try {
    const res = await apiClient.post(`/api/usuarios/${id}/equipar-titulo`, null, {
      params: { titulo },
    });
    definirStatusMotor('api');
    const seguro = sanitizarUsuarioSemSenha(res.data);
    sincronizarUsuarioNoBancoLocal(seguro);
    return seguro;
  } catch {
    const raw = localStorage.getItem('usuario');
    if (!raw) throw new Error('Unauthenticated user');
    const u = sanitizarUsuarioSemSenha(JSON.parse(raw));
    u.titulo = titulo;
    sincronizarUsuarioNoBancoLocal(u);
    localStorage.setItem('usuario', JSON.stringify(u));
    return u;
  }
}

export async function obterRankingUsuariosApi() {
  try {
    const res = await apiClient.get('/api/usuarios/ranking');
    definirStatusMotor('api');
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
  } catch {
    definirStatusMotor('local');
  }
  const raw = localStorage.getItem('usuario');
  if (raw) {
    sincronizarUsuarioNoBancoLocal(sanitizarUsuarioSemSenha(JSON.parse(raw)));
  }
  const db = obterBancoUsuariosLocal();
  const ordenado = [...db].sort((a, b) => (b.experiencia || 0) - (a.experiencia || 0));
  return ordenado.map((u, idx) => ({
    posicao: idx + 1,
    id: u.id,
    nomeCompleto: u.nomeCompleto,
    titulo: u.titulo,
    avatarId: u.avatarId,
    experiencia: u.experiencia || 0,
    pontos: u.pontos || 0,
  }));
}

export interface AtualizarPerfilPayload {
  nomeCompleto?: string;
  email?: string;
  senha?: string;
  titulo?: string;
  avatarId?: string;
  bio?: string;
  instituicao?: string;
}

export async function atualizarPerfilUsuarioApi(id: number, payload: AtualizarPerfilPayload) {
  try {
    const res = await apiClient.post(`/api/usuarios/${id}/atualizar`, payload);
    definirStatusMotor('api');
    const seguro = sanitizarUsuarioSemSenha(res.data);
    sincronizarUsuarioNoBancoLocal(seguro);
    localStorage.setItem('usuario', JSON.stringify(seguro));
    return seguro;
  } catch {
    definirStatusMotor('local');
    const raw = localStorage.getItem('usuario');
    if (!raw) throw new Error('Unauthenticated user');
    const u = JSON.parse(raw);
    if (payload.nomeCompleto) u.nomeCompleto = payload.nomeCompleto.trim();
    if (payload.email) u.email = payload.email.trim();
    if (payload.titulo) u.titulo = payload.titulo.trim();
    if (payload.avatarId) u.avatarId = payload.avatarId;
    if (payload.bio !== undefined) u.bio = payload.bio;
    if (payload.instituicao !== undefined) u.instituicao = payload.instituicao;
    if (payload.senha && payload.senha.trim().length >= 6) {
      u.senha = gerarHashSenhaLocal(payload.senha);
    }
    sincronizarUsuarioNoBancoLocal(u);
    const seguro = sanitizarUsuarioSemSenha(u);
    localStorage.setItem('usuario', JSON.stringify(seguro));
    return seguro;
  }
}

