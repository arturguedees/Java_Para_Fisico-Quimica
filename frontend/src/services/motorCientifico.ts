/**
 * Motor Cientifico Local em TypeScript (Espelho das classes que fiz em Java 21).
 * Criei esse arquivo com as mesmas formulas matematicas do backend pra garantir que,
 * mesmo se o servidor na nuvem estiver hibernando (cold-start) ou sem internet,
 * os graficos e integrais rodem em menos de 1ms direto no navegador sem travar!
 */

export const CONSTANTES_FISICAS = {
  R: 8.314462618, // Constante universal dos gases ideais em J / (mol * K)
  ZERO_ABSOLUTO_CELSIUS: -273.15,
} as const;

export interface GasInfo {
  chave: string;
  simbolo: string;
  nome: string;
  massaMolarKgPorMol: number;
  massaMolarGPorMol: number;
  coeficienteAdiabatico: number;
}

// Lista dos 5 gases padrao do artigo da ACS (lembrando que na formula de Maxwell a massa tem que estar em kg/mol!)
export const CATALOGO_GASES: Record<string, GasInfo> = {
  ARGONIO: {
    chave: 'ARGONIO',
    simbolo: 'Ar',
    nome: 'Argônio',
    massaMolarKgPorMol: 0.039948,
    massaMolarGPorMol: 39.948,
    coeficienteAdiabatico: 1.67,
  },
  OXIGENIO: {
    chave: 'OXIGENIO',
    simbolo: 'O₂',
    nome: 'Oxigênio',
    massaMolarKgPorMol: 0.031998,
    massaMolarGPorMol: 31.998,
    coeficienteAdiabatico: 1.40,
  },
  HELIO: {
    chave: 'HELIO',
    simbolo: 'He',
    nome: 'Hélio',
    massaMolarKgPorMol: 0.004002602,
    massaMolarGPorMol: 4.0026,
    coeficienteAdiabatico: 1.67,
  },
  HIDROGENIO: {
    chave: 'HIDROGENIO',
    simbolo: 'H₂',
    nome: 'Hidrogênio',
    massaMolarKgPorMol: 0.00201588,
    massaMolarGPorMol: 2.0159,
    coeficienteAdiabatico: 1.40,
  },
  NITROGENIO: {
    chave: 'NITROGENIO',
    simbolo: 'N₂',
    nome: 'Nitrogênio',
    massaMolarKgPorMol: 0.0280134,
    massaMolarGPorMol: 28.0134,
    coeficienteAdiabatico: 1.40,
  },
};

// ============================================================================
// 1. INTEGRACAO NUMERICA (Trapezio, Simpson 1/3 e Spline Cubico Natural)
// ============================================================================

// Regra do Trapezio somando a area de cada pedacinho entre os pontos discretos
export function integrarTrapezioDiscreto(x: number[], y: number[]): number {
  if (!x || !y || x.length !== y.length || x.length < 2) {
    throw new Error('Arrays x e y devem conter pelo menos 2 pontos de mesmo tamanho.');
  }
  let area = 0.0;
  for (let i = 1; i < x.length; i++) {
    const h = x[i] - x[i - 1];
    area += h * (y[i - 1] + y[i]) / 2.0;
  }
  return area;
}

export function integrarFuncaoTrapezio(
  funcao: (x: number) => number,
  a: number,
  b: number,
  nSubintervalos: number
): number {
  if (b <= a || nSubintervalos < 1) return 0.0;
  const h = (b - a) / nSubintervalos;
  let soma = 0.5 * (funcao(a) + funcao(b));
  for (let i = 1; i < nSubintervalos; i++) {
    soma += funcao(a + i * h);
  }
  return soma * h;
}

// Regra de Simpson 1/3 Composta: aproxima a curva usando parabolas (precisa de N par!)
export function integrarFuncaoSimpson(
  funcao: (x: number) => number,
  a: number,
  b: number,
  nSubintervalos: number
): number {
  if (b <= a) return 0.0;
  const n = nSubintervalos % 2 === 0 ? nSubintervalos : nSubintervalos + 1;
  const h = (b - a) / n;
  let somaImpares = 0.0;
  let somaPares = 0.0;

  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    if (i % 2 === 0) {
      somaPares += funcao(x);
    } else {
      somaImpares += funcao(x);
    }
  }

  return (h / 3.0) * (funcao(a) + 4.0 * somaImpares + 2.0 * somaPares + funcao(b));
}

