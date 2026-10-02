package com.unit.ui;

import java.awt.Color;
import java.util.List;

import org.knowm.xchart.XYChart;
import org.knowm.xchart.XYChartBuilder;
import org.knowm.xchart.XYSeries;
import org.knowm.xchart.style.Styler;

import com.unit.model.Gas;
import com.unit.model.MaxwellBoltzmannDistribution;
import com.unit.model.MaxwellBoltzmannPoint;
import com.unit.numerical.MaxwellBoltzmannDataGenerator;

/** Builds the two static/interactive XChart views from the notebook's Module 9 data. */
public final class MaxwellBoltzmannChart {
    public static final double INTERACTIVE_SPEED_START = 0.0;
    public static final double INTERACTIVE_SPEED_END_EXCLUSIVE = 1500.0;
    public static final double INTERACTIVE_SPEED_STEP = 1.0;

    public static final double ARGON_REFERENCE_SPEED_START = 0.0;
    public static final double ARGON_REFERENCE_SPEED_END_EXCLUSIVE = 2000.0;
    public static final double ARGON_REFERENCE_SPEED_STEP = 0.01;

    public static final List<Gas> NOTEBOOK_COMPARISON_GASES =
            List.of(Gas.ARGON, Gas.OXYGEN, Gas.HELIUM, Gas.HYDROGEN);
    public static final List<Double> ARGON_REFERENCE_TEMPERATURES =
            List.of(25.0, 100.0, 300.0, 1200.0);

    private MaxwellBoltzmannChart() {
    }

    /**
     * Creates the notebook's interactive comparison of four gases at one temperature.
     *
     * @param temperatureKelvin slider temperature
     * @return configured XChart chart
     */
    public static XYChart createGasComparisonChart(double temperatureKelvin) {
        XYChart chart = new XYChartBuilder()
                .width(850)
                .height(600)
                .title("Maxwell-Boltzmann speed distribution — T = "
                        + formatTemperature(temperatureKelvin) + " K")
                .xAxisTitle("Speed, v (m/s)")
                .yAxisTitle("Probability density, f(v) ((m/s)⁻¹)")
                .build();

        chart.getStyler().setLegendPosition(Styler.LegendPosition.InsideNE);
        chart.getStyler().setSeriesColors(new Color[] {
                new Color(0, 128, 0),
                new Color(65, 105, 225),
                Color.BLUE,
                Color.MAGENTA
        });
        chart.getStyler().setYAxisMin(0.0);
        chart.getStyler().setYAxisMax(0.0065);

        for (Gas gas : NOTEBOOK_COMPARISON_GASES) {
            addDistributionSeries(
                    chart,
                    gas.symbol(),
                    new MaxwellBoltzmannDistribution(gas, temperatureKelvin),
                    INTERACTIVE_SPEED_START,
                    INTERACTIVE_SPEED_END_EXCLUSIVE,
                    INTERACTIVE_SPEED_STEP);
        }
        return chart;
    }

    /**
     * Creates the notebook's introductory argon comparison at four temperatures.
     * Its original 0.01 m/s grid is retained.
     *
     * @return configured XChart chart
     */
    public static XYChart createArgonTemperatureReferenceChart() {
        XYChart chart = new XYChartBuilder()
                .width(800)
                .height(650)
                .title("Maxwell-Boltzmann speed distribution for Ar")
                .xAxisTitle("Speed, v (m/s)")
                .yAxisTitle("Probability density, f(v) ((m/s)⁻¹)")
                .build();

        chart.getStyler().setLegendPosition(Styler.LegendPosition.InsideNE);
        chart.getStyler().setSeriesColors(new Color[] {
                new Color(220, 20, 60),
                new Color(148, 0, 211),
                Color.BLUE,
                Color.CYAN
        });
        chart.getStyler().setYAxisMin(0.0);

        for (double temperature : ARGON_REFERENCE_TEMPERATURES) {
            addDistributionSeries(
                    chart,
                    formatTemperature(temperature) + " K",
                    new MaxwellBoltzmannDistribution(Gas.ARGON, temperature),
                    ARGON_REFERENCE_SPEED_START,
                    ARGON_REFERENCE_SPEED_END_EXCLUSIVE,
                    ARGON_REFERENCE_SPEED_STEP);
        }
        return chart;
    }

    private static void addDistributionSeries(
            XYChart chart,
            String name,
            MaxwellBoltzmannDistribution distribution,
            double speedStart,
            double speedEndExclusive,
            double speedStep) {
        List<MaxwellBoltzmannPoint> points = MaxwellBoltzmannDataGenerator.generate(
                distribution, speedStart, speedEndExclusive, speedStep);
        double[] speeds = new double[points.size()];
        double[] densities = new double[points.size()];
        for (int index = 0; index < points.size(); index++) {
            MaxwellBoltzmannPoint point = points.get(index);
            speeds[index] = point.speedMetersPerSecond();
            densities[index] = point.probabilityDensity();
        }
        chart.addSeries(name, speeds, densities)
                .setXYSeriesRenderStyle(XYSeries.XYSeriesRenderStyle.Line);
    }

    private static String formatTemperature(double temperatureKelvin) {
        return String.format(java.util.Locale.ROOT, "%.0f", temperatureKelvin);
    }
}
