package com.unit.ui;

import java.awt.Color;
import java.util.ArrayList;
import java.util.List;

import javax.swing.JFrame;

import org.knowm.xchart.SwingWrapper;
import org.knowm.xchart.XYChart;
import org.knowm.xchart.XYChartBuilder;
import org.knowm.xchart.XYSeries;
import org.knowm.xchart.style.Styler;

import com.unit.model.FirstOrderReaction;
import com.unit.model.ReactionConcentrationPoint;
import com.unit.numerical.FirstOrderReactionDataGenerator;

/**
 * Creates and displays an XChart visualization of a first-order reaction.
 */
public final class FirstOrderReactionChart {
    private FirstOrderReactionChart() {
    }

    /**
     * Creates a line chart for the concentrations of A and B over time.
     *
     * @param reaction reaction model to visualize
     * @param startTime first sample time
     * @param endTime maximum sample time
     * @param timeStep interval between samples
     * @return configured XChart chart
     */
    public static XYChart createChart(
            FirstOrderReaction reaction,
            double startTime,
            double endTime,
            double timeStep) {
        List<ReactionConcentrationPoint> points =
                FirstOrderReactionDataGenerator.generate(reaction, startTime, endTime, timeStep);

        List<Double> times = new ArrayList<>(points.size());
        List<Double> concentrationsA = new ArrayList<>(points.size());
        List<Double> concentrationsB = new ArrayList<>(points.size());

        for (ReactionConcentrationPoint point : points) {
            times.add(point.time());
            concentrationsA.add(point.concentrationA());
            concentrationsB.add(point.concentrationB());
        }

        XYChart chart = new XYChartBuilder()
                .width(800)
                .height(600)
                .title("First-Order Reaction: A → B")
                .xAxisTitle("Time")
                .yAxisTitle("Concentration")
                .build();

        chart.getStyler().setLegendPosition(Styler.LegendPosition.InsideNE);
        chart.getStyler().setSeriesColors(new Color[] {
                new Color(36, 105, 180),
                new Color(220, 82, 72)
        });

        chart.addSeries("[A]", times, concentrationsA)
                .setXYSeriesRenderStyle(XYSeries.XYSeriesRenderStyle.Line);
        chart.addSeries("[B]", times, concentrationsB)
                .setXYSeriesRenderStyle(XYSeries.XYSeriesRenderStyle.Line);

        return chart;
    }

    /**
     * Opens the chart in an XChart Swing window.
     *
     * @param reaction reaction model to visualize
     * @param startTime first sample time
     * @param endTime maximum sample time
     * @param timeStep interval between samples
     * @return the Swing window displaying the chart
     */
    public static JFrame displayChart(
            FirstOrderReaction reaction,
            double startTime,
            double endTime,
            double timeStep) {
        return new SwingWrapper<>(createChart(reaction, startTime, endTime, timeStep))
                .displayChart();
    }
}
