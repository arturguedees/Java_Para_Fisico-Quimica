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
