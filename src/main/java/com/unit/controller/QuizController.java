package com.unit.controller;

import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Controlador REST para a Central de Exercícios, Quizzes e Desafios Gamificados.
 */
@RestController
@RequestMapping("/api/exercicios")
@CrossOrigin(origins = "*")
public class QuizController {

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

        // Getters
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

    private final List<ExercicioDTO> catalogo = new ArrayList<>();

    public QuizController() {
        // 1. Cinética - Meia Vida 1ª Ordem
        catalogo.add(new ExercicioDTO(
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

        // 2. Cinética - Consumo Ordem Zero
        catalogo.add(new ExercicioDTO(
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

        // 3. Cinética - Tempo de Vida Químico (e-folding time tau) - Extraído do Paper J. Chem. Educ.
        catalogo.add(new ExercicioDTO(
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

        // 4. Maxwell - Velocidade Mais Provável do Argônio
        catalogo.add(new ExercicioDTO(
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

        // 5. Maxwell - Relação de Massas Molares
        catalogo.add(new ExercicioDTO(
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

        // 6. Maxwell - Velocidade do Som (Lab 4 Módulo 5 do Paper ACS)
        catalogo.add(new ExercicioDTO(
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

        // 7. DSC - Temperatura de Desnaturação da Lisozima
        catalogo.add(new ExercicioDTO(
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

        // 8. DSC - Significado Físico da Área sob a Curva
        catalogo.add(new ExercicioDTO(
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

        // 9. Avançado - Integração Numérica com Splines
        catalogo.add(new ExercicioDTO(
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

    @GetMapping
    public List<Map<String, Object>> listarExercicios() {
        List<Map<String, Object>> lista = new ArrayList<>();
        for (ExercicioDTO ex : catalogo) {
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
    public Map<String, Object> validarResposta(@RequestBody Map<String, Object> payload) {
        String id = (String) payload.get("id");
        Object respostaObj = payload.get("resposta");

        Map<String, Object> resultado = new HashMap<>();

        ExercicioDTO ex = catalogo.stream()
                .filter(e -> e.getId().equals(id))
                .findFirst()
                .orElse(null);

        if (ex == null) {
            resultado.put("correto", false);
            resultado.put("mensagem", "Exercício não encontrado.");
            return resultado;
        }

        boolean correto = false;

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
        resultado.put("mensagem", correto ? "Parabéns! Resposta correta!" : "Resposta incorreta. Leia a explicação e tente novamente.");

        return resultado;
    }

    @GetMapping("/{id}/dica")
    public Map<String, Object> obterDica(@PathVariable String id, @RequestParam String tipo) {
        Map<String, Object> resposta = new HashMap<>();
        ExercicioDTO ex = catalogo.stream()
                .filter(e -> e.getId().equals(id))
                .findFirst()
                .orElse(null);

        if (ex == null) {
            resposta.put("erro", "Exercício não encontrado.");
            return resposta;
        }

        if ("formula".equalsIgnoreCase(tipo)) {
            resposta.put("dica", ex.getDicaFormula());
            resposta.put("tipo", "FÓRMULA TEÓRICA");
        } else if ("resolucao".equalsIgnoreCase(tipo)) {
            resposta.put("dica", ex.getDicaResolucao());
            resposta.put("tipo", "PASSO-A-PASSO");
        } else {
            resposta.put("dica", "Tipo de dica inválido.");
        }

        return resposta;
    }
}
