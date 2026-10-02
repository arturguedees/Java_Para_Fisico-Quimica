package com.unit.numerical;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;

import org.apache.commons.math3.analysis.polynomials.PolynomialSplineFunction;
import org.apache.commons.math3.exception.OutOfRangeException;
import org.junit.jupiter.api.Test;

import com.unit.model.DscDataset;
import com.unit.model.DscPoint;
import com.unit.model.HenEggWhiteLysozymeDscData;

class DscNumericalAnalysisTest {
    private static final double TOLERANCE = 1.0e-10;

    @Test
    void trapezoidalRuleIntegratesLinearSamplesOnNonUniformGrid() {
        DscDataset dataset = new DscDataset(List.of(
                new DscPoint(0.0, 1.0),
                new DscPoint(1.0, 3.0),
                new DscPoint(3.0, 7.0)));

        assertEquals(12.0, DscNumericalAnalysis.integrateTrapezoidal(dataset), TOLERANCE);
    }

    @Test
    void simpsonRuleIntegratesQuadraticSamplesOnNonUniformGrid() {
        DscDataset dataset = new DscDataset(List.of(
                new DscPoint(0.0, 0.0),
                new DscPoint(1.0, 1.0),
                new DscPoint(3.0, 9.0)));

        assertEquals(9.0, DscNumericalAnalysis.integrateSimpson(dataset), TOLERANCE);
    }

    @Test
    void simpsonRuleRequiresAnEvenNumberOfIntervals() {
        DscDataset dataset = new DscDataset(List.of(
                new DscPoint(0.0, 0.0),
                new DscPoint(1.0, 1.0),
                new DscPoint(2.0, 4.0),
                new DscPoint(3.0, 9.0)));

        assertThrows(IllegalArgumentException.class,
                () -> DscNumericalAnalysis.integrateSimpson(dataset));
    }

    @Test
    void cubicSplinePassesThroughEveryMeasuredSample() {
        DscDataset dataset = HenEggWhiteLysozymeDscData.dataset();
        PolynomialSplineFunction spline = DscNumericalAnalysis.interpolate(dataset);

        for (DscPoint point : dataset.points()) {
            assertEquals(point.excessHeatCapacity(), spline.value(point.temperatureCelsius()), TOLERANCE);
        }
    }

    @Test
    void cubicSplineRejectsEvaluationOutsideItsDomain() {
        PolynomialSplineFunction spline = DscNumericalAnalysis.interpolate(
                new DscDataset(List.of(
                        new DscPoint(0.0, 1.0),
                        new DscPoint(1.0, 3.0),
                        new DscPoint(2.0, 5.0))));

        assertThrows(OutOfRangeException.class, () -> spline.value(-0.01));
        assertThrows(OutOfRangeException.class, () -> spline.value(2.01));
    }

    @Test
    void simpsonAndRombergIntegrateLinearSplineOverItsDomain() {
        DscDataset dataset = new DscDataset(List.of(
                new DscPoint(0.0, 1.0),
                new DscPoint(1.0, 3.0),
                new DscPoint(2.0, 5.0)));

        assertEquals(6.0, DscNumericalAnalysis.integrateInterpolatedWithSimpson(dataset), TOLERANCE);
        assertEquals(6.0, DscNumericalAnalysis.integrateInterpolatedWithRomberg(dataset), TOLERANCE);
    }

    @Test
    void notebookDataProducesFiniteRawAndInterpolatedAreas() {
        DscDataset dataset = HenEggWhiteLysozymeDscData.dataset();

        assertEquals(30.0, dataset.firstPoint().temperatureCelsius(), TOLERANCE);
        assertEquals(80.0, dataset.lastPoint().temperatureCelsius(), TOLERANCE);
        assertEquals(23, dataset.points().size());
        assertEquals(1898.5, DscNumericalAnalysis.integrateTrapezoidal(dataset), TOLERANCE);
        assertEquals(1886.6111111111113, DscNumericalAnalysis.integrateSimpson(dataset), TOLERANCE);
        assertEquals(1886.6111111111113,
            DscNumericalAnalysis.estimateUnfoldingEnthalpyWithSimpson(dataset), TOLERANCE);
        assertEquals(1889.0928811651117,
                DscNumericalAnalysis.integrateInterpolatedWithSimpson(dataset), 1.0e-6);
        assertEquals(1889.0929460983555,
                DscNumericalAnalysis.integrateInterpolatedWithRomberg(dataset), 1.0e-6);
    }
}
