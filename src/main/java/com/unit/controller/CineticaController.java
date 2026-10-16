package com.unit.controller;

import com.unit.modelo.ReacaoPrimeiraOrdem;
import com.unit.modelo.ReacaoOrdemZero;
import com.unit.modelo.ModeloCinetico;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cinetica")
@CrossOrigin(origins = "*")
public class CineticaController {

    @GetMapping("/calcular")
    public Map<String, Object> calcularCinetica(
            @RequestParam double concentracaoInicial,
            @RequestParam double constanteVelocidade,
            @RequestParam int ordem, // 0 ou 1
            @RequestParam double tempoMaximo) {

        ModeloCinetico modelo;
        if (ordem == 0) {
            modelo = new ReacaoOrdemZero(concentracaoInicial, constanteVelocidade);
        } else {
            modelo = new ReacaoPrimeiraOrdem(concentracaoInicial, constanteVelocidade);
        }

        List<Double> tempos = new ArrayList<>();
        List<Double> concentracaoA = new ArrayList<>();
        List<Double> concentracaoB = new ArrayList<>();

        // Gera 100 pontos para o gráfico do React (Chart.js)
        int numPontos = 100;
        double passo = tempoMaximo / numPontos;

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
        
        // Se for primeira ordem, também mandamos o tempo de vida (tau)
        if (modelo instanceof ReacaoPrimeiraOrdem) {
            resposta.put("tempoVida", ((ReacaoPrimeiraOrdem) modelo).tempoVidaQuimico());
        }

        return resposta;
    }
}