/**
 * Interpolador por Spline Cubico Natural que eu implementei resolvendo o sistema tridiagonal
 * (algoritmo de Thomas), igualzinho ao que o Apache Commons Math3 faz la no Java!
 */
export function criarSplineCubicoNatural(x: number[], y: number[]): (val: number) => number {
  const n = x.length - 1;
  const h = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    h[i] = x[i + 1] - x[i];
  }

  const mu = new Array<number>(n).fill(0);
  const z = new Array<number>(n + 1).fill(0);

  for (let i = 1; i < n; i++) {
    const g = 2.0 * (x[i + 1] - x[i - 1]) - h[i - 1] * mu[i - 1];
    mu[i] = h[i] / g;
    z[i] =
      (3.0 * (y[i + 1] * h[i - 1] - y[i] * (x[i + 1] - x[i - 1]) + y[i - 1] * h[i]) /
        (h[i - 1] * h[i]) -
        h[i - 1] * z[i - 1]) /
      g;
  }

  const b = new Array<number>(n).fill(0);
  const c = new Array<number>(n + 1).fill(0);
  const d = new Array<number>(n).fill(0);

  for (let j = n - 1; j >= 0; j--) {
    c[j] = z[j] - mu[j] * c[j + 1];
    b[j] = (y[j + 1] - y[j]) / h[j] - (h[j] * (c[j + 1] + 2.0 * c[j])) / 3.0;
    d[j] = (c[j + 1] - c[j]) / (3.0 * h[j]);
  }

  // Usa busca binaria pra achar em qual intervalo o ponto "val" cai rapidinho (O(log n))
  return (val: number): number => {
    if (val <= x[0]) return y[0];
    if (val >= x[n]) return y[n];
    let i = 0;
    let high = n;
    while (i < high - 1) {
      const mid = (i + high) >> 1;
      if (val < x[mid]) {
        high = mid;
      } else {
        i = mid;
      }
    }
    const dx = val - x[i];
    return y[i] + b[i] * dx + c[i] * dx * dx + d[i] * dx * dx * dx;
  };
}

// ============================================================================
// 2. MODULO 01: CINETICA QUIMICA (Ordem Zero e Primeira Ordem)
// ============================================================================

export interface ResultadoCinetica {
  tempo: number[];
  concentracaoA: number[];
  concentracaoB: number[];
  meiaVida: number;
  ordem: number;
  unidadeK: string;
  tempoVida?: number;
  segundaMeiaVida?: number;
  terceiraMeiaVida?: number;
  tempoConsumoTotal?: number;
}

export function calcularCineticaLocal(
  concentracaoInicial: number,
  constanteVelocidade: number,
  ordem: number,
  tempoMaximo: number
): ResultadoCinetica {
  const a0 = Math.max(0.01, concentracaoInicial);
  const k = Math.max(0.0001, constanteVelocidade);
  const tMax = Math.max(1, tempoMaximo);

  const numPontos = 100;
  const passo = tMax / numPontos;

  const tempo: number[] = [];
  const concentracaoA: number[] = [];
  const concentracaoB: number[] = [];

  for (let i = 0; i <= numPontos; i++) {
    const t = i * passo;
    tempo.push(t);
    if (ordem === 0) {
      // Na ordem zero cai em linha reta ate bater no zero
      const ca = Math.max(0.0, a0 - k * t);
      concentracaoA.push(ca);
      concentracaoB.push(a0 - ca);
    } else {
      // Na primeira ordem cai de forma exponencial: [A]0 * e^(-k*t)
      const ca = a0 * Math.exp(-k * t);
      concentracaoA.push(ca);
      concentracaoB.push(a0 * (1.0 - Math.exp(-k * t)));
    }
  }

  if (ordem === 0) {
    return {
      tempo,
      concentracaoA,
      concentracaoB,
      meiaVida: a0 / (2.0 * k),
      segundaMeiaVida: (3.0 * a0) / (4.0 * k),
      terceiraMeiaVida: (7.0 * a0) / (8.0 * k),
      tempoConsumoTotal: a0 / k,
      ordem: 0,
      unidadeK: 'mol/(L·s)',
    };
  }

  return {
    tempo,
    concentracaoA,
    concentracaoB,
    meiaVida: Math.LN2 / k,
    tempoVida: 1.0 / k,
    ordem: 1,
    unidadeK: 's⁻¹',
  };
}

