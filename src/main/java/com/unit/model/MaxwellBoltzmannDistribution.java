package com.unit.model;

/**
 * Maxwell-Boltzmann molecular speed distribution for a specified molar mass
 * and absolute temperature.
 *
 * <p>The density is expressed per unit speed (s/m). With molar mass in kg/mol,
 * the formula is {@code f(v) = 4πv² (M/(2πRT))^(3/2) exp(-Mv²/(2RT))}.</p>
 */
public final class MaxwellBoltzmannDistribution {
    /** Gas constant used in the notebook's molar formulation, in J mol⁻¹ K⁻¹. */
    public static final double GAS_CONSTANT = 8.314462618;

    private static final double LOG_MAX_VALUE = Math.log(Double.MAX_VALUE);
    private static final double LOG_MIN_VALUE = Math.log(Double.MIN_VALUE);

    private final double molarMassKgPerMol;
    private final double temperatureKelvin;
    private final double logNormalization;
    private final double thermalSpeedScale;

    public MaxwellBoltzmannDistribution(Gas gas, double temperatureKelvin) {
        this(requireGas(gas).molarMassKgPerMol(), temperatureKelvin);
    }

    public MaxwellBoltzmannDistribution(double molarMassKgPerMol, double temperatureKelvin) {
        if (!Double.isFinite(molarMassKgPerMol) || molarMassKgPerMol <= 0.0) {
            throw new IllegalArgumentException("Molar mass must be positive and finite");
        }
        if (!Double.isFinite(temperatureKelvin) || temperatureKelvin <= 0.0) {
            throw new IllegalArgumentException("Temperature must be positive and finite");
        }

        this.molarMassKgPerMol = molarMassKgPerMol;
        this.temperatureKelvin = temperatureKelvin;
        double denominator = 2.0 * Math.PI * GAS_CONSTANT * temperatureKelvin;
        this.logNormalization = Math.log(4.0 * Math.PI)
                + 1.5 * (Math.log(molarMassKgPerMol) - Math.log(denominator));
        this.thermalSpeedScale = Math.sqrt(
                molarMassKgPerMol / (2.0 * GAS_CONSTANT * temperatureKelvin));
    }

    /**
     * Evaluates the speed probability density at {@code speedMetersPerSecond}.
     * Logarithmic evaluation avoids intermediate overflow/underflow for the
     * notebook's speed and temperature ranges.
     *
     * @param speedMetersPerSecond molecular speed in m/s; must be non-negative and finite
     * @return probability density per (m/s)
     * @throws IllegalArgumentException if speed is negative or non-finite
     * @throws ArithmeticException if the finite result cannot be represented as a double
     */
    public double probabilityDensity(double speedMetersPerSecond) {
        if (!Double.isFinite(speedMetersPerSecond) || speedMetersPerSecond < 0.0) {
            throw new IllegalArgumentException("Speed must be non-negative and finite");
        }
        if (speedMetersPerSecond == 0.0) {
            return 0.0;
        }

        double scaledSpeed = thermalSpeedScale * speedMetersPerSecond;
        double exponent = scaledSpeed * scaledSpeed;
        if (!Double.isFinite(exponent)) {
            return 0.0;
        }

        double logDensity = logNormalization
                + 2.0 * Math.log(speedMetersPerSecond)
                - exponent;
        if (logDensity < LOG_MIN_VALUE) {
            return 0.0;
        }
        if (logDensity > LOG_MAX_VALUE) {
            throw new ArithmeticException("Probability density exceeds the representable double range");
        }
        return Math.exp(logDensity);
    }

    public double molarMassKgPerMol() {
        return molarMassKgPerMol;
    }

    public double temperatureKelvin() {
        return temperatureKelvin;
    }

    private static Gas requireGas(Gas gas) {
        if (gas == null) {
            throw new IllegalArgumentException("Gas must not be null");
        }
        return gas;
    }
}
