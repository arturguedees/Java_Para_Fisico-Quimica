package com.unit.numerical;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import com.unit.model.Gas;
import com.unit.model.MaxwellBoltzmannDistribution;

class MaxwellBoltzmannIntegrationTest {
    /** CH₄, gás usado na seção 3 do notebook (kg/mol). */
    private static final double METHANE_MOLAR_MASS = 0.016;

    /**
     * Tolerância da normalização: com passo de 1 m/s, trapézio e Simpson dão
     * área = 1 até ~1e-15. 1e-9 deixa margem de sobra e ainda detecta qualquer
     * erro de fórmula ou de unidade (que mudaria a área em ordens de grandeza maiores).
     */
    private static final double NORMALIZATION_TOLERANCE = 1.0e-9;

    /**
     * Tolerância Python × Java: mesmas fórmulas e mesma malha; a diferença vem
     * só da ordem das operações em double (~1e-15). Ver Etapa 12 do roteiro.
     */
    private static final double PYTHON_TOLERANCE = 1.0e-12;

    @Test
    void areaUnderDistributionIsOneWithBothMethods() {
        for (double temperature : new double[] {25.0, 300.0, 1025.0, 1925.0}) {
            MaxwellBoltzmannDistribution distribution =
                    new MaxwellBoltzmannDistribution(METHANE_MOLAR_MASS, temperature);
            for (IntegrationMethod method : IntegrationMethod.values()) {
                double area = MaxwellBoltzmannIntegration.normalizationArea(
                        distribution, MaxwellBoltzmannIntegration.NOTEBOOK_SPEED_STEP, method);
                assertEquals(1.0, area, NORMALIZATION_TOLERANCE,
                        "T = " + temperature + " K, método " + method);
            }
        }
    }

    @Test
    void areaIsOneForEveryNotebookGas() {
        for (Gas gas : Gas.values()) {
            MaxwellBoltzmannDistribution distribution = new MaxwellBoltzmannDistribution(gas, 300.0);
            double area = MaxwellBoltzmannIntegration.normalizationArea(
                    distribution, 1.0, IntegrationMethod.SIMPSON);
            assertEquals(1.0, area, NORMALIZATION_TOLERANCE, gas.displayName());
        }
    }

    @Test
    void notebookGridMatchesPythonReferenceValues() {
        // Python: v = np.arange(2000); scipy.integrate.trapezoid / simpson; R = 8.314462618
        double[][] references = {
                // T (K),  trapézio,             Simpson
                {25.0,   0.9999999999999998, 0.9999999999999997},
                {1025.0, 0.9424975088500432, 0.9424975530448717},
                {1925.0, 0.7379594600953194, 0.7379594960532515},
        };
        for (double[] reference : references) {
            MaxwellBoltzmannDistribution distribution =
                    new MaxwellBoltzmannDistribution(METHANE_MOLAR_MASS, reference[0]);
            assertEquals(reference[1], MaxwellBoltzmannIntegration.notebookGridArea(
                    distribution, IntegrationMethod.TRAPEZOID), PYTHON_TOLERANCE);
            assertEquals(reference[2], MaxwellBoltzmannIntegration.notebookGridArea(
                    distribution, IntegrationMethod.SIMPSON), PYTHON_TOLERANCE);
        }
    }

    @Test
    void notebookGridTruncatesTheTailAtHighTemperature() {
        // O notebook afirma "Area under curve = 1", mas 0–1999 m/s não cobre a cauda a 1925 K
        MaxwellBoltzmannDistribution hot =
                new MaxwellBoltzmannDistribution(METHANE_MOLAR_MASS, 1925.0);

        double notebookArea = MaxwellBoltzmannIntegration.notebookGridArea(hot, IntegrationMethod.SIMPSON);
        double fullArea = MaxwellBoltzmannIntegration.normalizationArea(hot, 1.0, IntegrationMethod.SIMPSON);

        assertTrue(notebookArea < 0.75);
        assertTrue(MaxwellBoltzmannIntegration.fullRangeUpperSpeed(hot) > 2000.0);
        assertEquals(1.0, fullArea, NORMALIZATION_TOLERANCE);
    }

    @Test
    void coarseStepStillNormalizes() {
        // A curva começa e termina em zero, então até um passo grosso dá área ≈ 1
        MaxwellBoltzmannDistribution distribution =
                new MaxwellBoltzmannDistribution(METHANE_MOLAR_MASS, 300.0);
        for (IntegrationMethod method : IntegrationMethod.values()) {
            assertEquals(1.0, MaxwellBoltzmannIntegration.normalizationArea(distribution, 25.0, method), 1.0e-6);
        }
    }

    @Test
    void areaOfAnySubIntervalIsBetweenZeroAndOne() {
        MaxwellBoltzmannDistribution distribution =
                new MaxwellBoltzmannDistribution(METHANE_MOLAR_MASS, 300.0);
        double partial = MaxwellBoltzmannIntegration.area(
                distribution, 0.0, 800.0, 1.0, IntegrationMethod.SIMPSON);
        assertTrue(partial > 0.0 && partial < 1.0);
    }

    @Test
    void mostProbableSpeedSetsTheIntegrationLimit() {
        MaxwellBoltzmannDistribution distribution =
                new MaxwellBoltzmannDistribution(METHANE_MOLAR_MASS, 300.0);
        double expected = Math.sqrt(2.0 * MaxwellBoltzmannDistribution.GAS_CONSTANT * 300.0 / METHANE_MOLAR_MASS);

        assertEquals(expected, distribution.mostProbableSpeed(), 1.0e-9);
        assertEquals(10.0 * expected, MaxwellBoltzmannIntegration.fullRangeUpperSpeed(distribution), 1.0e-9);
    }

    @Test
    void rejectsInvalidArguments() {
        MaxwellBoltzmannDistribution distribution =
                new MaxwellBoltzmannDistribution(METHANE_MOLAR_MASS, 300.0);

        assertThrows(IllegalArgumentException.class,
                () -> MaxwellBoltzmannIntegration.area(distribution, 0.0, 800.0, 1.0, null));
        assertThrows(IllegalArgumentException.class,
                () -> MaxwellBoltzmannIntegration.area(distribution, 0.0, 800.0, -1.0, IntegrationMethod.SIMPSON));
        assertThrows(IllegalArgumentException.class,
                () -> MaxwellBoltzmannIntegration.area(distribution, 0.0, 1.0, 1.0, IntegrationMethod.SIMPSON));
        assertThrows(IllegalArgumentException.class,
                () -> MaxwellBoltzmannIntegration.fullRangeUpperSpeed(null));
    }
}
