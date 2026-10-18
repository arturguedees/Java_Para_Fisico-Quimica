package com.unit.controller;

import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Controller REST para o Banco de Questoes e Desafios Gamificados.
 * Deixei suporte tanto pra Portugues quanto pra Ingles (parametro lang=en ou lang=pt)
 * pq o professor pediu que o sistema rodasse em ingles por padrao!
 */
@RestController
@RequestMapping("/api/exercicios")
@CrossOrigin(origins = "*")
public class QuizController {

    // DTO (Data Transfer Object) pra guardar os dados de cada questao em memoria
    public static class ExercicioDTO {
        private String id;
        private String titulo;
        private String modulo; // CINETICA, MAXWELL, DSC, AVANCADO
        private String nivel; // Iniciante, Intermediário, Avançado
        private String enunciado;
        private String tipo; // NUMERICO ou MULTIPLA_ESCOLHA
        private List<String> opcoes;
        private double respostaCorretaNumerica;
        private double toleranciaPercentual;
        private int respostaCorretaOpcaoIndex;
        private String explicacao;
        private String dicaFormula;
        private String dicaResolucao;
        private int recompensaXp;
        private int recompensaPontos;

        public ExercicioDTO(String id, String titulo, String modulo, String nivel, String enunciado,
                            String tipo, List<String> opcoes, double respostaCorretaNumerica,
                            double toleranciaPercentual, int respostaCorretaOpcaoIndex,
                            String explicacao, String dicaFormula, String dicaResolucao,
                            int recompensaXp, int recompensaPontos) {
            this.id = id;
            this.titulo = titulo;
            this.modulo = modulo;
            this.nivel = nivel;
            this.enunciado = enunciado;
            this.tipo = tipo;
            this.opcoes = opcoes;
            this.respostaCorretaNumerica = respostaCorretaNumerica;
            this.toleranciaPercentual = toleranciaPercentual;
            this.respostaCorretaOpcaoIndex = respostaCorretaOpcaoIndex;
            this.explicacao = explicacao;
            this.dicaFormula = dicaFormula;
            this.dicaResolucao = dicaResolucao;
            this.recompensaXp = recompensaXp;
            this.recompensaPontos = recompensaPontos;
        }

        public String getId() { return id; }
        public String getTitulo() { return titulo; }
        public String getModulo() { return modulo; }
        public String getNivel() { return nivel; }
        public String getEnunciado() { return enunciado; }
        public String getTipo() { return tipo; }
        public List<String> getOpcoes() { return opcoes; }
        public double getRespostaCorretaNumerica() { return respostaCorretaNumerica; }
        public double getToleranciaPercentual() { return toleranciaPercentual; }
        public int getRespostaCorretaOpcaoIndex() { return respostaCorretaOpcaoIndex; }
        public String getExplicacao() { return explicacao; }
        public String getDicaFormula() { return dicaFormula; }
        public String getDicaResolucao() { return dicaResolucao; }
        public int getRecompensaXp() { return recompensaXp; }
        public int getRecompensaPontos() { return recompensaPontos; }
    }

    private final List<ExercicioDTO> catalogoPt = new ArrayList<>();
    private final List<ExercicioDTO> catalogoEn = new ArrayList<>();

    public QuizController() {
        // Monta os dois catalogos (PT e EN) quando o controller e inicializado pelo Spring
        popularCatalogoPt();
        popularCatalogoEn();
    }

