package com.unit.ui;

import java.util.List;

import com.unit.model.HalfLifeMarker;
import com.unit.model.KineticsReaction;
import com.unit.model.ReactionConcentrationPoint;
import com.unit.model.ReactionOrder;
import com.unit.numerical.ReactionDataGenerator;

/**
 * Adapts interactive parameter values to the kinetics models and data generator.
 * This class deliberately has no JavaFX dependency so its parameter updates can be tested
 * without starting a graphical toolkit.
 */
public final class FirstOrderKineticsController {
    /** O notebook marca até três meias-vidas. */
    public static final int MAX_HALF_LIVES = 3;

    private final double startTime;
    private final double endTime;
    private final double timeStep;

    public FirstOrderKineticsController(double startTime, double endTime, double timeStep) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.timeStep = timeStep;
    }

    /**
     * Generates a fresh first-order simulation (mantido por compatibilidade).
     *
     * @param initialConcentration initial concentration of A
     * @param rateConstant first-order rate constant
     * @return generated concentration points
     */
    public List<ReactionConcentrationPoint> generateData(
            double initialConcentration,
            double rateConstant) {
        return generateData(ReactionOrder.FIRST, initialConcentration, rateConstant);
    }

    /**
     * Generates a fresh simulation for the selected order and parameter values.
     *
     * @param order ordem cinética selecionada
     * @param initialConcentration [A]₀ em mol/L
     * @param rateConstant k na unidade da ordem selecionada
     * @return generated concentration points
     */
    public List<ReactionConcentrationPoint> generateData(
            ReactionOrder order,
            double initialConcentration,
            double rateConstant) {
        KineticsReaction reaction = createReaction(order, initialConcentration, rateConstant);
        return ReactionDataGenerator.generate(reaction, startTime, endTime, timeStep);
    }

    /**
     * Marcadores de 1, 2 e 3 meias-vidas que caem dentro do intervalo de tempo exibido.
     */
    public List<HalfLifeMarker> halfLifeMarkers(
            ReactionOrder order,
            double initialConcentration,
            double rateConstant) {
        KineticsReaction reaction = createReaction(order, initialConcentration, rateConstant);
        return ReactionDataGenerator.halfLifeMarkers(reaction, MAX_HALF_LIVES, endTime);
    }

    public KineticsReaction createReaction(
            ReactionOrder order,
            double initialConcentration,
            double rateConstant) {
        if (order == null) {
            throw new IllegalArgumentException("Reaction order must not be null");
        }
        return order.createReaction(initialConcentration, rateConstant);
    }
}
