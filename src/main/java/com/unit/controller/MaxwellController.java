package com.unit.controller;

import com.unit.modelo.ClasseGas;
import com.unit.modelo.DistribuicaoMaxwellBoltzmann;
import com.unit.modelo.Gas;
import com.unit.numerico.CalculadoraMaxwell;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Controlador REST para o módulo de Distribuição de Maxwell-Boltzmann.
 */
@RestController
@RequestMapping("/api/maxwell")
@CrossOrigin(origins = "*")
public class MaxwellController {

    private final CalculadoraMaxwell calculadora = new CalculadoraMaxwell();

    @GetMapping("/gases")
    public List<Map<String, Object>> listarGases() {
        List<Map<String, Object>> lista = new ArrayList<>();
        for (Gas g : Gas.values()) {
            Map<String, Object> map = new HashMap<>();
            map.put("chave", g.name());
            map.put("nome", g.nomeFormatado());
            map.put("simbolo", g.simbolo());
            map.put("massaMolarKgPorMol", g.massaMolarKgPorMol());
            map.put("massaMolarGPorMol", g.massaMolarKgPorMol() * 1000.0);
            map.put("coeficienteAdiabatico", g.coeficienteAdiabatico());
            lista.add(map);
        }
        return lista;
    }

    @GetMapping("/calcular")
    public Map<String, Object> calcularDistribuicao(
            @RequestParam(defaultValue = "ARGONIO") String gasNome,
            @RequestParam(defaultValue = "300") double temperaturaKelvin) {

        Gas gasEnum;
        try {
            gasEnum = Gas.valueOf(gasNome.toUpperCase());
        } catch (Exception e) {
            gasEnum = Gas.ARGONIO;
        }

        ClasseGas classeGas = new ClasseGas(gasEnum);
        DistribuicaoMaxwellBoltzmann dist = new DistribuicaoMaxwellBoltzmann(classeGas, temperaturaKelvin);

        double vmp = dist.velocidadeMaisProvavel();
        double vm = dist.velocidadeMedia();
        double vrms = dist.velocidadeQuadraticaMedia();
        double som = dist.velocidadeDoSom();

        // Limite superior de velocidade para o gráfico (aproximadamente 3.5x a vrms)
        double maxVelocidade = Math.max(1000.0, vrms * 3.5);
        int numPontos = 150;
        double passoV = maxVelocidade / numPontos;

        List<Double> velocidades = new ArrayList<>();
        List<Double> densidadesVelocidade = new ArrayList<>();

        for (int i = 0; i <= numPontos; i++) {
            double v = i * passoV;
            velocidades.add(v);
            densidadesVelocidade.add(dist.densidadeProbabilidadeVelocidade(v));
        }

        // Distribuição de Energia Cinética translacional E = 1/2 M v^2
        double maxEnergia = 3.5 * 8.314462618 * temperaturaKelvin; // em J/mol
        double passoE = maxEnergia / numPontos;
        List<Double> energias = new ArrayList<>();
        List<Double> densidadesEnergia = new ArrayList<>();

        for (int i = 0; i <= numPontos; i++) {
            double e = i * passoE;
            energias.add(e);
            densidadesEnergia.add(dist.densidadeProbabilidadeEnergia(e));
        }

        Map<String, Object> resposta = new HashMap<>();
        resposta.put("gas", gasEnum.nomeFormatado());
        resposta.put("simbolo", gasEnum.simbolo());
        resposta.put("temperatura", temperaturaKelvin);
        resposta.put("massaMolarKgPorMol", classeGas.getMassaMolarKgPorMol());
        
        resposta.put("velocidades", velocidades);
        resposta.put("densidadesVelocidade", densidadesVelocidade);
        resposta.put("energias", energias);
        resposta.put("densidadesEnergia", densidadesEnergia);

        resposta.put("velocidadeMaisProvavel", vmp);
        resposta.put("velocidadeMedia", vm);
        resposta.put("velocidadeQuadraticaMedia", vrms);
        resposta.put("velocidadeDoSom", som);

        return resposta;
    }
}