    private void popularCatalogoPt() {
        // 1. Cinetica - Meia Vida 1a Ordem
        catalogoPt.add(new ExercicioDTO(
                "cin_01",
                "Meia-Vida em Cinética de 1ª Ordem",
                "CINETICA",
                "Iniciante",
                "Para uma reação elementar de primeira ordem (A -> B) com constante k = 0.05 s⁻¹ e concentração inicial [A]₀ = 2.0 M, calcule o tempo de meia-vida t½ (em segundos).",
                "NUMERICO",
                Collections.emptyList(),
                13.86,
                0.05,
                -1,
                "Para reações de primeira ordem, o tempo de meia-vida independe da concentração inicial e vale t½ = ln(2)/k = 0.69315 / 0.05 = 13.86 segundos.",
                "Para 1ª ordem: t½ = ln(2) / k = 0.69315 / k. Não depende de [A]₀.",
                "Substitua k = 0.05 s⁻¹ na equação: t½ = 0.69315 / 0.05 = 13.86 segundos.",
                60,
                60
        ));

        // 2. Cinetica - Consumo Ordem Zero
        catalogoPt.add(new ExercicioDTO(
                "cin_02",
                "Consumo Total em Ordem Zero",
                "CINETICA",
                "Iniciante",
                "Em uma reação química de Ordem Zero com [A]₀ = 4.0 M e velocidade k = 0.2 M/s, em quantos segundos todo o reagente A será completamente consumido ([A] = 0)?",
                "NUMERICO",
                Collections.emptyList(),
                20.0,
                0.05,
                -1,
                "Na cinética de ordem zero, [A] = [A]₀ - k*t. Logo, o tempo para exaustão é t = [A]₀ / k = 4.0 / 0.2 = 20.0 segundos.",
                "A equação integrada de ordem zero é [A](t) = [A]₀ - k·t. Para [A]=0, isole t.",
                "Faça 0 = 4.0 - 0.2·t => 0.2·t = 4.0 => t = 4.0 / 0.2 = 20.0 segundos.",
                50,
                50
        ));

        // 3. Cinetica - Tempo de Vida Quimico (e-folding time tau)
        catalogoPt.add(new ExercicioDTO(
                "cin_03",
                "Tempo de Vida de Poluente Atmosférico (e-folding time τ)",
                "CINETICA",
                "Intermediário",
                "Na química atmosférica (Lab 3 do relatório ACS), o tempo de vida químico τ (e-folding time) de um poluente degradado por reação de 1ª ordem é o tempo para a concentração cair a 1/e (~36.8%) do valor inicial. Se k = 0.04 s⁻¹, calcule τ em segundos.",
                "NUMERICO",
                Collections.emptyList(),
                25.0,
                0.05,
                -1,
                "O tempo de vida de e-folding é dado por τ = 1/k. Para k = 0.04 s⁻¹, τ = 1 / 0.04 = 25.0 segundos.",
                "A relação fundamental entre taxa e tempo de vida de decaimento exponencial é τ = 1 / k.",
                "Basta inverter a constante de velocidade: τ = 1 / 0.04 = 25.0 s. Note que t½ = τ · ln(2) ≈ 0.693 · τ.",
                70,
                70
        ));

        // 4. Maxwell - Velocidade Mais Provavel do Argonio
        catalogoPt.add(new ExercicioDTO(
                "max_01",
                "Velocidade Mais Provável do Argônio (300 K)",
                "MAXWELL",
                "Intermediário",
                "Calcule a velocidade mais provável (v_mp em m/s) das moléculas de gás Argônio (M = 0.03995 kg/mol) à temperatura ambiente de 300 K. Use R = 8.314 J/(mol·K).",
                "NUMERICO",
                Collections.emptyList(),
                353.5,
                0.05,
                -1,
                "v_mp = sqrt((2 * 8.31446 * 300) / 0.03995) = sqrt(4988.68 / 0.03995) = sqrt(124873) ≈ 353.4 m/s.",
                "A fórmula da velocidade mais provável no pico da curva é v_mp = √(2 · R · T / M). Lembre de usar M em kg/mol!",
                "Calcule: 2 · 8.314 · 300 = 4988.4; Divida por 0.03995 = 124866; Tire a raiz quadrada: √124866 ≈ 353.4 m/s.",
                75,
                75
        ));

        // 5. Maxwell - Relacao de Massas Molares
        catalogoPt.add(new ExercicioDTO(
                "max_02",
                "Comparação de Gases à Mesma Temperatura",
                "MAXWELL",
                "Intermediário",
                "À mesma temperatura de 400 K, qual gás apresenta maior velocidade média molecular entre o Hélio (He, M = 4 g/mol) e o Oxigênio (O₂, M = 32 g/mol)?",
                "MULTIPLA_ESCOLHA",
                Arrays.asList(
                        "O Hélio, pois a velocidade é inversamente proporcional à raiz quadrada da massa molar.",
                        "O Oxigênio, pois moléculas diatômicas sempre possuem maior energia cinética translacional.",
                        "Ambos possuem a mesma velocidade média porque estão à mesma temperatura.",
                        "O Oxigênio, pois sua massa maior gera maior momento linear."
                ),
                0,
                0,
                0,
                "De acordo com a teoria cinética dos gases, v_media é proporcional a 1/sqrt(M). Como o Hélio possui massa molar 8 vezes menor que o O₂, suas moléculas movem-se muito mais rapidamente.",
                "Lembre-se da lei de Graham e da distribuição de velocidades: v ∝ √(T/M). Quanto menor a massa M, maior a velocidade.",
                "Compare as massas molares: M(He) = 4 g/mol vs M(O₂) = 32 g/mol. O Hélio é 8x mais leve, logo move-se √8 ≈ 2.83x mais veloz.",
                70,
                70
        ));

        // 6. Maxwell - Velocidade do Som
        catalogoPt.add(new ExercicioDTO(
                "max_03",
                "Velocidade do Som no Gás Hélio (300 K)",
                "MAXWELL",
                "Avançado",
                "No módulo 5 do artigo ACS, estuda-se a velocidade do som no gás: c = √(γ·R·T / M). Para o Hélio (gás nobre monoatômico com γ = 1.667 e M = 0.004 kg/mol) a 300 K, qual é a velocidade do som (em m/s)?",
                "NUMERICO",
                Collections.emptyList(),
                1019.5,
                0.05,
                -1,
                "c = sqrt(1.667 * 8.314 * 300 / 0.004) = sqrt(4157.8 / 0.004) = sqrt(1039460) ≈ 1019.5 m/s. Três vezes mais rápido do que no ar!",
                "Use a equação termodinâmica da velocidade do som adiabática: c = √(γ · R · T / M).",
                "Substitua: γ = 1.667, R = 8.314 J/mol·K, T = 300 K, M = 0.004 kg/mol. Multiplique o numerador (4157.8), divida por 0.004 (= 1039458) e extraia a raiz: ≈ 1019.5 m/s.",
                90,
                90
        ));

        // 7. DSC - Temperatura de Desnaturacao da Lisozima
        catalogoPt.add(new ExercicioDTO(
                "dsc_01",
                "Pico de Transição Térmica (Tm) da Lisozima",
                "DSC",
                "Intermediário",
                "Analisando a curva experimental de Calorimetria Exploratória Diferencial (DSC) da proteína Lisozima de Clara de Ovo (HEWL), qual é a temperatura de transição térmica (Tm em °C) onde a capacidade calorífica de excesso atinge o pico de 10.80 kJ/(mol·K)?",
                "NUMERICO",
                Collections.emptyList(),
                65.0,
                0.02,
                -1,
                "O pico termodinâmico máximo de desnaturação conformacional da Lisozima ocorre exatamente a 65.0 °C no conjunto de dados HEWL.",
                "Procure visualmente no gráfico ou na tabela o ponto de valor máximo da capacidade calorífica ΔCp.",
                "O valor máximo de 10.80 kJ/(mol·K) na tabela de dados da Lisozima está exatamente na linha onde T = 65.0 °C.",
                80,
                80
        ));

        // 8. DSC - Significado Fisico da Area sob a Curva
        catalogoPt.add(new ExercicioDTO(
                "dsc_02",
                "Entalpia Calorimétrica de Desnaturação",
                "DSC",
                "Avançado",
                "Na termodinâmica de biopolímeros por DSC, o que representa geometricamente a integral da capacidade calorífica em excesso (Cp_excesso) em função da temperatura absoluta?",
                "MULTIPLA_ESCOLHA",
                Arrays.asList(
                        "A variação de entalpia calorimétrica de desnaturação (ΔH_cal) da transição de fase.",
                        "A velocidade de reação enzimática de primeira ordem.",
                        "A constante dielétrica da solução aquosa.",
                        "A densidade de probabilidade de velocidades de Maxwell."
                ),
                0,
                0,
                0,
                "A integral definida ∫ Cp dT entre a linha de base inicial e final fornece diretamente a variação total de entalpia da transição conformacional (ΔH_cal).",
                "Pela 1ª Lei da Termodinâmica a pressão constante: dH = Cp dT. Logo, integrando Cp dT obtemos ΔH.",
                "A área abaixo do gráfico de calor específico em excesso equivale à entalpia total de desnaturação da proteína (ΔH_cal).",
                85,
                85
        ));

        // 9. Avancado - Integracao Numerica com Splines
        catalogoPt.add(new ExercicioDTO(
                "dsc_03",
                "Precisão Numérica: Simpson 1/3 vs Trapézio",
                "AVANCADO",
                "Avançado",
                "Por que a Regra de Simpson 1/3 clássica não pode ser aplicada diretamente em dados experimentais brutos com espaçamento de temperatura não-uniforme sem antes realizar interpolação por Spline Cúbico?",
                "MULTIPLA_ESCOLHA",
                Arrays.asList(
                        "Porque o método de Simpson clássico assume um passo constante h entre os pontos.",
                        "Porque o método de Simpson só funciona com números primos.",
                        "Porque dados térmicos sempre violam o princípio da conservação da energia.",
                        "Porque a regra do trapézio é sempre mais precisa que Simpson em qualquer situação."
                ),
                0,
                0,
                0,
                "A dedução do método de Simpson 1/3 baseia-se na integração analítica de parábolas em pares de intervalos com comprimento uniforme h = (b-a)/(2n). Com passos desiguais, é necessário interpolar via Spline Cúbico contínuo.",
                "Pense na fórmula de Simpson: h/3 · (f0 + 4f1 + 2f2 + ...). Onde 'h' aparece na fórmula?",
                "O 'h' é único e colocado em evidência justamente porque presume que todos os intervalos x_{i+1} - x_i são idênticos.",
                110,
                110
        ));

        // 10. Cinetica - Arrhenius & Energia de Ativacao
        catalogoPt.add(new ExercicioDTO(
                "cin_04",
                "Energia de Ativação via Equação de Arrhenius",
                "CINETICA",
                "Avançado",
                "Uma reação tem sua constante de velocidade duplicada (k₂ = 2·k₁) quando a temperatura sobe de 300 K para 310 K. Calcule a energia de ativação Ea em kJ/mol. Use R = 8.314 J/(mol·K).",
                "NUMERICO",
                Collections.emptyList(),
                53.6,
                0.05,
                -1,
                "Pela forma integrada de Arrhenius: ln(k₂/k₁) = (Ea/R) · (1/T₁ - 1/T₂). Logo, Ea = R · ln(2) · T₁ · T₂ / (T₂ - T₁) = 8.314 · 0.69315 · 300 · 310 / 10 ≈ 53580 J/mol = 53.6 kJ/mol.",
                "Use a equação integrada de Arrhenius: ln(k₂/k₁) = (Ea/R) · (1/T₁ - 1/T₂). Lembre de converter para kJ/mol.",
                "Isole Ea: Ea = R · ln(2) / (1/300 - 1/310) = 8.314 · 0.69315 / 0.0001075 ≈ 53580 J/mol = 53.6 kJ/mol.",
                95,
                95
        ));

        // 11. Cinetica - Segunda Ordem
        catalogoPt.add(new ExercicioDTO(
                "cin_05",
                "Cinética de Segunda Ordem e Meia-Vida",
                "CINETICA",
                "Intermediário",
                "Para uma reação de 2ª ordem do tipo 2A -> Produtos, se a concentração inicial de reagente [A]₀ for duplicada, o que acontecerá com o tempo de meia-vida t½?",
                "MULTIPLA_ESCOLHA",
                Arrays.asList(
                        "O tempo de meia-vida cairá pela metade (t½ é inversamente proporcional a [A]₀).",
                        "O tempo de meia-vida dobrará de valor.",
                        "O tempo de meia-vida permanecerá exatamente o mesmo.",
                        "O tempo de meia-vida quadruplicará."
                ),
                0,
                0,
                0,
                "Para reações de 2ª ordem, a lei integrada fornece t½ = 1 / (k · [A]₀). Portanto, dobrar a concentração inicial faz o tempo de meia-vida cair pela metade.",
                "Considere a fórmula da meia-vida de 2ª ordem: t½ = 1 / (k · [A]₀). Observe o expoente de [A]₀ no denominador.",
                "Como [A]₀ está no denominador elevado a 1, dobrar [A]₀ divide o tempo pela metade: t½' = t½ / 2.",
                80,
                80
        ));

        // 12. Maxwell - Fator com Temperatura Quadruplicada
        catalogoPt.add(new ExercicioDTO(
                "max_04",
                "Fator de Aceleração com Temperatura Quadruplicada",
                "MAXWELL",
                "Iniciante",
                "Se a temperatura de um gás nobre ideal for quadruplicada de 300 K para 1200 K, por qual fator numérico a velocidade média molecular se multiplicará?",
                "NUMERICO",
                Collections.emptyList(),
                2.0,
                0.02,
                -1,
                "A velocidade média é proporcional à raiz quadrada da temperatura: v ∝ √T. Logo, v(1200 K) / v(300 K) = √(1200 / 300) = √4 = 2.0.",
                "Pela teoria cinética de Maxwell: v ∝ √(T). Calcule a raiz da razão entre as temperaturas: √(T₂ / T₁).",
                "Faça √(1200 / 300) = √4 = 2.0. As moléculas dobram de velocidade ao quadruplicar a temperatura.",
                65,
                65
        ));

        // 13. Maxwell - Velocidade Quadratica Media N2
        catalogoPt.add(new ExercicioDTO(
                "max_05",
                "Velocidade Quadrática Média do Nitrogênio (300 K)",
                "MAXWELL",
                "Intermediário",
                "Calcule a velocidade quadrática média (v_rms em m/s) das moléculas de N₂ (M = 0.02801 kg/mol) no ar a 300 K. Use R = 8.314 J/(mol·K).",
                "NUMERICO",
                Collections.emptyList(),
                516.9,
                0.05,
                -1,
                "v_rms = √(3 · R · T / M) = √(3 · 8.31446 · 300 / 0.02801) = √(7483.0 / 0.02801) = √267155 ≈ 516.9 m/s.",
                "A fórmula para a velocidade quadrática média é v_rms = √(3 · R · T / M).",
                "Multiplique: 3 · 8.314 · 300 = 7482.6; Divida por 0.02801 = 267140; Raiz quadrada: √267140 ≈ 516.9 m/s.",
                80,
                80
        ));

        // 14. DSC - Largura à Meia-Altura
        catalogoPt.add(new ExercicioDTO(
                "dsc_04",
                "Largura à Meia-Altura do Pico Térmico (ΔT½)",
                "DSC",
                "Intermediário",
                "No termograma da Lisozima, a capacidade calorífica atinge metade do pico máximo (ΔCp = 5.40 kJ/mol·K) em T₁ = 61.0 °C e T₂ = 69.0 °C. Qual é a largura à meia-altura ΔT½ (em °C)?",
                "NUMERICO",
                Collections.emptyList(),
                8.0,
                0.02,
                -1,
                "A largura à meia-altura é a diferença direta entre as temperaturas de meia altura: ΔT½ = T₂ - T₁ = 69.0 - 61.0 = 8.0 °C.",
                "Subtraia a temperatura inicial da final nos pontos onde ΔCp atinge metade do valor de pico.",
                "Calcule 69.0 - 61.0 = 8.0 °C. Quanto mais estreito o pico, maior a cooperatividade da transição conformacional.",
                70,
                70
        ));

        // 15. DSC - Entalpia por Triangulacao
        catalogoPt.add(new ExercicioDTO(
                "dsc_05",
                "Entalpia Aproximada por Triangulação de Pico",
                "DSC",
                "Avançado",
                "Aproximando o pico térmico da Lisozima por um triângulo de base ΔT = 20.0 °C (de 55 a 75 °C) e altura máxima ΔCp = 10.80 kJ/(mol·K), estime a entalpia de desnaturação ΔH (em kJ/mol).",
                "NUMERICO",
                Collections.emptyList(),
                108.0,
                0.05,
                -1,
                "A área de um triângulo é (base · altura) / 2. Logo, ΔH ≈ (20.0 · 10.80) / 2 = 108.0 kJ/mol.",
                "A entalpia é a integral sob a curva. Para um triângulo: Área = ½ · base · altura.",
                "Calcule: 0.5 · 20.0 · 10.80 = 108.0 kJ/mol.",
                85,
                85
        ));

        // 16. Termodinamica - Energia Livre de Gibbs
        catalogoPt.add(new ExercicioDTO(
                "termo_01",
                "Energia Livre de Gibbs Padrão (ΔG°)",
                "AVANCADO",
                "Avançado",
                "Para uma reação química com constante de equilíbrio K = 100 à temperatura de 298.15 K, calcule a variação de energia livre de Gibbs padrão ΔG° (em kJ/mol). Use R = 8.314 J/(mol·K).",
                "NUMERICO",
                Collections.emptyList(),
                -11.41,
                0.05,
                -1,
                "ΔG° = -R · T · ln(K) = -8.314 · 298.15 · ln(100) / 1000 = -8.314 · 298.15 · 4.60517 / 1000 = -11.41 kJ/mol.",
                "Aplique a relação termodinâmica fundamental: ΔG° = -R · T · ln(K). Lembre de converter J para kJ dividindo por 1000.",
                "Calcule: ln(100) ≈ 4.605; -8.314 · 298.15 · 4.605 = -11415 J/mol = -11.41 kJ/mol. O valor negativo indica espontaneidade no estado padrão.",
                95,
                95
        ));

        // 17. Termodinamica - Trabalho de Expansao Reversivel
        catalogoPt.add(new ExercicioDTO(
                "termo_02",
                "Trabalho em Expansão Isotérmica Reversível",
                "AVANCADO",
                "Intermediário",
                "Qual expressão matemática deduzida da 1ª Lei representa o trabalho W realizado por 1 mol de gás ideal em uma expansão isotérmica reversível de volume V₁ até V₂?",
                "MULTIPLA_ESCOLHA",
                Arrays.asList(
                        "W = n · R · T · ln(V₂ / V₁)",
                        "W = -P · ΔV (com pressão constante)",
                        "W = n · Cv · ΔT",
                        "W = 0 (nenhum trabalho é realizado em processos isotérmicos)"
                ),
                0,
                0,
                0,
                "W = ∫ P dV = ∫ (nRT/V) dV = n · R · T · ln(V₂ / V₁). Como T é constante, nRT sai da integral e sobra ∫ dV/V = ln(V₂/V₁).",
                "Lembre que em um processo reversível com gás ideal, P = nRT/V ao longo de toda a trajetória de integração.",
                "Integrando dV/V de V₁ a V₂ obtém-se o logaritmo natural ln(V₂/V₁), multiplicando por nRT.",
                85,
                85
        ));

        // 18. Termodinamica - Entropia de Transicao de Fase
        catalogoPt.add(new ExercicioDTO(
                "termo_03",
                "Entropia de Desnaturação Térmica (ΔS)",
                "AVANCADO",
                "Avançado",
                "Se a desnaturação da proteína Lisozima ocorre reversivelmente a Tm = 65.0 °C (338.15 K) com entalpia ΔH = 432.8 kJ/mol, calcule a variação de entropia conformacional ΔS em kJ/(mol·K).",
                "NUMERICO",
                Collections.emptyList(),
                1.28,
                0.05,
                -1,
                "No equilíbrio térmico da transição (Tm), ΔG = 0 => ΔH - Tm·ΔS = 0 => ΔS = ΔH / Tm = 432.8 / 338.15 ≈ 1.28 kJ/(mol·K).",
                "Em equilíbrio de fase (temperatura de transição Tm): ΔG = 0, logo ΔS = ΔH / Tm. Converta Tm para Kelvin!",
                "Calcule: Tm = 65.0 + 273.15 = 338.15 K. Depois divida: 432.8 / 338.15 = 1.28 kJ/(mol·K).",
                90,
                90
        ));
    }

