package com.unit.ui;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;

import com.unit.model.ReactionConcentrationPoint;

class FirstOrderKineticsControllerTest {
    private static final double TOLERANCE = 1.0e-12;
    private final FirstOrderKineticsController controller =
            new FirstOrderKineticsController(0.0, 10.0, 1.0);

    @Test
    void parameterChangesGenerateNewCoherentSimulationData() {
        List<ReactionConcentrationPoint> original = controller.generateData(1.0, 0.08);
        List<ReactionConcentrationPoint> changed = controller.generateData(1.4, 0.09);

        assertEquals(11, original.size());
        assertEquals(11, changed.size());
        assertEquals(1.0, original.get(0).concentrationA(), TOLERANCE);
        assertEquals(1.4, changed.get(0).concentrationA(), TOLERANCE);
        assertNotEquals(original.get(10).concentrationA(), changed.get(10).concentrationA());
    }

    @Test
    void generatedPointsConserveTheSelectedInitialConcentration() {
        double initialConcentration = 1.7;
        List<ReactionConcentrationPoint> points = controller.generateData(initialConcentration, 0.08);

        for (ReactionConcentrationPoint point : points) {
            assertEquals(initialConcentration,
                    point.concentrationA() + point.concentrationB(), TOLERANCE);
        }
    }

    @Test
    void largerRateConstantCausesFasterReactantDecay() {
        List<ReactionConcentrationPoint> slower = controller.generateData(1.0, 0.01);
        List<ReactionConcentrationPoint> faster = controller.generateData(1.0, 0.1);

        assertTrue(faster.get(5).concentrationA() < slower.get(5).concentrationA());
        assertTrue(faster.get(5).concentrationB() > slower.get(5).concentrationB());
    }

    @Test
    void zeroRateConstantLeavesTheConcentrationsUnchanged() {
        List<ReactionConcentrationPoint> points = controller.generateData(1.3, 0.0);

        for (ReactionConcentrationPoint point : points) {
            assertEquals(1.3, point.concentrationA(), TOLERANCE);
            assertEquals(0.0, point.concentrationB(), TOLERANCE);
        }
    }

    @Test
    void sliderLimitsStepsAndNotebookTimeGridArePreserved() {
        assertEquals(0.0, FirstOrderKineticsInteractiveApp.INITIAL_CONCENTRATION_MIN, TOLERANCE);
        assertEquals(1.45, FirstOrderKineticsInteractiveApp.INITIAL_CONCENTRATION_MAX, TOLERANCE);
        assertEquals(0.2, FirstOrderKineticsInteractiveApp.INITIAL_CONCENTRATION_STEP, TOLERANCE);
        assertEquals(0.01, FirstOrderKineticsInteractiveApp.RATE_CONSTANT_MIN, TOLERANCE);
        assertEquals(0.1, FirstOrderKineticsInteractiveApp.RATE_CONSTANT_MAX, TOLERANCE);
        assertEquals(0.01, FirstOrderKineticsInteractiveApp.RATE_CONSTANT_STEP, TOLERANCE);

        List<ReactionConcentrationPoint> points = controller.generateData(1.0, 0.08);
        assertEquals(11, points.size());
        assertEquals(0.0, points.get(0).time(), TOLERANCE);
        assertEquals(10.0, points.get(10).time(), TOLERANCE);

        FirstOrderKineticsController notebookTimeRange = new FirstOrderKineticsController(
                FirstOrderKineticsInteractiveApp.START_TIME,
                FirstOrderKineticsInteractiveApp.END_TIME,
                FirstOrderKineticsInteractiveApp.TIME_STEP);
        List<ReactionConcentrationPoint> notebookPoints = notebookTimeRange.generateData(1.0, 0.08);
        assertEquals(100, notebookPoints.size());
        assertEquals(99.0, notebookPoints.get(99).time(), TOLERANCE);
    }
}
