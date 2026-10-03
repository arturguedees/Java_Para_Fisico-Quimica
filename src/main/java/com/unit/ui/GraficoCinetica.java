package com.unit.ui;

import java.awt.Color;
import java.util.List;

import org.knowm.xchart.XYChart;
import org.knowm.xchart.XYChartBuilder;
import org.knowm.xchart.XYSeries;
import org.knowm.xchart.style.Styler;

import com.unit.modelo.ModeloCinetico;
import com.unit.modelo.PontoConcentracao;
import com.unit.modelo.ReacaoOrdemZero;
import com.unit.modelo.ReacaoPrimeiraOrdem;
import com.unit.numerico.GeradorDadosCinetica;

public final class GraficoCinetica {
    private GraficoCinetica() {}

    public static XYChart criarGrafico(ModeloCinetico modelo, double tempoFinal, double passo) {
        String tituloOrdem = (modelo.obterOrdem() == 0) ? "Ordem Zero" : "Primeira Ordem";
        XYChart chart = new XYChartBuilder()
                .width(800)
                .height(550)
                .title("Cinética Química — Reação A -> B (" + tituloOrdem + ")")
                .xAxisTitle("Tempo (s)")
                .yAxisTitle("Concentração (mol/L)")
                .build();

        chart.getStyler().setLegendPosition(Styler.LegendPosition.InsideNE);
        chart.getStyler().setSeriesColors(new Color[] {Color.RED, Color.BLUE});
        chart.getStyler().setYAxisMin(0.0);

        List<PontoConcentracao> pontos = GeradorDadosCinetica.gerarPontos(modelo, tempoFinal, passo);
        double[] t = new double[pontos.size()];
        double[] a = new double[pontos.size()];
        double[] b = new double[pontos.size()];

        for (int i = 0; i < pontos.size(); i++) {
            t[i] = pontos.get(i).tempo();
            a[i] = pontos.get(i).concentracaoA();
            b[i] = pontos.get(i).concentracaoB();
        }

        chart.addSeries("[A] Reagente", t, a).setXYSeriesRenderStyle(XYSeries.XYSeriesRenderStyle.Line);
        chart.addSeries("[B] Produto", t, b).setXYSeriesRenderStyle(XYSeries.XYSeriesRenderStyle.Line);

        return chart;
    }
}