    private void popularCatalogoEn() {
        // 1. Kinetics - First-Order Half-Life
        catalogoEn.add(new ExercicioDTO(
                "cin_01",
                "First-Order Kinetics Half-Life",
                "CINETICA",
                "Beginner",
                "For an elementary first-order reaction (A -> B) with rate constant k = 0.05 s⁻¹ and initial concentration [A]₀ = 2.0 M, calculate the half-life t½ (in seconds).",
                "NUMERICO",
                Collections.emptyList(),
                13.86,
                0.05,
                -1,
                "For first-order reactions, the half-life is independent of initial concentration and equals t½ = ln(2)/k = 0.69315 / 0.05 = 13.86 seconds.",
                "For 1st order: t½ = ln(2) / k = 0.69315 / k. It does not depend on [A]₀.",
                "Substitute k = 0.05 s⁻¹ into the equation: t½ = 0.69315 / 0.05 = 13.86 seconds.",
                60,
                60
        ));

        // 2. Kinetics - Zero-Order Total Depletion
        catalogoEn.add(new ExercicioDTO(
                "cin_02",
                "Zero-Order Complete Depletion Time",
                "CINETICA",
                "Beginner",
                "In a Zero-Order chemical reaction with [A]₀ = 4.0 M and rate constant k = 0.2 M/s, in how many seconds will reactant A be completely consumed ([A] = 0)?",
                "NUMERICO",
                Collections.emptyList(),
                20.0,
                0.05,
                -1,
                "In zero-order kinetics, [A] = [A]₀ - k*t. Thus, the time for complete exhaustion is t = [A]₀ / k = 4.0 / 0.2 = 20.0 seconds.",
                "The integrated zero-order rate law is [A](t) = [A]₀ - k·t. Set [A]=0 and solve for t.",
                "Set 0 = 4.0 - 0.2·t => 0.2·t = 4.0 => t = 4.0 / 0.2 = 20.0 seconds.",
                50,
                50
        ));

        // 3. Kinetics - Atmospheric Pollutant Lifetime (e-folding time tau)
        catalogoEn.add(new ExercicioDTO(
                "cin_03",
                "Atmospheric Pollutant Chemical Lifetime (e-folding time τ)",
                "CINETICA",
                "Intermediate",
                "In atmospheric chemistry (ACS Report Lab 3), the chemical lifetime τ (e-folding time) of a pollutant degraded by a 1st-order reaction is the time for concentration to drop to 1/e (~36.8%) of its initial value. If k = 0.04 s⁻¹, calculate τ in seconds.",
                "NUMERICO",
                Collections.emptyList(),
                25.0,
                0.05,
                -1,
                "The e-folding lifetime is given by τ = 1/k. For k = 0.04 s⁻¹, τ = 1 / 0.04 = 25.0 seconds.",
                "The fundamental relationship between rate constant and exponential decay lifetime is τ = 1 / k.",
                "Simply invert the rate constant: τ = 1 / 0.04 = 25.0 s. Note that t½ = τ · ln(2) ≈ 0.693 · τ.",
                70,
                70
        ));

        // 4. Maxwell - Most Probable Speed of Argon
        catalogoEn.add(new ExercicioDTO(
                "max_01",
                "Most Probable Speed of Argon (300 K)",
                "MAXWELL",
                "Intermediate",
                "Calculate the most probable speed (v_mp in m/s) of Argon gas molecules (M = 0.03995 kg/mol) at room temperature (300 K). Use R = 8.314 J/(mol·K).",
                "NUMERICO",
                Collections.emptyList(),
                353.5,
                0.05,
                -1,
                "v_mp = sqrt((2 * 8.31446 * 300) / 0.03995) = sqrt(4988.68 / 0.03995) = sqrt(124873) ≈ 353.4 m/s.",
                "The formula for the most probable speed at the peak of the curve is v_mp = √(2 · R · T / M). Remember to use M in kg/mol!",
                "Calculate: 2 · 8.314 · 300 = 4988.4; Divide by 0.03995 = 124866; Take the square root: √124866 ≈ 353.4 m/s.",
                75,
                75
        ));

        // 5. Maxwell - Molar Mass Comparison
        catalogoEn.add(new ExercicioDTO(
                "max_02",
                "Gas Comparison at Constant Temperature",
                "MAXWELL",
                "Intermediate",
                "At the same temperature of 400 K, which gas exhibits a higher average molecular speed between Helium (He, M = 4 g/mol) and Oxygen (O₂, M = 32 g/mol)?",
                "MULTIPLA_ESCOLHA",
                Arrays.asList(
                        "Helium, because molecular speed is inversely proportional to the square root of molar mass.",
                        "Oxygen, because diatomic molecules always have higher translational kinetic energy.",
                        "Both gases have the exact same average speed because they are at the same temperature.",
                        "Oxygen, because its larger mass generates greater linear momentum."
                ),
                0,
                0,
                0,
                "According to the kinetic theory of gases, v_avg is proportional to 1/sqrt(M). Since Helium has a molar mass 8 times smaller than O₂, its atoms move significantly faster.",
                "Recall Graham's law and the Maxwell speed distribution: v ∝ √(T/M). The smaller the mass M, the higher the speed.",
                "Compare molar masses: M(He) = 4 g/mol vs M(O₂) = 32 g/mol. Helium is 8x lighter, so it moves √8 ≈ 2.83x faster.",
                70,
                70
        ));

        // 6. Maxwell - Speed of Sound in Helium
        catalogoEn.add(new ExercicioDTO(
                "max_03",
                "Speed of Sound in Helium Gas (300 K)",
                "MAXWELL",
                "Advanced",
                "In Module 5 of the ACS paper, the speed of sound in an ideal gas is studied: c = √(γ·R·T / M). For Helium (a monatomic noble gas with γ = 1.667 and M = 0.004 kg/mol) at 300 K, what is the speed of sound (in m/s)?",
                "NUMERICO",
                Collections.emptyList(),
                1019.5,
                0.05,
                -1,
                "c = sqrt(1.667 * 8.314 * 300 / 0.004) = sqrt(4157.8 / 0.004) = sqrt(1039460) ≈ 1019.5 m/s. Almost three times faster than in air!",
                "Use the thermodynamic adiabatic speed of sound equation: c = √(γ · R · T / M).",
                "Substitute: γ = 1.667, R = 8.314 J/mol·K, T = 300 K, M = 0.004 kg/mol. Multiply numerator (4157.8), divide by 0.004 (= 1039458) and take the square root: ≈ 1019.5 m/s.",
                90,
                90
        ));

        // 7. DSC - Lysozyme Melting Temperature (Tm)
        catalogoEn.add(new ExercicioDTO(
                "dsc_01",
                "Lysozyme Thermal Transition Peak (Tm)",
                "DSC",
                "Intermediate",
                "Analyzing the experimental Differential Scanning Calorimetry (DSC) curve of Hen Egg-White Lysozyme (HEWL), what is the thermal transition temperature (Tm in °C) where excess heat capacity reaches its peak of 10.80 kJ/(mol·K)?",
                "NUMERICO",
                Collections.emptyList(),
                65.0,
                0.02,
                -1,
                "The maximum thermodynamic conformational denaturation peak of Lysozyme occurs at exactly 65.0 °C in the HEWL dataset.",
                "Look visually at the chart or data table for the maximum point of excess heat capacity ΔCp.",
                "The maximum value of 10.80 kJ/(mol·K) in the Lysozyme dataset is located right at T = 65.0 °C.",
                80,
                80
        ));

        // 8. DSC - Physical Meaning of Area Under the Curve
        catalogoEn.add(new ExercicioDTO(
                "dsc_02",
                "Calorimetric Denaturation Enthalpy",
                "DSC",
                "Advanced",
                "In biopolymer thermodynamics via DSC, what does the definite integral of excess heat capacity (Cp_excess) with respect to temperature geometrically represent?",
                "MULTIPLA_ESCOLHA",
                Arrays.asList(
                        "The calorimetric denaturation enthalpy change (ΔH_cal) of the phase transition.",
                        "The first-order enzymatic reaction rate.",
                        "The dielectric constant of the aqueous solution.",
                        "The Maxwell speed probability density."
                ),
                0,
                0,
                0,
                "The definite integral ∫ Cp dT between the initial and final baseline directly yields the total enthalpy change of the conformational transition (ΔH_cal).",
                "By the 1st Law of Thermodynamics at constant pressure: dH = Cp dT. Therefore, integrating Cp dT gives ΔH.",
                "The area under the excess specific heat curve equals the total protein denaturation enthalpy (ΔH_cal).",
                85,
                85
        ));

        // 9. Advanced - Numerical Integration with Splines
        catalogoEn.add(new ExercicioDTO(
                "dsc_03",
                "Numerical Precision: Simpson's 1/3 vs Trapezoidal Rule",
                "AVANCADO",
                "Advanced",
                "Why can't the classical Simpson's 1/3 Rule be applied directly to raw experimental data with non-uniform temperature spacing without first performing Cubic Spline interpolation?",
                "MULTIPLA_ESCOLHA",
                Arrays.asList(
                        "Because classical Simpson's rule assumes a constant step size h between points.",
                        "Because Simpson's method only works with prime numbers.",
                        "Because thermal data always violates the law of conservation of energy.",
                        "Because the trapezoidal rule is always more accurate than Simpson's rule in every situation."
                ),
                0,
                0,
                0,
                "The derivation of Simpson's 1/3 rule relies on analytically integrating parabolas over pairs of subintervals with uniform step size h = (b-a)/(2n). With unequal spacing, continuous Cubic Spline interpolation is required first.",
                "Think about Simpson's formula: h/3 · (f0 + 4f1 + 2f2 + ...). Where does 'h' appear in the formula?",
                "The step 'h' is factored out as a single constant precisely because it assumes all intervals x_{i+1} - x_i are identical.",
                110,
                110
        ));

        // 10. Kinetics - Arrhenius & Activation Energy
        catalogoEn.add(new ExercicioDTO(
                "cin_04",
                "Activation Energy via Arrhenius Equation",
                "CINETICA",
                "Advanced",
                "A reaction doubles its rate constant (k₂ = 2·k₁) when temperature increases from 300 K to 310 K. Calculate the activation energy Ea in kJ/mol. Use R = 8.314 J/(mol·K).",
                "NUMERICO",
                Collections.emptyList(),
                53.6,
                0.05,
                -1,
                "Using the integrated Arrhenius equation: ln(k₂/k₁) = (Ea/R) · (1/T₁ - 1/T₂). Hence, Ea = R · ln(2) · T₁ · T₂ / (T₂ - T₁) = 8.314 · 0.69315 · 300 · 310 / 10 ≈ 53580 J/mol = 53.6 kJ/mol.",
                "Use the integrated Arrhenius law: ln(k₂/k₁) = (Ea/R) · (1/T₁ - 1/T₂). Remember to convert to kJ/mol.",
                "Solve for Ea: Ea = R · ln(2) / (1/300 - 1/310) = 8.314 · 0.69315 / 0.0001075 ≈ 53580 J/mol = 53.6 kJ/mol.",
                95,
                95
        ));

        // 11. Kinetics - Second-Order Half-Life
        catalogoEn.add(new ExercicioDTO(
                "cin_05",
                "Second-Order Kinetics and Half-Life",
                "CINETICA",
                "Intermediate",
                "For a second-order reaction of the type 2A -> Products, if the initial reactant concentration [A]₀ is doubled, what happens to the half-life t½?",
                "MULTIPLA_ESCOLHA",
                Arrays.asList(
                        "The half-life will be cut in half (t½ is inversely proportional to [A]₀).",
                        "The half-life will double in value.",
                        "The half-life will remain exactly the same.",
                        "The half-life will quadruple."
                ),
                0,
                0,
                0,
                "For 2nd-order reactions, the integrated rate law yields t½ = 1 / (k · [A]₀). Thus, doubling the initial concentration halves the half-life.",
                "Consider the second-order half-life formula: t½ = 1 / (k · [A]₀). Observe the exponent of [A]₀ in the denominator.",
                "Since [A]₀ is in the denominator with power 1, doubling [A]₀ cuts time in half: t½' = t½ / 2.",
                80,
                80
        ));

        // 12. Maxwell - Quadrupled Temperature Speed Factor
        catalogoEn.add(new ExercicioDTO(
                "max_04",
                "Acceleration Factor with Quadrupled Temperature",
                "MAXWELL",
                "Beginner",
                "If the temperature of an ideal gas is quadrupled from 300 K to 1200 K, by what numerical factor will the average molecular speed multiply?",
                "NUMERICO",
                Collections.emptyList(),
                2.0,
                0.02,
                -1,
                "Average speed is proportional to the square root of temperature: v ∝ √T. Therefore, v(1200 K) / v(300 K) = √(1200 / 300) = √4 = 2.0.",
                "By Maxwell's kinetic theory: v ∝ √(T). Calculate the square root of the temperature ratio: √(T₂ / T₁).",
                "Compute √(1200 / 300) = √4 = 2.0. Molecules double their speed when temperature is quadrupled.",
                65,
                65
        ));

        // 13. Maxwell - Root-Mean-Square Speed of N2
        catalogoEn.add(new ExercicioDTO(
                "max_05",
                "Root-Mean-Square Speed of Nitrogen (300 K)",
                "MAXWELL",
                "Intermediate",
                "Calculate the root-mean-square speed (v_rms in m/s) of N₂ molecules (M = 0.02801 kg/mol) in air at 300 K. Use R = 8.314 J/(mol·K).",
                "NUMERICO",
                Collections.emptyList(),
                516.9,
                0.05,
                -1,
                "v_rms = √(3 · R · T / M) = √(3 · 8.31446 · 300 / 0.02801) = √(7483.0 / 0.02801) = √267155 ≈ 516.9 m/s.",
                "The formula for root-mean-square speed is v_rms = √(3 · R · T / M).",
                "Multiply: 3 · 8.314 · 300 = 7482.6; Divide by 0.02801 = 267140; Square root: √267140 ≈ 516.9 m/s.",
                80,
                80
        ));

        // 14. DSC - Full Width at Half Maximum (FWHM)
        catalogoEn.add(new ExercicioDTO(
                "dsc_04",
                "Thermal Peak Full Width at Half Maximum (ΔT½)",
                "DSC",
                "Intermediate",
                "In the Lysozyme thermogram, heat capacity reaches half its peak value (ΔCp = 5.40 kJ/mol·K) at T₁ = 61.0 °C and T₂ = 69.0 °C. What is the full width at half maximum ΔT½ (in °C)?",
                "NUMERICO",
                Collections.emptyList(),
                8.0,
                0.02,
                -1,
                "The full width at half maximum is the direct difference between the half-height temperatures: ΔT½ = T₂ - T₁ = 69.0 - 61.0 = 8.0 °C.",
                "Subtract the lower temperature from the upper temperature where ΔCp reaches half the peak value.",
                "Calculate 69.0 - 61.0 = 8.0 °C. The narrower the peak, the higher the cooperativity of the conformational transition.",
                70,
                70
        ));

        // 15. DSC - Peak Triangulation Enthalpy
        catalogoEn.add(new ExercicioDTO(
                "dsc_05",
                "Approximate Enthalpy via Peak Triangulation",
                "DSC",
                "Advanced",
                "Approximating the Lysozyme denaturation peak as a triangle with base ΔT = 20.0 °C (from 55 to 75 °C) and peak height ΔCp = 10.80 kJ/(mol·K), estimate the denaturation enthalpy ΔH (in kJ/mol).",
                "NUMERICO",
                Collections.emptyList(),
                108.0,
                0.05,
                -1,
                "The area of a triangle is (base · height) / 2. Therefore, ΔH ≈ (20.0 · 10.80) / 2 = 108.0 kJ/mol.",
                "Enthalpy is the integral under the curve. For a triangle: Area = ½ · base · height.",
                "Calculate: 0.5 · 20.0 · 10.80 = 108.0 kJ/mol.",
                85,
                85
        ));

        // 16. Thermodynamics - Standard Gibbs Free Energy
        catalogoEn.add(new ExercicioDTO(
                "termo_01",
                "Standard Gibbs Free Energy (ΔG°)",
                "AVANCADO",
                "Advanced",
                "For a chemical reaction with equilibrium constant K = 100 at 298.15 K, calculate the standard Gibbs free energy change ΔG° (in kJ/mol). Use R = 8.314 J/(mol·K).",
                "NUMERICO",
                Collections.emptyList(),
                -11.41,
                0.05,
                -1,
                "ΔG° = -R · T · ln(K) = -8.314 · 298.15 · ln(100) / 1000 = -8.314 · 298.15 · 4.60517 / 1000 = -11.41 kJ/mol.",
                "Apply the fundamental thermodynamic relation: ΔG° = -R · T · ln(K). Remember to convert J to kJ by dividing by 1000.",
                "Compute: ln(100) ≈ 4.605; -8.314 · 298.15 · 4.605 = -11415 J/mol = -11.41 kJ/mol. The negative value indicates spontaneity under standard conditions.",
                95,
                95
        ));

        // 17. Thermodynamics - Reversible Expansion Work
        catalogoEn.add(new ExercicioDTO(
                "termo_02",
                "Work in Reversible Isothermal Expansion",
                "AVANCADO",
                "Intermediate",
                "Which mathematical expression derived from the 1st Law represents the work W performed by 1 mole of an ideal gas during a reversible isothermal expansion from volume V₁ to V₂?",
                "MULTIPLA_ESCOLHA",
                Arrays.asList(
                        "W = n · R · T · ln(V₂ / V₁)",
                        "W = -P · ΔV (at constant external pressure)",
                        "W = n · Cv · ΔT",
                        "W = 0 (no work is performed during isothermal processes)"
                ),
                0,
                0,
                0,
                "W = ∫ P dV = ∫ (nRT/V) dV = n · R · T · ln(V₂ / V₁). Since T is constant, nRT factors out leaving ∫ dV/V = ln(V₂/V₁).",
                "Remember that in a reversible process with an ideal gas, P = nRT/V along the entire path.",
                "Integrating dV/V from V₁ to V₂ yields the natural logarithm ln(V₂/V₁), multiplied by nRT.",
                85,
                85
        ));

        // 18. Thermodynamics - Phase Transition Entropy
        catalogoEn.add(new ExercicioDTO(
                "termo_03",
                "Thermal Denaturation Entropy (ΔS)",
                "AVANCADO",
                "Advanced",
                "If Lysozyme protein denaturation occurs reversibly at Tm = 65.0 °C (338.15 K) with enthalpy ΔH = 432.8 kJ/mol, calculate the conformational entropy change ΔS in kJ/(mol·K).",
                "NUMERICO",
                Collections.emptyList(),
                1.28,
                0.05,
                -1,
                "At thermal equilibrium of the transition (Tm), ΔG = 0 => ΔH - Tm·ΔS = 0 => ΔS = ΔH / Tm = 432.8 / 338.15 ≈ 1.28 kJ/(mol·K).",
                "At phase equilibrium (transition temperature Tm): ΔG = 0, so ΔS = ΔH / Tm. Convert Tm to Kelvin!",
                "Calculate: Tm = 65.0 + 273.15 = 338.15 K. Then divide: 432.8 / 338.15 = 1.28 kJ/(mol·K).",
                90,
                90
        ));
    }

