package com.unit.controller;

import com.unit.modelo.ConjuntoDadosDsc;
import com.unit.modelo.DadosDscLisozima;
import com.unit.modelo.PontoDsc;
import com.unit.numerico.AnaliseNumericaDsc;
import org.apache.commons.math3.analysis.polynomials.PolynomialSplineFunction;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Controller REST da parte de Calorimetria Exploratoria Diferencial (DSC) da proteina Lisozima.
 * Aqui eu uso Spline Cubico do Apache Commons Math pra interpolar os 23 pontos experimentais
 * e comparo a integral por Trapezio vs Simpson 1/3!
 */
@RestController
@RequestMapping("/api/dsc")
@CrossOrigin(origins = "*")
public class DscController {

    @GetMapping("/analise")
    public Map<String, Object> obterAnaliseDsc(
            @RequestParam(defaultValue = "40.0") double tMin,
            @RequestParam(defaultValue = "90.0") double tMax) {
        ConjuntoDadosDsc dataset = DadosDscLisozima.obterDatasetLisozima();
        List<PontoDsc> pontosOriginais = dataset.getPontos();

        // Garante que os limites de integracao que o usuario mexeu no slider fiquem dentro de [40, 90] graus Celsius
        double minDataset = dataset.primeiroPonto().temperaturaCelsius();
        double maxDataset = dataset.ultimoPonto().temperaturaCelsius();
        double tInfBruto = Math.min(tMin, tMax);
        double tSupBruto = Math.max(tMin, tMax);
        double limiteInferior = Math.max(minDataset, Math.min(tInfBruto, maxDataset - 1.0));
        double limiteSuperior = Math.min(maxDataset, Math.max(tSupBruto, limiteInferior + 1.0));

        // Cria a funcao interpolada suave (Spline Cubico Natural) passando pelos 23 pontos
        PolynomialSplineFunction spline = AnaliseNumericaDsc.interpolarSplineCubico(dataset);

        double entalpiaTrapezio;
        double entalpiaSimpson;
        if (limiteInferior <= minDataset && limiteSuperior >= maxDataset) {
            entalpiaTrapezio = AnaliseNumericaDsc.integrarPorTrapezio(dataset);
            entalpiaSimpson = AnaliseNumericaDsc.integrarPorSimpson(dataset);
        } else {
            entalpiaTrapezio = com.unit.numerico.ServicoIntegracaoNumerica.integrarFuncaoTrapezio(
                    t -> Math.max(0.0, spline.value(Math.max(minDataset, Math.min(maxDataset, t)))),
                    limiteInferior, limiteSuperior, 500);
            entalpiaSimpson = com.unit.numerico.ServicoIntegracaoNumerica.integrarFuncaoSimpson(
                    t -> Math.max(0.0, spline.value(Math.max(minDataset, Math.min(maxDataset, t)))),
                    limiteInferior, limiteSuperior, 1000);
        }

        // Varre a lista pra achar onde fica o pico de desnaturacao termica (Tm = 65.0 C)
        double maxCp = -1.0;
        double tmCelsius = 0.0;
        for (PontoDsc p : pontosOriginais) {
            if (p.capacidadeCalorificaExcesso() > maxCp) {
                maxCp = p.capacidadeCalorificaExcesso();
                tmCelsius = p.temperaturaCelsius();
            }
        }

        // Formula da Entalpia de Van 't Hoff: deltaH_vH = 4 * R * Tm(K)^2 * Cp_max / deltaH_cal
        // Lembrei de somar 273.15 pra converter Celsius pra Kelvin antes de elevar ao quadrado!
        double tmKelvin = tmCelsius + 273.15;
        double rKj = 0.008314462618; // R em kJ/(mol*K) pra bater a unidade com o Cp
        double entalpiaVantHoff = entalpiaSimpson > 0
                ? (4.0 * rKj * tmKelvin * tmKelvin * maxCp) / entalpiaSimpson
                : 0.0;

        // Gera 120 pontinhos na curva do Spline pro grafico ficar bem redondinho na tela
        int numPontosCurva = 120;
        double passo = (maxDataset - minDataset) / numPontosCurva;

        List<Double> temperaturasInterpoladas = new ArrayList<>();
        List<Double> cpInterpolados = new ArrayList<>();

        for (int i = 0; i <= numPontosCurva; i++) {
            double t = Math.max(minDataset, Math.min(maxDataset, minDataset + i * passo));
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
        resposta.put("entalpiaVantHoff", entalpiaVantHoff);
        resposta.put("tMinIntegracao", limiteInferior);
        resposta.put("tMaxIntegracao", limiteSuperior);
        resposta.put("pontosDiscretosTemperatura", tempDiscretas);
        resposta.put("pontosDiscretosCp", cpDiscretos);
        resposta.put("curvaTemperatura", temperaturasInterpoladas);
        resposta.put("curvaCp", cpInterpolados);

        return resposta;
    }
}
