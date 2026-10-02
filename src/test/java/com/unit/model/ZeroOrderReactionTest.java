package com.unit.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class ZeroOrderReactionTest {
    // Operações simples (soma/multiplicação) em double: erro de arredondamento ~1e-16.
    private static final double TOLERANCE = 1.0e-12;

    @Test
    void concentrationsAtInitialTimeMatchInitialConditions() {
        ZeroOrderReaction reaction = new ZeroOrderReaction(1.0, 0.05);

        assertEquals(1.0, reaction.concentrationA(0.0), TOLERANCE);
        assertEquals(0.0, reaction.concentrationB(0.0), TOLERANCE);
    }

    @Test
    void concentrationDecreasesLinearlyWithTime() {
        ZeroOrderReaction reaction = new ZeroOrderReaction(1.0, 0.05);

        assertEquals(0.75, reaction.concentrationA(5.0), TOLERANCE);
        assertEquals(0.50, reaction.concentrationA(10.0), TOLERANCE);
        // Variação constante a cada intervalo igual de tempo (reta)
        double firstDrop = reaction.concentrationA(0.0) - reaction.concentrationA(4.0);
        double secondDrop = reaction.concentrationA(4.0) - reaction.concentrationA(8.0);
        assertEquals(firstDrop, secondDrop, TOLERANCE);
    }

    @Test
    void productEqualsRateTimesTimeForAnyInitialConcentration() {
        // O notebook usa B = A0 - (1 - k t), que só vale para A0 = 1.
        ZeroOrderReaction reaction = new ZeroOrderReaction(1.4, 0.05);

        assertEquals(0.05 * 10.0, reaction.concentrationB(10.0), TOLERANCE);
    }

    @Test
    void totalConcentrationIsConserved() {
        ZeroOrderReaction reaction = new ZeroOrderReaction(1.2, 0.03);

        for (double time : new double[] {0.0, 10.0, 39.0, 40.0, 99.0}) {
            assertEquals(1.2, reaction.concentrationA(time) + reaction.concentrationB(time), TOLERANCE);
        }
    }

    @Test
    void concentrationNeverBecomesNegativeAfterReactantIsConsumed() {
        ZeroOrderReaction reaction = new ZeroOrderReaction(1.0, 0.1);

        assertEquals(10.0, reaction.completionTime(), TOLERANCE);
        for (double time = 0.0; time <= 99.0; time += 1.0) {
            assertTrue(reaction.concentrationA(time) >= 0.0, "[A] negativa em t = " + time);
            assertTrue(reaction.concentrationB(time) <= 1.0 + TOLERANCE);
        }
        assertEquals(0.0, reaction.concentrationA(50.0), TOLERANCE);
        assertEquals(1.0, reaction.concentrationB(50.0), TOLERANCE);
    }

    @Test
    void halfLifeMatchesFormulaAndHalvesConcentration() {
        ZeroOrderReaction reaction = new ZeroOrderReaction(1.0, 0.08);

        assertEquals(1.0 / (2.0 * 0.08), reaction.halfLife(), TOLERANCE);
        assertEquals(0.5, reaction.concentrationA(reaction.halfLife()), TOLERANCE);
    }

    @Test
    void halfLifeDependsOnInitialConcentration() {
        // Diferença física em relação à primeira ordem: t½ ∝ [A]₀
        ZeroOrderReaction smaller = new ZeroOrderReaction(0.5, 0.05);
        ZeroOrderReaction larger = new ZeroOrderReaction(1.0, 0.05);

        assertEquals(2.0 * smaller.halfLife(), larger.halfLife(), TOLERANCE);
    }

    @Test
    void largerRateConstantReducesHalfLife() {
        ZeroOrderReaction slower = new ZeroOrderReaction(1.0, 0.02);
        ZeroOrderReaction faster = new ZeroOrderReaction(1.0, 0.08);

        assertTrue(faster.halfLife() < slower.halfLife());
        assertTrue(faster.completionTime() < slower.completionTime());
    }

    @Test
    void successiveHalfLivesMatchNotebookValues() {
        // Notebook: 2ª meia-vida em half_life + half_life/2; 3ª em + half_life/4
        ZeroOrderReaction reaction = new ZeroOrderReaction(1.0, 0.05);
        double halfLife = reaction.halfLife();

        assertEquals(halfLife, reaction.timeAtSuccessiveHalfLife(1), TOLERANCE);
        assertEquals(1.5 * halfLife, reaction.timeAtSuccessiveHalfLife(2), TOLERANCE);
        assertEquals(1.75 * halfLife, reaction.timeAtSuccessiveHalfLife(3), TOLERANCE);

        assertEquals(0.5, reaction.concentrationA(reaction.timeAtSuccessiveHalfLife(1)), TOLERANCE);
        assertEquals(0.25, reaction.concentrationA(reaction.timeAtSuccessiveHalfLife(2)), TOLERANCE);
        assertEquals(0.125, reaction.concentrationA(reaction.timeAtSuccessiveHalfLife(3)), TOLERANCE);
    }

    @Test
    void successiveHalfLivesGetShorterUnlikeFirstOrder() {
        ZeroOrderReaction zero = new ZeroOrderReaction(1.0, 0.05);
        FirstOrderReaction first = new FirstOrderReaction(1.0, 0.05);

        double zeroFirstInterval = zero.timeAtSuccessiveHalfLife(1);
        double zeroSecondInterval = zero.timeAtSuccessiveHalfLife(2) - zero.timeAtSuccessiveHalfLife(1);
        double firstFirstInterval = first.timeAtSuccessiveHalfLife(1);
        double firstSecondInterval = first.timeAtSuccessiveHalfLife(2) - first.timeAtSuccessiveHalfLife(1);

        assertEquals(zeroFirstInterval / 2.0, zeroSecondInterval, TOLERANCE);
        assertEquals(firstFirstInterval, firstSecondInterval, TOLERANCE);
    }

    @Test
    void zeroRateConstantRepresentsNoReaction() {
        ZeroOrderReaction reaction = new ZeroOrderReaction(1.0, 0.0);

        assertEquals(1.0, reaction.concentrationA(99.0), TOLERANCE);
        assertEquals(0.0, reaction.concentrationB(99.0), TOLERANCE);
        assertEquals(Double.POSITIVE_INFINITY, reaction.halfLife());
        assertEquals(Double.POSITIVE_INFINITY, reaction.completionTime());
    }

    @Test
    void reportsItsOrder() {
        assertEquals(ReactionOrder.ZERO, new ZeroOrderReaction(1.0, 0.05).order());
        assertEquals(ReactionOrder.FIRST, new FirstOrderReaction(1.0, 0.05).order());
    }

    @Test
    void orderFactoryCreatesMatchingModel() {
        assertTrue(ReactionOrder.ZERO.createReaction(1.0, 0.05) instanceof ZeroOrderReaction);
        assertTrue(ReactionOrder.FIRST.createReaction(1.0, 0.05) instanceof FirstOrderReaction);
    }

    @Test
    void rejectsInvalidInputs() {
        assertThrows(IllegalArgumentException.class, () -> new ZeroOrderReaction(-1.0, 0.05));
        assertThrows(IllegalArgumentException.class, () -> new ZeroOrderReaction(1.0, -0.05));
        assertThrows(IllegalArgumentException.class, () -> new ZeroOrderReaction(Double.NaN, 0.05));
        assertThrows(IllegalArgumentException.class, () -> new ZeroOrderReaction(1.0, Double.POSITIVE_INFINITY));

        ZeroOrderReaction reaction = new ZeroOrderReaction(1.0, 0.05);
        assertThrows(IllegalArgumentException.class, () -> reaction.concentrationA(-1.0));
        assertThrows(IllegalArgumentException.class, () -> reaction.concentrationB(-1.0));
        assertThrows(IllegalArgumentException.class, () -> reaction.timeAtSuccessiveHalfLife(0));
    }
}
