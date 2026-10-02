package com.unit.numerical;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;

import com.unit.model.FirstOrderReaction;
import com.unit.model.HalfLifeMarker;
import com.unit.model.ReactionConcentrationPoint;
import com.unit.model.ZeroOrderReaction;

class ReactionDataGeneratorTest {
    private static final double TOLERANCE = 1.0e-12;

    @Test
    void zeroOrderNotebookGridHasHundredValidPoints() {
        // Notebook: t = np.arange(100), A_0 = 1, k no slider (0,01 a 0,1)
        List<ReactionConcentrationPoint> points =
                ReactionDataGenerator.generate(new ZeroOrderReaction(1.0, 0.1), 0.0, 99.0, 1.0);

        assertEquals(100, points.size());
        assertEquals(1.0, points.get(0).concentrationA(), TOLERANCE);
        assertEquals(0.5, points.get(5).concentrationA(), TOLERANCE);
        for (ReactionConcentrationPoint point : points) {
            assertTrue(point.concentrationA() >= 0.0);
            assertEquals(1.0, point.concentrationA() + point.concentrationB(), TOLERANCE);
        }
        // Depois de t = [A]0/k = 10 s o reagente acabou
        assertEquals(0.0, points.get(99).concentrationA(), TOLERANCE);
    }

    @Test
    void zeroOrderMarkersFollowSuccessiveHalvings() {
        List<HalfLifeMarker> markers = ReactionDataGenerator.halfLifeMarkers(
                new ZeroOrderReaction(1.0, 0.05), 3, 99.0);

        assertEquals(3, markers.size());
        assertEquals(10.0, markers.get(0).time(), TOLERANCE);
        assertEquals(15.0, markers.get(1).time(), TOLERANCE);
        assertEquals(17.5, markers.get(2).time(), TOLERANCE);
        assertEquals(0.5, markers.get(0).concentrationA(), TOLERANCE);
        assertEquals(0.25, markers.get(1).concentrationA(), TOLERANCE);
        assertEquals(0.125, markers.get(2).concentrationA(), TOLERANCE);
    }

    @Test
    void firstOrderMarkersAreEquallySpaced() {
        FirstOrderReaction reaction = new FirstOrderReaction(1.0, 0.08);
        List<HalfLifeMarker> markers = ReactionDataGenerator.halfLifeMarkers(reaction, 3, 99.0);

        assertEquals(3, markers.size());
        for (int index = 0; index < markers.size(); index++) {
            assertEquals(index + 1, markers.get(index).number());
            assertEquals((index + 1) * reaction.halfLife(), markers.get(index).time(), TOLERANCE);
            assertEquals(Math.pow(0.5, index + 1), markers.get(index).concentrationA(), TOLERANCE);
        }
    }

    @Test
    void markersOutsideDisplayedTimeAreOmitted() {
        // k = 0,01 em primeira ordem: t½ ≈ 69,3 s; 2ª meia-vida ≈ 138,6 s > 99 s
        List<HalfLifeMarker> markers = ReactionDataGenerator.halfLifeMarkers(
                new FirstOrderReaction(1.0, 0.01), 3, 99.0);

        assertEquals(1, markers.size());
        assertTrue(ReactionDataGenerator.halfLifeMarkers(
                new ZeroOrderReaction(1.0, 0.0), 3, 99.0).isEmpty());
    }

    @Test
    void rejectsInvalidMarkerArguments() {
        ZeroOrderReaction reaction = new ZeroOrderReaction(1.0, 0.05);

        assertThrows(IllegalArgumentException.class,
                () -> ReactionDataGenerator.halfLifeMarkers(null, 3, 99.0));
        assertThrows(IllegalArgumentException.class,
                () -> ReactionDataGenerator.halfLifeMarkers(reaction, 0, 99.0));
        assertThrows(IllegalArgumentException.class,
                () -> ReactionDataGenerator.halfLifeMarkers(reaction, 3, -1.0));
    }
}
