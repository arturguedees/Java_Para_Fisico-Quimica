package com.unit.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class FirstOrderReactionTest {
    private static final double TOLERANCE = 1.0e-12;

    @Test
    void concentrationsAtInitialTimeMatchInitialConditions() {
        FirstOrderReaction reaction = new FirstOrderReaction(1.0, 0.08);

        assertEquals(1.0, reaction.concentrationA(0.0), TOLERANCE);
        assertEquals(0.0, reaction.concentrationB(0.0), TOLERANCE);
    }

    @Test
    void concentrationADecreasesAndConcentrationBIncreasesOverTime() {
        FirstOrderReaction reaction = new FirstOrderReaction(1.0, 0.08);

        assertTrue(reaction.concentrationA(10.0) < reaction.concentrationA(0.0));
        assertTrue(reaction.concentrationB(10.0) > reaction.concentrationB(0.0));
    }

    @Test
    void totalConcentrationIsConservedAtNotebookExampleTimes() {
        FirstOrderReaction reaction = new FirstOrderReaction(1.0, 0.08);

        for (double time : new double[] {0.0, 10.0, 50.0, 99.0}) {
            assertEquals(1.0, reaction.concentrationA(time) + reaction.concentrationB(time), TOLERANCE);
        }
    }

    @Test
    void notebookExampleProducesExpectedConcentrationAtTime99() {
        FirstOrderReaction reaction = new FirstOrderReaction(1.0, 0.08);

        assertEquals(0.000363, reaction.concentrationA(99.0), 1.0e-6);
        assertEquals(1.0 - reaction.concentrationA(99.0), reaction.concentrationB(99.0), TOLERANCE);
    }

    @Test
    void halfLifeMatchesFormulaAndHalvesConcentrationA() {
        FirstOrderReaction reaction = new FirstOrderReaction(1.0, 0.08);
        double expectedHalfLife = Math.log(2.0) / 0.08;

        assertEquals(expectedHalfLife, reaction.halfLife(), TOLERANCE);
        assertEquals(0.5, reaction.concentrationA(reaction.halfLife()), TOLERANCE);
    }

    @Test
    void lifetimeMatchesFormula() {
        FirstOrderReaction reaction = new FirstOrderReaction(1.0, 0.08);

        assertEquals(1.0 / 0.08, reaction.lifetime(), TOLERANCE);
    }

    @Test
    void rejectsNegativeInitialConcentration() {
        assertThrows(IllegalArgumentException.class, () -> new FirstOrderReaction(-1.0, 0.08));
    }

    @Test
    void rejectsNegativeRateConstant() {
        assertThrows(IllegalArgumentException.class, () -> new FirstOrderReaction(1.0, -0.08));
    }

    @Test
    void rejectsNegativeTime() {
        FirstOrderReaction reaction = new FirstOrderReaction(1.0, 0.08);

        assertThrows(IllegalArgumentException.class, () -> reaction.concentrationA(-1.0));
        assertThrows(IllegalArgumentException.class, () -> reaction.concentrationB(-1.0));
    }

    @Test
    void zeroRateConstantRepresentsNoReaction() {
        FirstOrderReaction reaction = new FirstOrderReaction(1.0, 0.0);

        assertEquals(1.0, reaction.concentrationA(99.0), TOLERANCE);
        assertEquals(0.0, reaction.concentrationB(99.0), TOLERANCE);
        assertEquals(Double.POSITIVE_INFINITY, reaction.halfLife());
        assertEquals(Double.POSITIVE_INFINITY, reaction.lifetime());
    }
}