// ============================================================================
// 3. MODULO 02 & 03: MAXWELL-BOLTZMANN f(v), f(E) E ENERGIA DE ATIVACAO (Ea)
// ============================================================================

export function calcularDensidadeVelocidadeMB(
  massaMolarKgPorMol: number,
  temperaturaKelvin: number,
  velocidadeMPorS: number
): number {
  if (velocidadeMPorS <= 0.0 || temperaturaKelvin <= 0.0 || massaMolarKgPorMol <= 0.0) {
    return 0.0;
  }
  const R = CONSTANTES_FISICAS.R;
  const denominador = 2.0 * Math.PI * R * temperaturaKelvin;
  // Uso logaritmo antes de aplicar Math.exp pra nao estourar o limite de ponto flutuante
  const logNorm =
    Math.log(4.0 * Math.PI) + 1.5 * (Math.log(massaMolarKgPorMol) - Math.log(denominador));
  const escala = Math.sqrt(massaMolarKgPorMol / (2.0 * R * temperaturaKelvin));
  const vEsc = escala * velocidadeMPorS;
  const expoente = vEsc * vEsc;
  if (!Number.isFinite(expoente)) return 0.0;

  const logDensidade = logNorm + 2.0 * Math.log(velocidadeMPorS) - expoente;
  if (logDensidade < -700) return 0.0;
  return Math.exp(logDensidade);
}

export function calcularDensidadeEnergiaMB(
  temperaturaKelvin: number,
  energiaJPorMol: number
): number {
  if (energiaJPorMol <= 0.0 || temperaturaKelvin <= 0.0) return 0.0;
  const rt = CONSTANTES_FISICAS.R * temperaturaKelvin;
  const termo1 = 2.0 * Math.sqrt(energiaJPorMol / Math.PI);
  const termo2 = Math.pow(1.0 / rt, 1.5);
  const expoente = -energiaJPorMol / rt;
  return termo1 * termo2 * Math.exp(expoente);
}

export interface ResultadoMaxwell {
  gas: string;
  simbolo: string;
  temperatura: number;
  massaMolarKgPorMol: number;
  coeficienteAdiabatico: number;
  velocidades: number[];
  densidadesVelocidade: number[];
  densidadesVelocidadeRef300K: number[];
  energias: number[];
  densidadesEnergia: number[];
  densidadesEnergiaRef300K: number[];
  velocidadeMaisProvavel: number;
  velocidadeMedia: number;
  velocidadeQuadraticaMedia: number;
  velocidadeDoSom: number;
  energiaMaisProvavel: number;
  energiaCineticaMedia: number;
  fracaoAcimaEa: number;
  probabilidadeIntervalo: number;
}

