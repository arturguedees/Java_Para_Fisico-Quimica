package com.unit.numerico;

import java.util.List;

import org.apache.commons.math3.analysis.interpolation.SplineInterpolator;
import org.apache.commons.math3.analysis.polynomials.PolynomialSplineFunction;

import com.unit.modelo.ConjuntoDadosDsc;
import com.unit.modelo.PontoDsc;

public final class AnaliseNumericaDsc {
    private AnaliseNumericaDsc() {}

    /**
     * Integração direta dos dados discretos pela regra do trapézio (suporta espaçamento não-uniforme).
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
     * Como os dados experimentais de DSC podem ter espaçamento variável (não-uniforme),
     * a forma cientificamente precisa de aplicar Simpson 1/3 é interpolar a curva por Spline Cúbico
     * e integrar a função com malha uniforme de alta resolução.
     */
    public static double integrarPorSimpson(ConjuntoDadosDsc dataset) {
        PolynomialSplineFunction spline = interpolarSplineCubico(dataset);
        List<PontoDsc> pontos = dataset.getPontos();
        double minX = pontos.get(0).temperaturaCelsius();
        double maxX = pontos.get(pontos.size() - 1).temperaturaCelsius();
        return ServicoIntegracaoNumerica.integrarFuncaoSimpson(spline::value, minX, maxX, 1000);
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
