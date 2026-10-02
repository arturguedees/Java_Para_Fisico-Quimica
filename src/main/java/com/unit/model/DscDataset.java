package com.unit.model;

import java.util.List;

/**
 * Immutable ordered samples from a differential scanning calorimetry curve.
 * The second coordinate retains the value and unit convention stated in the source data.
 *
 * @param points experimental samples with strictly increasing temperatures
 */
public record DscDataset(List<DscPoint> points) {
    public DscDataset {
        if (points == null || points.size() < 2) {
            throw new IllegalArgumentException("A DSC dataset must contain at least two points");
        }
        points = List.copyOf(points);
        for (int index = 1; index < points.size(); index++) {
            if (points.get(index).temperatureCelsius() <= points.get(index - 1).temperatureCelsius()) {
                throw new IllegalArgumentException("DSC temperatures must be strictly increasing");
            }
        }
    }

    public DscPoint firstPoint() {
        return points.get(0);
    }

    public DscPoint lastPoint() {
        return points.get(points.size() - 1);
    }
}