export function calcularMaxwellLocal(
  gasNome: string = 'ARGONIO',
  temperaturaKelvin: number = 300,
  energiaAtivacaoJPorMol: number = 20000,
  v1: number = 200,
  v2: number = 600,
  massaCustomKgPorMol?: number,
  gamaCustom?: number
): ResultadoMaxwell {
  const T = Math.max(10, temperaturaKelvin);
  const R = CONSTANTES_FISICAS.R;

  let m = 0.039948;
  let gama = 1.67;
  let nome = 'Argônio';
  let simbolo = 'Ar';

  if (gasNome.toUpperCase() === 'CUSTOM' && massaCustomKgPorMol && gamaCustom) {
    m = Math.max(0.001, massaCustomKgPorMol);
    gama = Math.max(1.01, gamaCustom);
    nome = 'Gás Personalizado';
    simbolo = 'Custom';
  } else {
    const info = CATALOGO_GASES[gasNome.toUpperCase()] || CATALOGO_GASES.ARGONIO;
    m = info.massaMolarKgPorMol;
    gama = info.coeficienteAdiabatico;
    nome = info.nome;
    simbolo = info.simbolo;
  }

  const vmp = Math.sqrt((2.0 * R * T) / m);
  const vm = Math.sqrt((8.0 * R * T) / (Math.PI * m));
  const vrms = Math.sqrt((3.0 * R * T) / m);
  const som = Math.sqrt((gama * R * T) / m);
  const energiaMaisProvavel = 0.5 * R * T;
  const energiaCineticaMedia = 1.5 * R * T;

  const gasLeve = m < 0.010;
  const maxVelocidadePadrao = gasLeve ? 5500.0 : 2500.0;
  const maxVelocidade = Math.max(maxVelocidadePadrao, vrms * 3.0);
  const numPontos = 150;
  const passoV = maxVelocidade / numPontos;

  const velocidades: number[] = [];
  const densidadesVelocidade: number[] = [];
  const densidadesVelocidadeRef300K: number[] = [];

  for (let i = 0; i <= numPontos; i++) {
    const v = i * passoV;
    velocidades.push(v);
    densidadesVelocidade.push(calcularDensidadeVelocidadeMB(m, T, v));
    densidadesVelocidadeRef300K.push(calcularDensidadeVelocidadeMB(m, 300.0, v));
  }

  const maxEnergia = Math.max(50000.0, 6.0 * R * T);
  const passoE = maxEnergia / numPontos;
  const energias: number[] = [];
  const densidadesEnergia: number[] = [];
  const densidadesEnergiaRef300K: number[] = [];

  for (let i = 0; i <= numPontos; i++) {
    const e = i * passoE;
    energias.push(e);
    densidadesEnergia.push(calcularDensidadeEnergiaMB(T, e));
    densidadesEnergiaRef300K.push(calcularDensidadeEnergiaMB(300.0, e));
  }

  const eaVal = Math.max(0.0, energiaAtivacaoJPorMol);
  const limiteSuperiorEa = eaVal + Math.max(100000.0, 25.0 * R * T);
  const fracaoAcimaEa = integrarFuncaoSimpson(
    e => calcularDensidadeEnergiaMB(T, e),
    eaVal,
    limiteSuperiorEa,
    1000
  );

  const probabilidadeIntervalo =
    v2 > v1 && v1 >= 0
      ? integrarFuncaoSimpson(v => calcularDensidadeVelocidadeMB(m, T, v), v1, v2, 500)
      : 0.0;

  return {
    gas: nome,
    simbolo,
    temperatura: T,
    massaMolarKgPorMol: m,
    coeficienteAdiabatico: gama,
    velocidades,
    densidadesVelocidade,
    densidadesVelocidadeRef300K,
    energias,
    densidadesEnergia,
    densidadesEnergiaRef300K,
    velocidadeMaisProvavel: vmp,
    velocidadeMedia: vm,
    velocidadeQuadraticaMedia: vrms,
    velocidadeDoSom: som,
    energiaMaisProvavel,
    energiaCineticaMedia,
    fracaoAcimaEa,
    probabilidadeIntervalo,
  };
}

export interface SerieGasComparativo {
  chave: string;
  nome: string;
  velocidadeMaisProvavel: number;
  velocidadeMedia: number;
  velocidadeQuadraticaMedia: number;
  velocidadeDoSom: number;
  densidades: number[];
}

export interface ResultadoComparacaoGases {
  temperatura: number;
  velocidades: number[];
  series: SerieGasComparativo[];
}

export function compararGasesLocal(temperaturaKelvin: number = 300): ResultadoComparacaoGases {
  const T = Math.max(10, temperaturaKelvin);
  const R = CONSTANTES_FISICAS.R;
  const maxVelocidade = 4500.0;
  const numPontos = 150;
  const passoV = maxVelocidade / numPontos;

  const velocidades: number[] = [];
  for (let i = 0; i <= numPontos; i++) {
    velocidades.push(i * passoV);
  }

  const series: SerieGasComparativo[] = Object.values(CATALOGO_GASES).map(g => {
    const m = g.massaMolarKgPorMol;
    const densidades = velocidades.map(v => calcularDensidadeVelocidadeMB(m, T, v));
    return {
      chave: g.chave,
      nome: `${g.nome} (${g.simbolo})`,
      velocidadeMaisProvavel: Math.sqrt((2.0 * R * T) / m),
      velocidadeMedia: Math.sqrt((8.0 * R * T) / (Math.PI * m)),
      velocidadeQuadraticaMedia: Math.sqrt((3.0 * R * T) / m),
      velocidadeDoSom: Math.sqrt((g.coeficienteAdiabatico * R * T) / m),
      densidades,
    };
  });

  return { temperatura: T, velocidades, series };
}

// ============================================================================
// 4. MODULO 04: CALORIMETRIA EXPLORATORIA DIFERENCIAL (DSC - Lisozima HEWL)
// ============================================================================

