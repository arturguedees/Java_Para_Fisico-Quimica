package com.unit.model;

/**
 * One experimental DSC sample from the notebook.
 *
 * @param temperatureCelsius sample temperature in degrees Celsius
 * @param excessHeatCapacity the notebook's reported excess heat-capacity value
 */
public record DscPoint(double temperatureCelsius, double excessHeatCapacity) {
    public DscPoint {
        if (!Double.isFinite(temperatureCelsius) || !Double.isFinite(excessHeatCapacity)) {
            throw new IllegalArgumentException("DSC values must be finite");
        }
    }
}
