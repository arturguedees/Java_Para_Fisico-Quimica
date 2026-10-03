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
import com.unit.modelo.PontoEnergiaCinetica;
import com.unit.numerico.GeradorDadosMaxwell;

public final class GraficoEnergiaCinetica {
    private GraficoEnergiaCinetica() {}

    public static XYChart criarGraficoEnergia(ClasseGas gas, double temperaturaKelvin, double eaJPorMol) {
        XYChart chart = new XYChartBuilder()
                .width(850)
                .height(600)
                .title(String.format(Locale.US, "Distribuição de Energia Cinética e Energia de Ativação — T = %.0f K", temperaturaKelvin))
                .xAxisTitle("Energia Cinética Translacional, E (J/mol)")
                .yAxisTitle("Fração / mol, f(E) ((J/mol)⁻¹)")
                .build();

        chart.getStyler().setLegendPosition(Styler.LegendPosition.InsideNE);
        chart.getStyler().setSeriesColors(new Color[] {new Color(30, 144, 255), new Color(220, 20, 60)});
        chart.getStyler().setYAxisMin(0.0);

        DistribuicaoMaxwellBoltzmann dist = new DistribuicaoMaxwellBoltzmann(gas, temperaturaKelvin);
        List<PontoEnergiaCinetica> pontos = GeradorDadosMaxwell.gerarPontosEnergia(dist, 0.0, 45_000.0, 50.0);

        double[] e = new double[pontos.size()];
        double[] fe = new double[pontos.size()];
        for (int i = 0; i < pontos.size(); i++) {
            e[i] = pontos.get(i).energiaJPorMol();
            fe[i] = pontos.get(i).densidadeProbabilidade();
        }

        chart.addSeries("Distribuição f(E) (" + gas.getNome() + ")", e, fe)
                .setXYSeriesRenderStyle(XYSeries.XYSeriesRenderStyle.Line);

        return chart;
    }
}
