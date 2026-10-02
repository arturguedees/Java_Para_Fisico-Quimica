package com.unit.numerical;

import java.util.ArrayList;
import java.util.List;

import com.unit.model.MaxwellBoltzmannDistribution;
import com.unit.model.MaxwellBoltzmannPoint;

/** Generates evenly spaced points for a Maxwell-Boltzmann speed distribution. */
public final class MaxwellBoltzmannDataGenerator {
    private MaxwellBoltzmannDataGenerator() {
    }

    /**
     * Samples speeds in the half-open interval [startSpeed, endSpeedExclusive).
     *
     * @param distribution distribution model to sample
     * @param startSpeed first speed in m/s, non-negative and finite
     * @param endSpeedExclusive exclusive upper speed bound in m/s
     * @param speedStep positive finite increment in m/s
     * @return immutable sampled points
     * @throws IllegalArgumentException if the model or sampling range is invalid
     */
    public static List<MaxwellBoltzmannPoint> generate(
            MaxwellBoltzmannDistribution distribution,
            double startSpeed,
            double endSpeedExclusive,
            double speedStep) {
        if (distribution == null) {
            throw new IllegalArgumentException("Distribution must not be null");
        }
        if (!Double.isFinite(startSpeed) || startSpeed < 0.0) {
            throw new IllegalArgumentException("Start speed must be non-negative and finite");
        }
        if (!Double.isFinite(endSpeedExclusive) || endSpeedExclusive <= startSpeed) {
            throw new IllegalArgumentException("Exclusive end speed must be finite and greater than start speed");
        }
        if (!Double.isFinite(speedStep) || speedStep <= 0.0) {
            throw new IllegalArgumentException("Speed step must be positive and finite");
        }

        double estimatedCount = Math.ceil((endSpeedExclusive - startSpeed) / speedStep);
        if (!Double.isFinite(estimatedCount) || estimatedCount > Integer.MAX_VALUE) {
            throw new IllegalArgumentException("Sampling range would generate too many points");
        }

        List<MaxwellBoltzmannPoint> points = new ArrayList<>((int) estimatedCount);
        double previousSpeed = Double.NEGATIVE_INFINITY;
        for (int index = 0; index < (int) estimatedCount; index++) {
            double speed = startSpeed + index * speedStep;
            if (speed >= endSpeedExclusive) {
                break;
            }
            if (speed <= previousSpeed) {
                throw new IllegalArgumentException("Speed step is too small to advance the sample value");
            }
            points.add(new MaxwellBoltzmannPoint(
                    speed,
                    distribution.probabilityDensity(speed)));
            previousSpeed = speed;
        }

        return List.copyOf(points);
    }
}
