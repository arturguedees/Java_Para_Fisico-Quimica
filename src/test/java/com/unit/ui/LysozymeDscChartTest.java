package com.unit.ui;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.knowm.xchart.XYChart;
import org.knowm.xchart.XYSeries;

import com.unit.model.HenEggWhiteLysozymeDscData;

class LysozymeDscChartTest {
    @Test
    void chartContainsMeasuredSamplesAndSmoothSplineSeries() {
        XYChart chart = LysozymeDscChart.createChart(HenEggWhiteLysozymeDscData.dataset());

        assertEquals("DSC: Hen Egg-White Lysozyme", chart.getTitle());
        assertEquals("Temperature (°C)", chart.getXAxisTitle());
        assertTrue(chart.getYAxisTitle().contains("Excess Heat Capacity"));
        assertTrue(chart.getSeriesMap().containsKey("Experimental samples"));
        assertTrue(chart.getSeriesMap().containsKey("Cubic spline (Commons Math)"));

        XYSeries samples = chart.getSeriesMap().get("Experimental samples");
        XYSeries spline = chart.getSeriesMap().get("Cubic spline (Commons Math)");
        assertEquals(23, samples.getXData().length);
        assertEquals(23, samples.getYData().length);
        assertEquals(300, spline.getXData().length);
        assertEquals(300, spline.getYData().length);
    }
}
