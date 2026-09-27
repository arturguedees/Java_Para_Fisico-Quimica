package com.unit.model;

/**
 * Models the first-order reaction A -> B.
 */
public final class FirstOrderReaction {
    private final double initialConcentration;
    private final double rateConstant;

    /**
     * Creates a first-order reaction model.
     *
     * @param initialConcentration initial concentration of A, which must be non-negative
     * @param rateConstant first-order rate constant, which must be non-negative
     * @throws IllegalArgumentException if either parameter is negative
     */
    public FirstOrderReaction(double initialConcentration, double rateConstant) {
        if (initialConcentration < 0.0) {
            throw new IllegalArgumentException("Initial concentration must be non-negative");
        }
        if (rateConstant < 0.0) {
            throw new IllegalArgumentException("Rate constant must be non-negative");
        }

        this.initialConcentration = initialConcentration;
        this.rateConstant = rateConstant;
    }

    /**
     * Returns the concentration of A at the specified elapsed time.
     *
     * @param time elapsed time, which must be non-negative
     * @return concentration of A
     * @throws IllegalArgumentException if time is negative
     */
    public double concentrationA(double time) {
        validateTime(time);
        return initialConcentration * Math.exp(-rateConstant * time);
    }

    /**
     * Returns the concentration of B at the specified elapsed time.
     *
     * @param time elapsed time, which must be non-negative
     * @return concentration of B
     * @throws IllegalArgumentException if time is negative
     */
    public double concentrationB(double time) {
        validateTime(time);
        return initialConcentration - concentrationA(time);
    }

    /**
     * Returns the half-life, ln(2) / k. For k = 0, this is positive infinity.
     *
     * @return half-life
     */
    public double halfLife() {
        return Math.log(2.0) / rateConstant;
    }

    /**
     * Returns the lifetime, 1 / k. For k = 0, this is positive infinity.
     *
     * @return lifetime
     */
    public double lifetime() {
        return 1.0 / rateConstant;
    }

    private static void validateTime(double time) {
        if (time < 0.0) {
            throw new IllegalArgumentException("Time must be non-negative");
        }
    }
}
