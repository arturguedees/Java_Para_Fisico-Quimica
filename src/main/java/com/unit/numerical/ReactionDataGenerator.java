package com.unit.numerical;

import java.util.ArrayList;
import java.util.List;

import com.unit.model.HalfLifeMarker;
import com.unit.model.KineticsReaction;
import com.unit.model.ReactionConcentrationPoint;

/**
 * Gera pontos igualmente espaçados de [A](t) e [B](t) para qualquer
 * {@link KineticsReaction} (ordem zero ou primeira ordem) e os marcadores
 * de meias-vidas sucessivas usados no gráfico.
 */
public final class ReactionDataGenerator {
    private static final int ENDPOINT_ULP_TOLERANCE = 8;

    private ReactionDataGenerator() {
    }

    /**
     * Samples the reaction from {@code startTime} at intervals of {@code timeStep}.
     * The endpoint is included only when it lies on the sampling grid, allowing
     * for floating-point rounding at the endpoint.
     *
     * @param reaction reaction to sample (any order)
     * @param startTime first sample time, non-negative and finite
     * @param endTime maximum sample time, non-negative, finite, and not before startTime
     * @param timeStep positive finite interval between samples
     * @return immutable list of sampled points
     * @throws IllegalArgumentException if reaction or any sampling parameter is invalid
     */
    public static List<ReactionConcentrationPoint> generate(
            KineticsReaction reaction,
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

    /**
     * Marcadores do fim de cada meia-vida sucessiva, de 1 até {@code maxHalfLives},
     * mantendo apenas os que caem dentro de [0, endTime].
     *
     * @param reaction reação a analisar
     * @param maxHalfLives quantidade máxima de meias-vidas (≥ 1)
     * @param endTime tempo máximo exibido no gráfico, em s
     * @return lista imutável, possivelmente vazia se t½ &gt; endTime ou k = 0
     */
    public static List<HalfLifeMarker> halfLifeMarkers(
            KineticsReaction reaction,
            int maxHalfLives,
            double endTime) {
        if (reaction == null) {
            throw new IllegalArgumentException("Reaction must not be null");
        }
        if (maxHalfLives < 1) {
            throw new IllegalArgumentException("At least one half-life must be requested");
        }
        if (!Double.isFinite(endTime) || endTime < 0.0) {
            throw new IllegalArgumentException("End time must be finite and non-negative");
        }

        List<HalfLifeMarker> markers = new ArrayList<>(maxHalfLives);
        for (int n = 1; n <= maxHalfLives; n++) {
            double time = reaction.timeAtSuccessiveHalfLife(n);
            if (!Double.isFinite(time) || time > endTime) {
                break;
            }
            markers.add(new HalfLifeMarker(n, time, reaction.concentrationA(time)));
        }
        return List.copyOf(markers);
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
