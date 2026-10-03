package com.unit.numerico;

import java.util.List;

import org.apache.commons.math3.analysis.interpolation.SplineInterpolator;
import org.apache.commons.math3.analysis.polynomials.PolynomialSplineFunction;

import com.unit.modelo.ConjuntoDadosDsc;
import com.unit.modelo.PontoDsc;

public final class AnaliseNumericaDsc {
    private AnaliseNumericaDsc() {}

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

    public static double integrarPorSimpson(ConjuntoDadosDsc dataset) {
        List<PontoDsc> pontos = dataset.getPontos();
        double[] x = new double[pontos.size()];
        double[] y = new double[pontos.size()];
        for (int i = 0; i < pontos.size(); i++) {
            x[i] = pontos.get(i).temperaturaCelsius();
            y[i] = pontos.get(i).capacidadeCalorificaExcesso();
        }
        return ServicoIntegracaoNumerica.integrarSimpson(x, y);
    }

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