// Os 23 pontos experimentais reais da desnaturacao da Lisozima de Clara de Ovo (HEWL)
export const PONTOS_LISOZIMA_DSC: Array<{ t: number; cp: number }> = [
  { t: 40.0, cp: 0.0 },
  { t: 42.5, cp: 0.05 },
  { t: 45.0, cp: 0.12 },
  { t: 47.5, cp: 0.22 },
  { t: 50.0, cp: 0.4 },
  { t: 52.5, cp: 0.75 },
  { t: 55.0, cp: 1.35 },
  { t: 57.5, cp: 2.45 },
  { t: 60.0, cp: 4.3 },
  { t: 62.5, cp: 7.2 },
  { t: 64.0, cp: 9.6 },
  { t: 65.0, cp: 10.8 },
  { t: 66.0, cp: 10.2 },
  { t: 67.5, cp: 7.8 },
  { t: 70.0, cp: 4.5 },
  { t: 72.5, cp: 2.3 },
  { t: 75.0, cp: 1.15 },
  { t: 77.5, cp: 0.55 },
  { t: 80.0, cp: 0.25 },
  { t: 82.5, cp: 0.1 },
  { t: 85.0, cp: 0.04 },
  { t: 87.5, cp: 0.01 },
  { t: 90.0, cp: 0.0 },
];

export interface ResultadoDsc {
  amostra: string;
  temperaturaTransicaoTm: number;
  capacidadeCalorificaMaxima: number;
  entalpiaTrapezio: number;
  entalpiaSimpsonSpline: number;
  entalpiaVantHoff: number;
  tMinIntegracao: number;
  tMaxIntegracao: number;
  pontosDiscretosTemperatura: number[];
  pontosDiscretosCp: number[];
  curvaTemperatura: number[];
  curvaCp: number[];
}

export function calcularDscLocal(tMin: number = 40.0, tMax: number = 90.0): ResultadoDsc {
  const xOrig = PONTOS_LISOZIMA_DSC.map(p => p.t);
  const yOrig = PONTOS_LISOZIMA_DSC.map(p => p.cp);

  const minDataset = xOrig[0];
  const maxDataset = xOrig[xOrig.length - 1];
  const tInfBruto = Math.min(tMin, tMax);
  const tSupBruto = Math.max(tMin, tMax);
  const limiteInferior = Math.max(minDataset, Math.min(tInfBruto, maxDataset - 1.0));
  const limiteSuperior = Math.min(maxDataset, Math.max(tSupBruto, limiteInferior + 1.0));

  const spline = criarSplineCubicoNatural(xOrig, yOrig);

  let entalpiaTrapezio: number;
  let entalpiaSimpsonSpline: number;

  if (limiteInferior <= minDataset && limiteSuperior >= maxDataset) {
    entalpiaTrapezio = integrarTrapezioDiscreto(xOrig, yOrig);
    entalpiaSimpsonSpline = integrarFuncaoSimpson(spline, minDataset, maxDataset, 1000);
  } else {
    entalpiaTrapezio = integrarFuncaoTrapezio(
      t => Math.max(0.0, spline(t)),
      limiteInferior,
      limiteSuperior,
      500
    );
    entalpiaSimpsonSpline = integrarFuncaoSimpson(
      t => Math.max(0.0, spline(t)),
      limiteInferior,
      limiteSuperior,
      1000
    );
  }

  let maxCp = -1.0;
  let tmCelsius = 0.0;
  for (const p of PONTOS_LISOZIMA_DSC) {
    if (p.cp > maxCp) {
      maxCp = p.cp;
      tmCelsius = p.t;
    }
  }

  const tmKelvin = tmCelsius + 273.15;
  const rKj = 0.008314462618;
  const entalpiaVantHoff =
    entalpiaSimpsonSpline > 0
      ? (4.0 * rKj * tmKelvin * tmKelvin * maxCp) / entalpiaSimpsonSpline
      : 0.0;

  const numPontosCurva = 120;
  const passo = (maxDataset - minDataset) / numPontosCurva;
  const curvaTemperatura: number[] = [];
  const curvaCp: number[] = [];

  for (let i = 0; i <= numPontosCurva; i++) {
    const t = minDataset + i * passo;
    curvaTemperatura.push(t);
    curvaCp.push(Math.max(0.0, spline(t)));
  }

  return {
    amostra: 'Hen Egg-White Lysozyme (HEWL)',
    temperaturaTransicaoTm: tmCelsius,
    capacidadeCalorificaMaxima: maxCp,
    entalpiaTrapezio,
    entalpiaSimpsonSpline,
    entalpiaVantHoff,
    tMinIntegracao: limiteInferior,
    tMaxIntegracao: limiteSuperior,
    pontosDiscretosTemperatura: xOrig,
    pontosDiscretosCp: yOrig,
    curvaTemperatura,
    curvaCp,
  };
}

