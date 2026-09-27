package com.unit.ui;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.knowm.xchart.XYChart;
import org.knowm.xchart.XYSeries;

import com.unit.model.FirstOrderReaction;

class FirstOrderReactionChartTest {
    private static final double TOLERANCE = 1.0e-12;

    @Test
    void createsLabeledChartWithBothReactionSeries() {
        XYChart chart = FirstOrderReactionChart.createChart(
                new FirstOrderReaction(1.0, 0.08), 0.0, 2.0, 1.0);

        assertEquals("First-Order Reaction: A → B", chart.getTitle());
        assertEquals("Time", chart.getXAxisTitle());
        assertEquals("Concentration", chart.getYAxisTitle());
        assertEquals(2, chart.getSeriesMap().size());
        assertTrue(chart.getSeriesMap().containsKey("[A]"));
        assertTrue(chart.getSeriesMap().containsKey("[B]"));
    }

    @Test
    void seriesUseTimesAndConcentrationsFromTheGeneratedPoints() {
        XYChart chart = FirstOrderReactionChart.createChart(
                new FirstOrderReaction(1.0, 0.08), 0.0, 2.0, 1.0);
        Map<String, XYSeries> series = chart.getSeriesMap();

        assertArrayEquals(new double[] {0.0, 1.0, 2.0}, series.get("[A]").getXData(), TOLERANCE);
        assertArrayEquals(new double[] {1.0, Math.exp(-0.08), Math.exp(-0.16)},
                series.get("[A]").getYData(), TOLERANCE);
        assertArrayEquals(new double[] {0.0, 1.0, 2.0}, series.get("[B]").getXData(), TOLERANCE);
        assertArrayEquals(new double[] {0.0, 1.0 - Math.exp(-0.08), 1.0 - Math.exp(-0.16)},
                series.get("[B]").getYData(), TOLERANCE);
    }

        @Test
        void notebookExampleChartPreservesKineticBehaviorAndConcentration() {
                XYChart chart = FirstOrderReactionChart.createChart(
                                new FirstOrderReaction(1.0, 0.08), 0.0, 99.0, 1.0);
                XYSeries seriesA = chart.getSeriesMap().get("[A]");
                XYSeries seriesB = chart.getSeriesMap().get("[B]");
                double[] times = seriesA.getXData();
                double[] concentrationsA = seriesA.getYData();
                double[] concentrationsB = seriesB.getYData();

                assertEquals(100, times.length);
                assertEquals(0.0, times[0], TOLERANCE);
                assertEquals(99.0, times[times.length - 1], TOLERANCE);
                assertEquals(1.0, concentrationsA[0], TOLERANCE);
                assertEquals(0.0, concentrationsB[0], TOLERANCE);

                for (int index = 0; index < times.length; index++) {
                        assertEquals(1.0, concentrationsA[index] + concentrationsB[index], TOLERANCE);
                        if (index > 0) {
                                assertTrue(concentrationsA[index] < concentrationsA[index - 1]);
                                assertTrue(concentrationsB[index] > concentrationsB[index - 1]);
                        }
                }
        }
}
