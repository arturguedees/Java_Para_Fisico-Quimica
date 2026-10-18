package com.unit.controller;

import com.unit.modelo.ReacaoPrimeiraOrdem;
import com.unit.modelo.ReacaoOrdemZero;
import com.unit.modelo.ModeloCinetico;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller da parte de Cinetica Quimica (Ordem 0 e Ordem 1).
 * Aqui eu aproveito o polimorfismo da interface ModeloCinetico pra calcular os 100 pontos da curva!
 */
@RestController
@RequestMapping("/api/cinetica")
@CrossOrigin(origins = "*")
public class CineticaController {

    @GetMapping("/calcular")
    public Map<String, Object> calcularCinetica(
            @RequestParam double concentracaoInicial,
            @RequestParam double constanteVelocidade,
            @RequestParam int ordem, // pode ser 0 (Ordem Zero) ou 1 (Primeira Ordem)
            @RequestParam double tempoMaximo) {

        // Coloquei esses Math.max pra garantir que ninguem mande zero ou numero negativo na URL e quebre a divisao
        double a0 = Math.max(0.01, concentracaoInicial);
        double k = Math.max(0.0001, constanteVelocidade);
        double tMax = Math.max(1.0, tempoMaximo);

        // Escolhe qual classe instanciar dependendo da ordem que o usuario clicou na tela
        ModeloCinetico modelo;
        if (ordem == 0) {
            modelo = new ReacaoOrdemZero(a0, k);
        } else {
            modelo = new ReacaoPrimeiraOrdem(a0, k);
        }

        List<Double> tempos = new ArrayList<>();
        List<Double> concentracaoA = new ArrayList<>();
        List<Double> concentracaoB = new ArrayList<>();

        // Gero 101 pontos (de 0 ate 100) pro grafico do Chart.js no React ficar bem lisinho
        int numPontos = 100;
        double passo = tMax / numPontos;

        for (int i = 0; i <= numPontos; i++) {
            double t = i * passo;
            tempos.add(t);
            concentracaoA.add(modelo.concentracaoA(t));
            concentracaoB.add(modelo.concentracaoB(t));
        }

        Map<String, Object> resposta = new HashMap<>();
        resposta.put("tempo", tempos);
        resposta.put("concentracaoA", concentracaoA);
        resposta.put("concentracaoB", concentracaoB);
        resposta.put("meiaVida", modelo.primeiraMeiaVida());
        resposta.put("ordem", modelo.obterOrdem());
        resposta.put("unidadeK", modelo.obterOrdem() == 0 ? "mol/(L·s)" : "s⁻¹");

        // Usando pattern matching do instanceof do Java 21 (achei muito massa esse recurso!)
        if (modelo instanceof ReacaoPrimeiraOrdem r1) {
            resposta.put("tempoVida", r1.tempoVidaQuimico());
        } else if (modelo instanceof ReacaoOrdemZero r0) {
            resposta.put("segundaMeiaVida", r0.segundaMeiaVida());
            resposta.put("terceiraMeiaVida", r0.terceiraMeiaVida());
            resposta.put("tempoConsumoTotal", r0.tempoConsumoTotal());
        }

        return resposta;
    }
}
