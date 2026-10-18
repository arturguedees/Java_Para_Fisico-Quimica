package com.unit.numerico;

import java.util.List;

import org.apache.commons.math3.analysis.interpolation.SplineInterpolator;
import org.apache.commons.math3.analysis.polynomials.PolynomialSplineFunction;

import com.unit.modelo.ConjuntoDadosDsc;
import com.unit.modelo.PontoDsc;

/**
 * Classe que faz os calculos de integracao da curva de DSC da proteina Lisozima.
 */
public final class AnaliseNumericaDsc {
    private AnaliseNumericaDsc() {}

    /**
     * Integra os pontos experimentais direto pela Regra do Trapezio.
     */
    public static double integrarPorTrapezio(ConjuntoDadosDsc dataset) {
        List<PontoDsc> pontos = dataset.getPontos();
        double[] x = new double[pontos.size()];
        double[] y = new double[pontos.size()];
        for (int i = 0; i < pontos.size(); i++) {
            x[i] = pontos.get(i).temperaturaCelsius();
            y[i] = pontos.get(i).capacidadeCalorificaExcesso();
        }
        return ServicoIntegracaoNumerica.integrarTrapezio(x, y);
    }

    /**
     * Detalhe importante: como os 23 pontos experimentais da Lisozima tem passos diferentes
     * (2.5 graus nas pontas e 1.0 grau perto do pico), nao podemos jogar Simpson 1/3 direto nos pontos brutos!
     * Primeiro eu crio um Spline Cubico pra ter uma curva continua e depois integro com 1000 passos iguais.
     */
    public static double integrarPorSimpson(ConjuntoDadosDsc dataset) {
        PolynomialSplineFunction spline = interpolarSplineCubico(dataset);
        List<PontoDsc> pontos = dataset.getPontos();
        double minX = pontos.get(0).temperaturaCelsius();
        double maxX = pontos.get(pontos.size() - 1).temperaturaCelsius();
        return ServicoIntegracaoNumerica.integrarFuncaoSimpson(spline::value, minX, maxX, 1000);
    }

    // Usa o SplineInterpolator da biblioteca Apache Commons Math3 pra ligar os pontos suavemente
    public static PolynomialSplineFunction interpolarSplineCubico(ConjuntoDadosDsc dataset) {
        List<PontoDsc> pontos = dataset.getPontos();
        double[] x = new double[pontos.size()];
        double[] y = new double[pontos.size()];
        for (int i = 0; i < pontos.size(); i++) {
            x[i] = pontos.get(i).temperaturaCelsius();
            y[i] = pontos.get(i).capacidadeCalorificaExcesso();
        }
        return new SplineInterpolator().interpolate(x, y);
    }
}
