package com.unit.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;

class DscDatasetTest {
    @Test
    void notebookDatasetContainsAllSamplesAndOriginalBounds() {
        DscDataset dataset = HenEggWhiteLysozymeDscData.dataset();

        assertEquals(23, dataset.points().size());
        assertEquals(30.0, dataset.firstPoint().temperatureCelsius());
        assertEquals(80.0, dataset.lastPoint().temperatureCelsius());
        assertEquals(90.0, dataset.points().get(13).excessHeatCapacity());
        assertEquals(64.5, dataset.points().get(13).temperatureCelsius());
    }

    @Test
    void datasetDefensivelyCopiesItsPointList() {
        List<DscPoint> points = new ArrayList<>(List.of(
                new DscPoint(0.0, 1.0),
                new DscPoint(1.0, 2.0)));
        DscDataset dataset = new DscDataset(points);
        points.clear();

        assertEquals(2, dataset.points().size());
        assertThrows(UnsupportedOperationException.class,
                () -> dataset.points().add(new DscPoint(2.0, 3.0)));
    }

    @Test
    void rejectsTooFewPointsAndNonIncreasingTemperatures() {
        assertThrows(IllegalArgumentException.class,
                () -> new DscDataset(List.of(new DscPoint(0.0, 1.0))));
        assertThrows(IllegalArgumentException.class,
                () -> new DscDataset(List.of(
                        new DscPoint(1.0, 1.0),
                        new DscPoint(1.0, 2.0))));
    }

    @Test
    void rejectsNonFiniteExperimentalValues() {
        assertThrows(IllegalArgumentException.class, () -> new DscPoint(Double.NaN, 1.0));
        assertThrows(IllegalArgumentException.class, () -> new DscPoint(1.0, Double.POSITIVE_INFINITY));
    }
}
