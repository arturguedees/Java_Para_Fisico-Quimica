package com.unit.numerical;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class NumericalIntegrationTest {
    // Somas de poucos termos em double: erro de arredondamento ~1e-15.
    private static final double TOLERANCE = 1.0e-12;

    @Test
    void trapezoidIsExactForStraightLines() {
        double[] x = {0.0, 1.0, 2.5, 4.0};
        double[] y = {1.0, 3.0, 6.0, 9.0}; // y = 2x + 1
        // ∫₀⁴ (2x + 1) dx = 16 + 4 = 20
        assertEquals(20.0, NumericalIntegration.trapezoid(x, y), TOLERANCE);
    }

    @Test
    void simpsonIsExactForCubicsWithEvenNumberOfIntervals() {
        double[] x = {0.0, 0.75, 1.5, 2.25, 3.0};
        double[] y = new double[x.length];
        for (int i = 0; i < x.length; i++) {
            y[i] = x[i] * x[i] * x[i];
        }
        // ∫₀³ x³ dx = 81/4
        assertEquals(20.25, NumericalIntegration.simpson(x, y), TOLERANCE);
    }

    @Test
    void simpsonMatchesScipyForOddNumberOfIntervals() {
        // scipy.integrate.simpson(x**3, x=np.linspace(0, 3, 4)) = 20.5
        double[] x = {0.0, 1.0, 2.0, 3.0};
        double[] y = {0.0, 1.0, 8.0, 27.0};
        assertEquals(20.5, NumericalIntegration.simpson(x, y), TOLERANCE);

        // np.linspace(0, 3, 8) → 20.258433985839233
        double[] x8 = new double[8];
        double[] y8 = new double[8];
        for (int i = 0; i < 8; i++) {
            x8[i] = 3.0 * i / 7.0;
            y8[i] = x8[i] * x8[i] * x8[i];
        }
        assertEquals(20.258433985839233, NumericalIntegration.simpson(x8, y8), TOLERANCE);
    }

    @Test
    void simpsonMatchesScipyForNonUniformSpacing() {
        // scipy.integrate.simpson(x**3, x=[0, 0.5, 1.5, 3.0]) = 21.375
        double[] x = {0.0, 0.5, 1.5, 3.0};
        double[] y = {0.0, 0.125, 3.375, 27.0};
        assertEquals(21.375, NumericalIntegration.simpson(x, y), TOLERANCE);
    }

    @Test
    void simpsonIsMoreAccurateThanTrapezoidForSmoothCurves() {
        // ∫₀^π sen(x) dx = 2, com 10 intervalos
        double trapezoid = NumericalIntegration.integrate(Math::sin, 0.0, Math.PI, 10,
                IntegrationMethod.TRAPEZOID);
        double simpson = NumericalIntegration.integrate(Math::sin, 0.0, Math.PI, 10,
                IntegrationMethod.SIMPSON);

        // Valores do SciPy com np.linspace(0, π, 11)
        assertEquals(1.9835235375094544, trapezoid, TOLERANCE);
        assertEquals(2.0001095173150043, simpson, TOLERANCE);
        assertTrue(Math.abs(simpson - 2.0) < Math.abs(trapezoid - 2.0));
    }

    @Test
    void errorDecreasesWhenStepIsRefined() {
        double coarse = Math.abs(2.0 - NumericalIntegration.integrate(
                Math::sin, 0.0, Math.PI, 10, IntegrationMethod.TRAPEZOID));
        double fine = Math.abs(2.0 - NumericalIntegration.integrate(
                Math::sin, 0.0, Math.PI, 20, IntegrationMethod.TRAPEZOID));
        // Trapézio é de 2ª ordem: dividir h por 2 reduz o erro ~4 vezes
        assertEquals(4.0, coarse / fine, 0.01);
    }

    @Test
    void twoPointsFallBackToTrapezoid() {
        double[] x = {0.0, 2.0};
        double[] y = {1.0, 3.0};
        assertEquals(4.0, NumericalIntegration.simpson(x, y), TOLERANCE);
    }

    @Test
    void rejectsInvalidInput() {
        assertThrows(IllegalArgumentException.class,
                () -> NumericalIntegration.trapezoid(null, new double[] {1.0, 2.0}));
        assertThrows(IllegalArgumentException.class,
                () -> NumericalIntegration.trapezoid(new double[] {0.0, 1.0}, new double[] {1.0}));
        assertThrows(IllegalArgumentException.class,
                () -> NumericalIntegration.simpson(new double[] {0.0}, new double[] {1.0}));
        assertThrows(IllegalArgumentException.class,
                () -> NumericalIntegration.simpson(new double[] {0.0, 2.0, 1.0}, new double[] {1.0, 1.0, 1.0}));
        assertThrows(IllegalArgumentException.class,
                () -> NumericalIntegration.trapezoid(new double[] {0.0, 1.0}, new double[] {1.0, Double.NaN}));
        assertThrows(IllegalArgumentException.class,
                () -> NumericalIntegration.integrate(Math::sin, 1.0, 0.0, 10, IntegrationMethod.SIMPSON));
        assertThrows(IllegalArgumentException.class,
                () -> NumericalIntegration.integrate(Math::sin, 0.0, 1.0, 0, IntegrationMethod.SIMPSON));
    }
}