    private List<ExercicioDTO> escolherCatalogo(String lang) {
        if ("pt".equalsIgnoreCase(lang) || "pt-BR".equalsIgnoreCase(lang)) {
            return catalogoPt;
        }
        return catalogoEn;
    }

    @GetMapping
    public List<Map<String, Object>> listarExercicios(@RequestParam(defaultValue = "en") String lang) {
        List<ExercicioDTO> fonte = escolherCatalogo(lang);
        List<Map<String, Object>> lista = new ArrayList<>();
        for (ExercicioDTO ex : fonte) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", ex.getId());
            map.put("titulo", ex.getTitulo());
            map.put("modulo", ex.getModulo());
            map.put("nivel", ex.getNivel());
            map.put("enunciado", ex.getEnunciado());
            map.put("tipo", ex.getTipo());
            map.put("opcoes", ex.getOpcoes());
            map.put("recompensaXp", ex.getRecompensaXp());
            map.put("recompensaPontos", ex.getRecompensaPontos());
            lista.add(map);
        }
        return lista;
    }

    @PostMapping("/validar")
    public Map<String, Object> validarResposta(
            @RequestBody Map<String, Object> payload,
            @RequestParam(defaultValue = "en") String lang) {
        String id = (String) payload.get("id");
        Object respostaObj = payload.get("resposta");
        String idioma = payload.get("lang") != null ? payload.get("lang").toString() : lang;
        boolean isPt = "pt".equalsIgnoreCase(idioma) || "pt-BR".equalsIgnoreCase(idioma);

        List<ExercicioDTO> fonte = escolherCatalogo(idioma);
        Map<String, Object> resultado = new HashMap<>();

        ExercicioDTO ex = fonte.stream()
                .filter(e -> e.getId().equals(id))
                .findFirst()
                .orElse(null);

        if (ex == null) {
            resultado.put("correto", false);
            resultado.put("mensagem", isPt ? "Exercício não encontrado." : "Exercise not found.");
            return resultado;
        }

        boolean correto = false;

        // Se for numerico, calcula o erro relativo pra aceitar pequenos arredondamentos do aluno
        if ("NUMERICO".equals(ex.getTipo())) {
            try {
                double valorEnviado = Double.parseDouble(respostaObj.toString());
                double esperado = ex.getRespostaCorretaNumerica();
                double erroRelativo = Math.abs((valorEnviado - esperado) / esperado);
                correto = erroRelativo <= ex.getToleranciaPercentual();
            } catch (Exception e) {
                correto = false;
            }
        } else if ("MULTIPLA_ESCOLHA".equals(ex.getTipo())) {
            try {
                int opcaoEscolhida = Integer.parseInt(respostaObj.toString());
                correto = (opcaoEscolhida == ex.getRespostaCorretaOpcaoIndex());
            } catch (Exception e) {
                correto = false;
            }
        }

        resultado.put("correto", correto);
        resultado.put("explicacao", ex.getExplicacao());
        resultado.put("xpGanho", correto ? ex.getRecompensaXp() : 0);
        resultado.put("pontosGanhos", correto ? ex.getRecompensaPontos() : 0);
        if (isPt) {
            resultado.put("mensagem", correto ? "Parabéns! Resposta correta!" : "Resposta incorreta. Leia a explicação e tente novamente.");
        } else {
            resultado.put("mensagem", correto ? "Congratulations! Correct answer!" : "Incorrect answer. Read the explanation below and try again.");
        }

        return resultado;
    }

    @GetMapping("/{id}/dica")
    public Map<String, Object> obterDica(
            @PathVariable String id,
            @RequestParam String tipo,
            @RequestParam(defaultValue = "en") String lang) {
        boolean isPt = "pt".equalsIgnoreCase(lang) || "pt-BR".equalsIgnoreCase(lang);
        List<ExercicioDTO> fonte = escolherCatalogo(lang);
        Map<String, Object> resposta = new HashMap<>();

        ExercicioDTO ex = fonte.stream()
                .filter(e -> e.getId().equals(id))
                .findFirst()
                .orElse(null);

        if (ex == null) {
            resposta.put("erro", isPt ? "Exercício não encontrado." : "Exercise not found.");
            return resposta;
        }

        if ("formula".equalsIgnoreCase(tipo)) {
            resposta.put("dica", ex.getDicaFormula());
            resposta.put("tipo", isPt ? "FÓRMULA TEÓRICA" : "THEORETICAL FORMULA");
        } else if ("resolucao".equalsIgnoreCase(tipo)) {
            resposta.put("dica", ex.getDicaResolucao());
            resposta.put("tipo", isPt ? "PASSO-A-PASSO" : "STEP-BY-STEP");
        } else {
            resposta.put("dica", isPt ? "Tipo de dica inválido." : "Invalid hint type.");
        }

        return resposta;
    }
}
