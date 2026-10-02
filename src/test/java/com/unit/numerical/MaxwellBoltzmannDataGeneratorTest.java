package com.unit.numerical;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;

import org.junit.jupiter.api.Test;

import com.unit.model.Gas;
import com.unit.model.MaxwellBoltzmannDistribution;
import com.unit.model.MaxwellBoltzmannPoint;

class MaxwellBoltzmannDataGeneratorTest {
    private static final double TOLERANCE = 1.0e-14;

    @Test
    void interactiveNotebookGridContainsSpeedsZeroThrough1499() {
        MaxwellBoltzmannDistribution distribution =
                new MaxwellBoltzmannDistribution(Gas.ARGON, 25.0);

        List<MaxwellBoltzmannPoint> points = MaxwellBoltzmannDataGenerator.generate(
                distribution, 0.0, 1500.0, 1.0);

        assertEquals(1500, points.size());
        assertEquals(0.0, points.get(0).speedMetersPerSecond(), TOLERANCE);
        assertEquals(1499.0, points.get(1499).speedMetersPerSecond(), TOLERANCE);
        assertEquals(0.0, points.get(0).probabilityDensity(), TOLERANCE);
    }

    @Test
    void endSpeedIsExclusiveAndNonAlignedLastSampleIsBelowIt() {
        MaxwellBoltzmannDistribution distribution =
                new MaxwellBoltzmannDistribution(Gas.ARGON, 300.0);

        List<MaxwellBoltzmannPoint> points = MaxwellBoltzmannDataGenerator.generate(
                distribution, 0.0, 2.5, 1.0);

        assertEquals(3, points.size());
        assertEquals(2.0, points.get(2).speedMetersPerSecond(), TOLERANCE);
    }

    @Test
    void rejectsInvalidSamplingArguments() {
        MaxwellBoltzmannDistribution distribution =
                new MaxwellBoltzmannDistribution(Gas.ARGON, 300.0);

        assertThrows(IllegalArgumentException.class,
                () -> MaxwellBoltzmannDataGenerator.generate(null, 0.0, 1.0, 1.0));
        assertThrows(IllegalArgumentException.class,
                () -> MaxwellBoltzmannDataGenerator.generate(distribution, -1.0, 1.0, 1.0));
        assertThrows(IllegalArgumentException.class,
                () -> MaxwellBoltzmannDataGenerator.generate(distribution, 1.0, 1.0, 1.0));
        assertThrows(IllegalArgumentException.class,
                () -> MaxwellBoltzmannDataGenerator.generate(distribution, 0.0, 1.0, 0.0));
        assertThrows(IllegalArgumentException.class,
                () -> MaxwellBoltzmannDataGenerator.generate(distribution, 0.0, 1.0, Double.NaN));
    }
}
