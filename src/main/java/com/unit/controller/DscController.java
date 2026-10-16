package com.unit.controller;

import com.unit.modelo.ConjuntoDadosDsc;
import com.unit.modelo.DadosDscLisozima;
import com.unit.modelo.PontoDsc;
import com.unit.numerico.AnaliseNumericaDsc;
import org.apache.commons.math3.analysis.polynomials.PolynomialSplineFunction;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Controlador REST para o módulo de Calorimetria Exploratória Diferencial (DSC) da Lisozima.
 */
@RestController
@RequestMapping("/api/dsc")
@CrossOrigin(origins = "*")
public class DscController {

    @GetMapping("/analise")
    public Map<String, Object> obterAnaliseDsc() {
        ConjuntoDadosDsc dataset = DadosDscLisozima.obterDatasetLisozima();
        List<PontoDsc> pontosOriginais = dataset.getPontos();

        double entalpiaTrapezio = AnaliseNumericaDsc.integrarPorTrapezio(dataset);
        double entalpiaSimpson = AnaliseNumericaDsc.integrarPorSimpson(dataset);

        // Encontra o pico de desnaturação térmica (Tm)
        double maxCp = -1.0;
        double tmCelsius = 0.0;
        for (PontoDsc p : pontosOriginais) {
            if (p.capacidadeCalorificaExcesso() > maxCp) {
                maxCp = p.capacidadeCalorificaExcesso();
                tmCelsius = p.temperaturaCelsius();
            }
        }

        // Gera 120 pontos interpolados por Spline Cúbico para renderização gráfica de alta definição
        PolynomialSplineFunction spline = AnaliseNumericaDsc.interpolarSplineCubico(dataset);
        double minT = dataset.primeiroPonto().temperaturaCelsius();
        double maxT = dataset.ultimoPonto().temperaturaCelsius();
        int numPontosCurva = 120;
        double passo = (maxT - minT) / numPontosCurva;

        List<Double> temperaturasInterpoladas = new ArrayList<>();
        List<Double> cpInterpolados = new ArrayList<>();

        for (int i = 0; i <= numPontosCurva; i++) {
            double t = minT + i * passo;
            temperaturasInterpoladas.add(t);
            cpInterpolados.add(Math.max(0.0, spline.value(t)));
        }

        List<Double> tempDiscretas = new ArrayList<>();
        List<Double> cpDiscretos = new ArrayList<>();
        for (PontoDsc p : pontosOriginais) {
            tempDiscretas.add(p.temperaturaCelsius());
            cpDiscretos.add(p.capacidadeCalorificaExcesso());
        }

        Map<String, Object> resposta = new HashMap<>();
        resposta.put("amostra", dataset.getNomeAmostra());
        resposta.put("temperaturaTransicaoTm", tmCelsius);
        resposta.put("capacidadeCalorificaMaxima", maxCp);
        resposta.put("entalpiaTrapezio", entalpiaTrapezio);
        resposta.put("entalpiaSimpsonSpline", entalpiaSimpson);
        resposta.put("pontosDiscretosTemperatura", tempDiscretas);
        resposta.put("pontosDiscretosCp", cpDiscretos);
        resposta.put("curvaTemperatura", temperaturasInterpoladas);
        resposta.put("curvaCp", cpInterpolados);

        return resposta;
    }
}
