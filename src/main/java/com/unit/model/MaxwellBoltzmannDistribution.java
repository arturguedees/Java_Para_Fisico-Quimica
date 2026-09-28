package com.unit.model;

/**
 * Distribuição de velocidades de Maxwell-Boltzmann:
 * f(v) = 4π * v² * (M / (2π * R * T))^(3/2) * exp(-M * v² / (2 * R * T))
 */
public final class MaxwellBoltzmannDistribution {
    public static final double GAS_CONSTANT = 8.314462618; // Constante dos gases em J / (mol * K)

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
            throw new IllegalArgumentException("Massa molar deve ser positiva e finita");
        }
        if (!Double.isFinite(temperatureKelvin) || temperatureKelvin <= 0.0) {
            throw new IllegalArgumentException("Temperatura deve ser positiva e finita");
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
     * Calcula a densidade f(v) para a velocidade informada (m/s).
     * NOTA TÉCNICA: Usamos a soma em escala logarítmica antes do Math.exp(...)
     * para evitar que números intermediários estourem o limite do double (overflow/underflow).
     */
    public double probabilityDensity(double speedMetersPerSecond) {
        if (!Double.isFinite(speedMetersPerSecond) || speedMetersPerSecond < 0.0) {
            throw new IllegalArgumentException("Velocidade deve ser não-negativa e finita");
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
            throw new ArithmeticException("Densidade excede o limite numérico de double");
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
            throw new IllegalArgumentException("Gás não pode ser nulo");
        }
        return gas;
    }
}
