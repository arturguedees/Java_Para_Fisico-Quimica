package com.unit.ui;

import java.awt.Color;
import java.util.ArrayList;
import java.util.List;

import javax.swing.JFrame;

import org.apache.commons.math3.analysis.polynomials.PolynomialSplineFunction;
import org.knowm.xchart.SwingWrapper;
import org.knowm.xchart.XYChart;
import org.knowm.xchart.XYChartBuilder;
import org.knowm.xchart.XYSeries;
import org.knowm.xchart.style.Styler;

import com.unit.model.DscDataset;
import com.unit.model.DscPoint;
import com.unit.model.HenEggWhiteLysozymeDscData;
import com.unit.numerical.DscNumericalAnalysis;

/**
 * XChart view of the notebook's hen egg-white lysozyme DSC samples and spline.
 */
public final class LysozymeDscChart {
    private static final int SPLINE_PLOT_POINTS = 300;

    private LysozymeDscChart() {
    }

    /**
     * Creates a chart showing the experimental DSC samples and cubic spline.
     * The notebook's spline is a visual fit; this chart likewise does not
     * baseline-correct or integrate the curve for display.
     *
     * @param dataset DSC experimental samples
     * @return configured XChart chart
     */
    public static XYChart createChart(DscDataset dataset) {
        PolynomialSplineFunction spline = DscNumericalAnalysis.interpolate(dataset);
        double minimumTemperature = dataset.firstPoint().temperatureCelsius();
        double maximumTemperature = dataset.lastPoint().temperatureCelsius();

        List<Double> splineTemperatures = new ArrayList<>(SPLINE_PLOT_POINTS);
        List<Double> splineValues = new ArrayList<>(SPLINE_PLOT_POINTS);
        for (int index = 0; index < SPLINE_PLOT_POINTS; index++) {
            double fraction = index / (double) (SPLINE_PLOT_POINTS - 1);
            double temperature = minimumTemperature + fraction * (maximumTemperature - minimumTemperature);
            splineTemperatures.add(temperature);
            splineValues.add(spline.value(temperature));
        }

        List<Double> measuredTemperatures = new ArrayList<>(dataset.points().size());
        List<Double> measuredValues = new ArrayList<>(dataset.points().size());
        for (DscPoint point : dataset.points()) {
            measuredTemperatures.add(point.temperatureCelsius());
            measuredValues.add(point.excessHeatCapacity());
        }

        XYChart chart = new XYChartBuilder()
                .width(800)
                .height(600)
                .title("DSC: Hen Egg-White Lysozyme")
                .xAxisTitle("Temperature (°C)")
                .yAxisTitle("Excess Heat Capacity (kJ K⁻¹ mol⁻¹; notebook label)")
                .build();

        chart.getStyler().setLegendPosition(Styler.LegendPosition.InsideNE);
        chart.getStyler().setSeriesColors(new Color[] {
                new Color(40, 145, 90),
                new Color(40, 90, 170)
        });
        chart.addSeries("Cubic spline (Commons Math)", splineTemperatures, splineValues)
                .setXYSeriesRenderStyle(XYSeries.XYSeriesRenderStyle.Line);
        chart.addSeries("Experimental samples", measuredTemperatures, measuredValues)
                .setXYSeriesRenderStyle(XYSeries.XYSeriesRenderStyle.Scatter);

        return chart;
    }

    /**
     * Opens a window with the notebook's lysozyme DSC example.
     *
     * @return the Swing window displaying the chart
     */
    public static JFrame displayNotebookExample() {
        return new SwingWrapper<>(createChart(HenEggWhiteLysozymeDscData.dataset()))
                .displayChart();
    }
}
