package com.unit.ui;

import java.awt.Color;
import java.util.List;

import org.apache.commons.math3.analysis.polynomials.PolynomialSplineFunction;
import org.knowm.xchart.XYChart;
import org.knowm.xchart.XYChartBuilder;
import org.knowm.xchart.XYSeries;
import org.knowm.xchart.style.Styler;

import com.unit.modelo.ConjuntoDadosDsc;
import com.unit.modelo.PontoDsc;
import com.unit.numerico.AnaliseNumericaDsc;

public final class GraficoDsc {
    private GraficoDsc() {}

    public static XYChart criarGraficoDsc(ConjuntoDadosDsc dataset) {
        XYChart chart = new XYChartBuilder()
                .width(850)
                .height(600)
                .title("Calorimetria Diferencial de Varredura (DSC) — " + dataset.getNomeAmostra())
                .xAxisTitle("Temperatura (°C)")
                .yAxisTitle("Capacidade Calorífica em Excesso, Cp (kJ/(mol·K))")
                .build();

        chart.getStyler().setLegendPosition(Styler.LegendPosition.InsideNW);
        chart.getStyler().setSeriesColors(new Color[] {Color.BLACK, Color.RED});

        List<PontoDsc> pontos = dataset.getPontos();
        double[] xExp = new double[pontos.size()];
        double[] yExp = new double[pontos.size()];
        for (int i = 0; i < pontos.size(); i++) {
            xExp[i] = pontos.get(i).temperaturaCelsius();
            yExp[i] = pontos.get(i).capacidadeCalorificaExcesso();
        }

        PolynomialSplineFunction spline = AnaliseNumericaDsc.interpolarSplineCubico(dataset);
        int nAmostras = 200;
        double tMin = dataset.primeiroPonto().temperaturaCelsius();
        double tMax = dataset.ultimoPonto().temperaturaCelsius();
        double passo = (tMax - tMin) / nAmostras;

        double[] xSpline = new double[nAmostras + 1];
        double[] ySpline = new double[nAmostras + 1];
        for (int i = 0; i <= nAmostras; i++) {
            xSpline[i] = tMin + i * passo;
            ySpline[i] = spline.value(xSpline[i]);
        }

        chart.addSeries("Pontos Experimentais", xExp, yExp)
                .setXYSeriesRenderStyle(XYSeries.XYSeriesRenderStyle.Scatter);
        chart.addSeries("Ajuste Spline Cúbico", xSpline, ySpline)
                .setXYSeriesRenderStyle(XYSeries.XYSeriesRenderStyle.Line);

        return chart;
    }
}