// ============================================================================
// 5. MODULO 05: GASES IDEAIS (PV = nRT), ARRHENIUS E ENERGIA LIVRE DE GIBBS
// ============================================================================

export interface ResultadoTermodinamicaGases {
  volumesLitros: number[];
  pressoesAtm: number[];
  pressoesRef300KAtm: number[];
  pressaoCalculadaAtm: number;
  pressaoCalculadaKPa: number;
  energiaInternaMolarJ: number;
  deltaGPadraoKJ: number;
  constanteEquilibrioK: number;
  espontaneo: boolean;
  taxaArrheniusK: number;
  temperaturasArrhenius: number[];
  taxasArrhenius: number[];
}

export function calcularTermodinamicaLocal(
  molsN: number,
  temperaturaK: number,
  volumeL: number,
  deltaHKJ: number,
  deltaSJPorK: number,
  fatorPreExponencialA: number,
  energiaAtivacaoKJ: number
): ResultadoTermodinamicaGases {
  // Aqui uso R = 0.082057 L*atm/(mol*K) pra conta da pressao sair direto em atm!
  const R_L_ATM = 0.082057366;
  const R_J = CONSTANTES_FISICAS.R;

  const n = Math.max(0.1, molsN);
  const T = Math.max(50, temperaturaK);
  const V = Math.max(0.5, volumeL);

  const pressaoCalculadaAtm = (n * R_L_ATM * T) / V;
  const pressaoCalculadaKPa = pressaoCalculadaAtm * 101.325;
  const energiaInternaMolarJ = 1.5 * R_J * T;

  // Gera a curva isoterma de Boyle-Mariotte variando o volume de 1 L ate 30 L
  const volumesLitros: number[] = [];
  const pressoesAtm: number[] = [];
  const pressoesRef300KAtm: number[] = [];
  for (let v = 1.0; v <= 30.0; v += 0.5) {
    volumesLitros.push(v);
    pressoesAtm.push((n * R_L_ATM * T) / v);
    pressoesRef300KAtm.push((n * R_L_ATM * 300.0) / v);
  }

  // Energia Livre de Gibbs: deltaG = deltaH - T * deltaS (converti deltaH de kJ pra J pra bater com deltaS!)
  const deltaGJ = deltaHKJ * 1000.0 - T * deltaSJPorK;
  const deltaGPadraoKJ = deltaGJ / 1000.0;
  const expoenteK = Math.max(-100, Math.min(100, -deltaGJ / (R_J * T)));
  const constanteEquilibrioK = Math.exp(expoenteK);

  // Equacao de Arrhenius: k(T) = A * e^(-Ea / RT)
  const eaJ = energiaAtivacaoKJ * 1000.0;
  const taxaArrheniusK = fatorPreExponencialA * Math.exp(-eaJ / (R_J * T));

  const temperaturasArrhenius: number[] = [];
  const taxasArrhenius: number[] = [];
  for (let temp = 200; temp <= 1000; temp += 20) {
    temperaturasArrhenius.push(temp);
    taxasArrhenius.push(fatorPreExponencialA * Math.exp(-eaJ / (R_J * temp)));
  }

  return {
    volumesLitros,
    pressoesAtm,
    pressoesRef300KAtm,
    pressaoCalculadaAtm,
    pressaoCalculadaKPa,
    energiaInternaMolarJ,
    deltaGPadraoKJ,
    constanteEquilibrioK,
    espontaneo: deltaGPadraoKJ < 0,
    taxaArrheniusK,
    temperaturasArrhenius,
    taxasArrhenius,
  };
}

// ============================================================================
// 6. EXPORTADOR DE DADOS SIMULADOS EM CSV (Cria um Blob e baixa direto no navegador)
// ============================================================================

export function exportarDadosCsv(nomeArquivo: string, cabecalho: string[], linhas: (string | number)[][]): void {
  const conteudo = [
    cabecalho.join(','),
    ...linhas.map(linha =>
      linha.map(val => (typeof val === 'number' ? val.toFixed(6) : `"${String(val)}"`)).join(',')
    ),
  ].join('\n');

  const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', nomeArquivo);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
