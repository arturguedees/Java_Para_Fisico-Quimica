package com.unit.ui;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Set;

import org.junit.jupiter.api.Test;
import org.knowm.xchart.XYChart;
import org.knowm.xchart.XYSeries;

import com.unit.model.Gas;
import com.unit.model.MaxwellBoltzmannDistribution;

class MaxwellBoltzmannChartTest {
    private static final double TOLERANCE = 1.0e-14;

    @Test
    void interactiveTemperatureChartMatchesNotebookAxesGasesAndSpeedSamples() {
        XYChart chart = MaxwellBoltzmannChart.createGasComparisonChart(300.0);

        assertEquals("Speed, v (m/s)", chart.getXAxisTitle());
        assertEquals("Probability density, f(v) ((m/s)⁻¹)", chart.getYAxisTitle());
        assertEquals(4, chart.getSeriesMap().size());
        assertEquals(Set.of("Ar", "O₂", "He", "H₂"), chart.getSeriesMap().keySet());

        XYSeries argon = chart.getSeriesMap().get(Gas.ARGON.symbol());
        assertEquals(1500, argon.getXData().length);
        assertEquals(0.0, argon.getXData()[0], TOLERANCE);
        assertEquals(1499.0, argon.getXData()[1499], TOLERANCE);
        assertEquals(new MaxwellBoltzmannDistribution(Gas.ARGON, 300.0)
                        .probabilityDensity(500.0),
                argon.getYData()[500], TOLERANCE);
        assertTrue(chart.getTitle().contains("300 K"));
    }

    @Test
    void argonReferencePlotUsesNotebookTemperaturesAndVelocityGrid() {
        assertEquals(java.util.List.of(25.0, 100.0, 300.0, 1200.0),
                MaxwellBoltzmannChart.ARGON_REFERENCE_TEMPERATURES);
        assertEquals(0.0, MaxwellBoltzmannChart.ARGON_REFERENCE_SPEED_START, TOLERANCE);
        assertEquals(2000.0, MaxwellBoltzmannChart.ARGON_REFERENCE_SPEED_END_EXCLUSIVE, TOLERANCE);
        assertEquals(0.01, MaxwellBoltzmannChart.ARGON_REFERENCE_SPEED_STEP, TOLERANCE);
    }

    @Test
    void interactiveTemperatureControlUsesNotebookRangeAndStep() {
        assertEquals(25.0, MaxwellBoltzmannInteractiveApp.TEMPERATURE_MIN_KELVIN, TOLERANCE);
        assertEquals(1000.0, MaxwellBoltzmannInteractiveApp.TEMPERATURE_MAX_KELVIN, TOLERANCE);
        assertEquals(100.0, MaxwellBoltzmannInteractiveApp.TEMPERATURE_STEP_KELVIN, TOLERANCE);
        assertEquals(25.0, MaxwellBoltzmannInteractiveApp.snapTemperatureToNotebookStep(25.0), TOLERANCE);
        assertEquals(125.0, MaxwellBoltzmannInteractiveApp.snapTemperatureToNotebookStep(126.0), TOLERANCE);
        assertEquals(1000.0, MaxwellBoltzmannInteractiveApp.snapTemperatureToNotebookStep(1000.0), TOLERANCE);
    }

    @Test
    void staticArgonChartContainsAllFourNotebookTemperaturesAndOriginalSpeedGrid() {
        XYChart chart = MaxwellBoltzmannChart.createArgonTemperatureReferenceChart();

        assertEquals(4, chart.getSeriesMap().size());
        assertEquals(Set.of("25 K", "100 K", "300 K", "1200 K"), chart.getSeriesMap().keySet());
        for (String seriesName : chart.getSeriesMap().keySet()) {
            XYSeries series = chart.getSeriesMap().get(seriesName);
            assertEquals(200_000, series.getXData().length);
            assertEquals(0.0, series.getXData()[0], TOLERANCE);
            assertEquals(1999.99, series.getXData()[199_999], 1.0e-9);
        }
    }
}
