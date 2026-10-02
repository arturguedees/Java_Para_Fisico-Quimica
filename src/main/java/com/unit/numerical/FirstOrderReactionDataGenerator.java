package com.unit.numerical;

import java.util.List;

import com.unit.model.FirstOrderReaction;
import com.unit.model.ReactionConcentrationPoint;

/**
 * Generates evenly spaced concentration points for a first-order reaction.
 * Mantida por compatibilidade: delega para {@link ReactionDataGenerator}.
 */
public final class FirstOrderReactionDataGenerator {
    private FirstOrderReactionDataGenerator() {
    }

    /**
     * Samples the reaction from {@code startTime} at intervals of {@code timeStep}.
     * See {@link ReactionDataGenerator#generate} for the sampling rules.
     */
    public static List<ReactionConcentrationPoint> generate(
            FirstOrderReaction reaction,
            double startTime,
            double endTime,
            double timeStep) {
        return ReactionDataGenerator.generate(reaction, startTime, endTime, timeStep);
    }
}
