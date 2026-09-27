package com.unit.ui;

import java.util.List;

import com.unit.model.FirstOrderReaction;
import com.unit.model.ReactionConcentrationPoint;
import com.unit.numerical.FirstOrderReactionDataGenerator;

/**
 * Adapts interactive parameter values to the Module 5 reaction model and data generator.
 * This class deliberately has no JavaFX dependency so its parameter updates can be tested
 * without starting a graphical toolkit.
 */
public final class FirstOrderKineticsController {
    private final double startTime;
    private final double endTime;
    private final double timeStep;

    public FirstOrderKineticsController(double startTime, double endTime, double timeStep) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.timeStep = timeStep;
    }

    /**
     * Generates a fresh simulation for the current interactive parameter values.
     *
     * @param initialConcentration initial concentration of A
     * @param rateConstant first-order rate constant
     * @return generated concentration points
     */
    public List<ReactionConcentrationPoint> generateData(
            double initialConcentration,
            double rateConstant) {
        FirstOrderReaction reaction = new FirstOrderReaction(initialConcentration, rateConstant);
        return FirstOrderReactionDataGenerator.generate(reaction, startTime, endTime, timeStep);
    }
}
