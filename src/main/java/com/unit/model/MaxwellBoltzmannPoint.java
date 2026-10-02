package com.unit.model;

/** A sampled point on a Maxwell-Boltzmann speed distribution curve. */
public record MaxwellBoltzmannPoint(double speedMetersPerSecond, double probabilityDensity) {
    public MaxwellBoltzmannPoint {
        if (!Double.isFinite(speedMetersPerSecond) || speedMetersPerSecond < 0.0) {
            throw new IllegalArgumentException("Speed must be non-negative and finite");
        }
        if (!Double.isFinite(probabilityDensity) || probabilityDensity < 0.0) {
            throw new IllegalArgumentException("Probability density must be non-negative and finite");
        }
    }
}
