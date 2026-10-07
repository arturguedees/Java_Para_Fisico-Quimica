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
        private int recompensaXp;
        private int recompensaPontos;

        public ExercicioDTO(String id, String titulo, String modulo, String nivel, String enunciado,
                            String tipo, List<String> opcoes, double respostaCorretaNumerica,
                            double toleranciaPercentual, int respostaCorretaOpcaoIndex,
                            String explicacao, int recompensaXp, int recompensaPontos) {
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
                "Para uma reação elementar de primeira ordem (A -> B) com constante k = 0.05 s⁻¹ e concentração inicial [A]₀ = 2.0 M, calcule o tempo de meia-vida t½ (em segundos). Dica: t½ = ln(2) / k.",
                "NUMERICO",
                Collections.emptyList(),
                13.86,
                0.05,
                -1,
                "Para reações de primeira ordem, o tempo de meia-vida independe da concentração inicial e vale t½ = ln(2)/k = 0.69315 / 0.05 = 13.86 segundos.",
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
                50,
                50
        ));

        // 3. Maxwell - Velocidade Mais Provável do Argônio
        catalogo.add(new ExercicioDTO(
                "max_01",
                "Velocidade Mais Provável do Argônio (300 K)",
                "MAXWELL",
                "Intermediário",
                "Calcule a velocidade mais provável (v_mp em m/s) das moléculas de gás Argônio (M = 0.03995 kg/mol) à temperatura ambiente de 300 K. Use R = 8.314 J/(mol·K) e v_mp = sqrt(2RT/M).",
                "NUMERICO",
                Collections.emptyList(),
                353.5,
                0.05,
                -1,
                "v_mp = sqrt((2 * 8.31446 * 300) / 0.03995) = sqrt(4988.68 / 0.03995) = sqrt(124873) ≈ 353.4 m/s.",
                75,
                75
        ));

        // 4. Maxwell - Relação de Massas Molares
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
                70,
                70
        ));

        // 5. DSC - Temperatura de Desnaturação da Lisozima
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
                80,
                80
        ));

        // 6. DSC - Significado Físico da Área sob a Curva
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
                85,
                85
        ));

        // 7. Avançado - Integração Numérica com Splines
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
}
