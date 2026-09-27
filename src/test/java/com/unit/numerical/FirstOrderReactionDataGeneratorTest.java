package com.unit.numerical;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;

import com.unit.model.FirstOrderReaction;
import com.unit.model.ReactionConcentrationPoint;

class FirstOrderReactionDataGeneratorTest {
    private static final double TOLERANCE = 1.0e-12;

    @Test
    void generatesExpectedNumberOfPointsIncludingAlignedEndpoints() {
        FirstOrderReaction reaction = new FirstOrderReaction(1.0, 0.08);

        List<ReactionConcentrationPoint> points =
                FirstOrderReactionDataGenerator.generate(reaction, 0.0, 4.0, 2.0);

        assertEquals(3, points.size());
        assertEquals(0.0, points.get(0).time(), TOLERANCE);
        assertEquals(4.0, points.get(2).time(), TOLERANCE);
    }

    @Test
    void includesFloatingPointEndpointWhenSamplingGridReachesIt() {
        FirstOrderReaction reaction = new FirstOrderReaction(1.0, 0.08);

        List<ReactionConcentrationPoint> points =
                FirstOrderReactionDataGenerator.generate(reaction, 0.0, 0.3, 0.1);

        assertEquals(4, points.size());
        assertEquals(0.3, points.get(3).time(), TOLERANCE);
    }

    @Test
    void doesNotAddAnIrregularEndpointWhenItIsOffTheSamplingGrid() {
        FirstOrderReaction reaction = new FirstOrderReaction(1.0, 0.08);

        List<ReactionConcentrationPoint> points =
                FirstOrderReactionDataGenerator.generate(reaction, 0.0, 1.0, 0.3);

        assertEquals(4, points.size());
        assertEquals(0.9, points.get(points.size() - 1).time(), TOLERANCE);
    }

    @Test
    void firstPointMatchesInitialConcentrationsAndADecreasesWhileBIncreases() {
        FirstOrderReaction reaction = new FirstOrderReaction(1.0, 0.08);

        List<ReactionConcentrationPoint> points =
                FirstOrderReactionDataGenerator.generate(reaction, 0.0, 3.0, 1.0);

        assertEquals(1.0, points.get(0).concentrationA(), TOLERANCE);
        assertEquals(0.0, points.get(0).concentrationB(), TOLERANCE);
        assertTrue(points.get(1).concentrationA() < points.get(0).concentrationA());
        assertTrue(points.get(1).concentrationB() > points.get(0).concentrationB());
    }

    @Test
    void conservesTotalConcentrationAtEveryGeneratedPoint() {
        double initialConcentration = 1.0;
        FirstOrderReaction reaction = new FirstOrderReaction(initialConcentration, 0.08);

        List<ReactionConcentrationPoint> points =
                FirstOrderReactionDataGenerator.generate(reaction, 0.0, 99.0, 1.0);

        for (ReactionConcentrationPoint point : points) {
            assertEquals(initialConcentration,
                    point.concentrationA() + point.concentrationB(), TOLERANCE);
        }
    }

    @Test
    void generatesNotebookExampleFromZeroThroughNinetyNine() {
        FirstOrderReaction reaction = new FirstOrderReaction(1.0, 0.08);

        List<ReactionConcentrationPoint> points =
                FirstOrderReactionDataGenerator.generate(reaction, 0.0, 99.0, 1.0);

        assertEquals(100, points.size());
        assertEquals(0.0, points.get(0).time(), TOLERANCE);
        assertEquals(99.0, points.get(99).time(), TOLERANCE);
        assertEquals(1.0, points.get(0).concentrationA(), TOLERANCE);
        assertEquals(0.0, points.get(0).concentrationB(), TOLERANCE);
        assertEquals(0.000363402326495048,
                points.get(99).concentrationA(), TOLERANCE);
        assertEquals(1.0 - points.get(99).concentrationA(),
                points.get(99).concentrationB(), TOLERANCE);
    }

    @Test
    void rejectsInvalidTimeStep() {
        FirstOrderReaction reaction = new FirstOrderReaction(1.0, 0.08);

        assertThrows(IllegalArgumentException.class,
                () -> FirstOrderReactionDataGenerator.generate(reaction, 0.0, 1.0, 0.0));
        assertThrows(IllegalArgumentException.class,
                () -> FirstOrderReactionDataGenerator.generate(reaction, 0.0, 1.0, -0.1));
        assertThrows(IllegalArgumentException.class,
                () -> FirstOrderReactionDataGenerator.generate(reaction, 0.0, 1.0, Double.NaN));
    }

    @Test
    void rejectsInvalidTimeRange() {
        FirstOrderReaction reaction = new FirstOrderReaction(1.0, 0.08);

        assertThrows(IllegalArgumentException.class,
                () -> FirstOrderReactionDataGenerator.generate(reaction, -1.0, 1.0, 0.1));
        assertThrows(IllegalArgumentException.class,
                () -> FirstOrderReactionDataGenerator.generate(reaction, 2.0, 1.0, 0.1));
        assertThrows(IllegalArgumentException.class,
                () -> FirstOrderReactionDataGenerator.generate(reaction, 0.0, Double.POSITIVE_INFINITY, 0.1));
    }
}
