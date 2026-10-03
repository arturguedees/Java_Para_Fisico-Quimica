package com.unit.ui;

import java.awt.Color;
import java.util.List;
import java.util.Locale;

import org.knowm.xchart.XYChart;
import org.knowm.xchart.XYChartBuilder;
import org.knowm.xchart.XYSeries;
import org.knowm.xchart.style.Styler;

import com.unit.modelo.ClasseGas;
import com.unit.modelo.DistribuicaoMaxwellBoltzmann;
import com.unit.modelo.Gas;
import com.unit.modelo.PontoMaxwellBoltzmann;
import com.unit.numerico.GeradorDadosMaxwell;

public final class GraficoMaxwellBoltzmann {
    private GraficoMaxwellBoltzmann() {}

    public static XYChart criarGraficoComparativo(List<ClasseGas> gases, double temperaturaKelvin) {
        XYChart chart = new XYChartBuilder()
                .width(850)
                .height(600)
                .title(String.format(Locale.US, "Distribuição de Maxwell-Boltzmann de Velocidades — T = %.0f K", temperaturaKelvin))
                .xAxisTitle("Velocidade, v (m/s)")
                .yAxisTitle("Densidade de Probabilidade, f(v) (s/m)")
                .build();

        chart.getStyler().setLegendPosition(Styler.LegendPosition.InsideNE);
        chart.getStyler().setSeriesColors(new Color[] {
                new Color(0, 128, 0),
                new Color(65, 105, 225),
                Color.BLUE,
                Color.MAGENTA,
                new Color(220, 20, 60)
        });
        chart.getStyler().setYAxisMin(0.0);

        for (ClasseGas gas : gases) {
            DistribuicaoMaxwellBoltzmann dist = new DistribuicaoMaxwellBoltzmann(gas, temperaturaKelvin);
            List<PontoMaxwellBoltzmann> pontos = GeradorDadosMaxwell.gerarPontosVelocidade(dist, 0.0, 1600.0, 2.0);

            double[] v = new double[pontos.size()];
            double[] f = new double[pontos.size()];
            for (int i = 0; i < pontos.size(); i++) {
                v[i] = pontos.get(i).velocidade();
                f[i] = pontos.get(i).densidadeProbabilidade();
            }

            chart.addSeries(gas.getSimbolo() + " (" + gas.getNome() + ")", v, f)
                    .setXYSeriesRenderStyle(XYSeries.XYSeriesRenderStyle.Line);
        }

        return chart;
    }
}
