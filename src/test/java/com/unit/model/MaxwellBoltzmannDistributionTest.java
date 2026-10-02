package com.unit.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class MaxwellBoltzmannDistributionTest {
    private static final double TOLERANCE = 1.0e-14;

    @Test
    void densityIsZeroAtZeroSpeedAndMatchesNotebookScaleAtReferencePoint() {
        MaxwellBoltzmannDistribution distribution =
                new MaxwellBoltzmannDistribution(Gas.ARGON, 300.0);

        assertEquals(0.0, distribution.probabilityDensity(0.0), TOLERANCE);
        assertEquals(0.00172687485334490,
                distribution.probabilityDensity(500.0), TOLERANCE);
    }

    @Test
    void densityRemainsFiniteAndNonNegativeAcrossNotebookDomain() {
        for (Gas gas : java.util.List.of(
                Gas.ARGON, Gas.OXYGEN, Gas.HELIUM, Gas.HYDROGEN)) {
            MaxwellBoltzmannDistribution distribution =
                    new MaxwellBoltzmannDistribution(gas, 1000.0);
            for (int speed = 0; speed < 1500; speed += 25) {
                double density = distribution.probabilityDensity(speed);
                assertTrue(Double.isFinite(density));
                assertTrue(density >= 0.0);
            }
        }
    }

    @Test
    void invalidTemperatureMolarMassGasAndSpeedAreRejected() {
        assertThrows(IllegalArgumentException.class,
                () -> new MaxwellBoltzmannDistribution(Gas.ARGON, 0.0));
        assertThrows(IllegalArgumentException.class,
                () -> new MaxwellBoltzmannDistribution(Gas.ARGON, -25.0));
        assertThrows(IllegalArgumentException.class,
                () -> new MaxwellBoltzmannDistribution(Gas.ARGON, Double.NaN));
        assertThrows(IllegalArgumentException.class,
                () -> new MaxwellBoltzmannDistribution(0.0, 300.0));
        assertThrows(IllegalArgumentException.class,
                () -> new MaxwellBoltzmannDistribution(-0.039948, 300.0));
        assertThrows(IllegalArgumentException.class,
                () -> new MaxwellBoltzmannDistribution(Double.POSITIVE_INFINITY, 300.0));
        assertThrows(IllegalArgumentException.class,
                () -> new MaxwellBoltzmannDistribution((Gas) null, 300.0));

        MaxwellBoltzmannDistribution distribution =
                new MaxwellBoltzmannDistribution(Gas.ARGON, 300.0);
        assertThrows(IllegalArgumentException.class, () -> distribution.probabilityDensity(-1.0));
        assertThrows(IllegalArgumentException.class,
                () -> distribution.probabilityDensity(Double.POSITIVE_INFINITY));
    }

    @Test
    void higherTemperatureAndLowerMolarMassShiftPeakTowardHigherSpeeds() {
        double coldArgonPeak = sampledPeakSpeed(Gas.ARGON, 25.0, 0.0, 2000.0, 1.0);
        double warmArgonPeak = sampledPeakSpeed(Gas.ARGON, 300.0, 0.0, 2000.0, 1.0);
        double heliumPeak = sampledPeakSpeed(Gas.HELIUM, 300.0, 0.0, 5000.0, 1.0);
        double hydrogenPeak = sampledPeakSpeed(Gas.HYDROGEN, 300.0, 0.0, 5000.0, 1.0);

        assertTrue(warmArgonPeak > coldArgonPeak);
        assertTrue(heliumPeak > warmArgonPeak);
        assertTrue(hydrogenPeak > heliumPeak);
    }

    @Test
    void sampledArgonDistributionIsNormalizedOverTheNotebookIntroRange() {
        MaxwellBoltzmannDistribution distribution =
                new MaxwellBoltzmannDistribution(Gas.ARGON, 300.0);
        double step = 1.0;
        double area = 0.0;
        double previousDensity = distribution.probabilityDensity(0.0);

        for (int speed = 1; speed <= 2000; speed++) {
            double density = distribution.probabilityDensity(speed);
            area += step * (previousDensity + density) / 2.0;
            previousDensity = density;
        }

        assertEquals(1.0, area, 1.0e-6);
    }

    private static double sampledPeakSpeed(
            Gas gas,
            double temperature,
            double startSpeed,
            double endSpeedExclusive,
            double step) {
        MaxwellBoltzmannDistribution distribution = new MaxwellBoltzmannDistribution(gas, temperature);
        double peakSpeed = startSpeed;
        double maximumDensity = -1.0;
        for (double speed = startSpeed; speed < endSpeedExclusive; speed += step) {
            double density = distribution.probabilityDensity(speed);
            if (density > maximumDensity) {
                peakSpeed = speed;
                maximumDensity = density;
            }
        }
        return peakSpeed;
    }
}
