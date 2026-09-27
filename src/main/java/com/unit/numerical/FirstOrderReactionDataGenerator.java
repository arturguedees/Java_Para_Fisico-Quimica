package com.unit.numerical;

import java.util.ArrayList;
import java.util.List;

import com.unit.model.FirstOrderReaction;
import com.unit.model.ReactionConcentrationPoint;

/**
 * Generates evenly spaced concentration points for a first-order reaction.
 */
public final class FirstOrderReactionDataGenerator {
    private static final int ENDPOINT_ULP_TOLERANCE = 8;

    private FirstOrderReactionDataGenerator() {
    }

    /**
     * Samples the reaction from {@code startTime} at intervals of {@code timeStep}.
     * The endpoint is included only when it lies on the sampling grid, allowing
     * for floating-point rounding at the endpoint.
     *
     * @param reaction first-order reaction to sample
     * @param startTime first sample time, non-negative and finite
     * @param endTime maximum sample time, non-negative, finite, and not before startTime
     * @param timeStep positive finite interval between samples
     * @return immutable list of sampled points
     * @throws IllegalArgumentException if reaction or any sampling parameter is invalid
     */
    public static List<ReactionConcentrationPoint> generate(
            FirstOrderReaction reaction,
            double startTime,
            double endTime,
            double timeStep) {
        if (reaction == null) {
            throw new IllegalArgumentException("Reaction must not be null");
        }
        if (!Double.isFinite(startTime) || startTime < 0.0) {
            throw new IllegalArgumentException("Start time must be finite and non-negative");
        }
        if (!Double.isFinite(endTime) || endTime < startTime) {
            throw new IllegalArgumentException("End time must be finite and at least the start time");
        }
        if (!Double.isFinite(timeStep) || timeStep <= 0.0) {
            throw new IllegalArgumentException("Time step must be positive and finite");
        }

        List<ReactionConcentrationPoint> points = new ArrayList<>();
        for (long index = 0; ; index++) {
            double time = startTime + index * timeStep;
            if (!isWithinEndpoint(time, endTime)) {
                break;
            }
            if (isCloseToEndpoint(time, endTime)) {
                time = endTime;
            }

            points.add(new ReactionConcentrationPoint(
                    time,
                    reaction.concentrationA(time),
                    reaction.concentrationB(time)));

            if (time >= endTime) {
                break;
            }

            double nextTime = startTime + (index + 1) * timeStep;
            if (nextTime <= time) {
                throw new IllegalArgumentException("Time step is too small to advance the sampling time");
            }
        }

        return List.copyOf(points);
    }

    private static boolean isWithinEndpoint(double time, double endTime) {
        return time <= endTime || isCloseToEndpoint(time, endTime);
    }

    private static boolean isCloseToEndpoint(double time, double endTime) {
        double scale = Math.max(Math.abs(time), Math.abs(endTime));
        double tolerance = ENDPOINT_ULP_TOLERANCE * Math.ulp(scale);
        return Math.abs(time - endTime) <= tolerance;
    }
}
