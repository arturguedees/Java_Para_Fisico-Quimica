package com.unit.modelo;

import com.unit.util.ConstantesFisicas;
import com.unit.util.ValidadorNumerico;

/**
 * Modelo completo da Distribuição de Maxwell-Boltzmann de Velocidades e Energias.
 * 
 * Equações fundamentais:
 * f(v) = 4π * v² * (M / (2π * R * T))^(3/2) * exp(-M * v² / (2 * R * T))
 * f(E) = 2 * sqrt(E / π) * (1 / (R * T))^(3/2) * exp(-E / (R * T))
 */
public final class DistribuicaoMaxwellBoltzmann {
    private final ClasseGas gas;
    private final double temperaturaKelvin;

    private static final double LOG_MAX_VALUE = Math.log(Double.MAX_VALUE);
    private static final double LOG_MIN_VALUE = Math.log(Double.MIN_VALUE);

    private final double logNormalizacaoVelocidade;
    private final double escalaVelocidadeTermica;

    public DistribuicaoMaxwellBoltzmann(Gas gas, double temperaturaKelvin) {
        this(new ClasseGas(gas), temperaturaKelvin);
    }

    public DistribuicaoMaxwellBoltzmann(ClasseGas gas, double temperaturaKelvin) {
        if (gas == null) {
            throw new IllegalArgumentException("O gás não pode ser nulo");
        }
        this.gas = gas;
        this.temperaturaKelvin = ValidadorNumerico.validarPositivo(temperaturaKelvin, "Temperatura em Kelvin");

        double m = gas.getMassaMolarKgPorMol();
        double denominador = 2.0 * Math.PI * ConstantesFisicas.R * this.temperaturaKelvin;
        this.logNormalizacaoVelocidade = Math.log(4.0 * Math.PI)
                + 1.5 * (Math.log(m) - Math.log(denominador));
        this.escalaVelocidadeTermica = Math.sqrt(m / (2.0 * ConstantesFisicas.R * this.temperaturaKelvin));
    }

    /**
     * Calcula a densidade de probabilidade de velocidade f(v) em (s/m).
     * Usa escala logarítmica para evitar overflow/underflow numérico.
     */
    public double densidadeProbabilidadeVelocidade(double velocidadeMPorS) {
        ValidadorNumerico.validarNaoNegativo(velocidadeMPorS, "Velocidade");
        if (velocidadeMPorS == 0.0) {
            return 0.0;
        }

        double velocidadeEscalada = escalaVelocidadeTermica * velocidadeMPorS;
        double expoente = velocidadeEscalada * velocidadeEscalada;
        if (!Double.isFinite(expoente)) {
            return 0.0;
        }

        double logDensidade = logNormalizacaoVelocidade + 2.0 * Math.log(velocidadeMPorS) - expoente;
        if (logDensidade < LOG_MIN_VALUE) {
            return 0.0;
        }
        if (logDensidade > LOG_MAX_VALUE) {
            throw new ArithmeticException("Densidade f(v) excede o limite numérico de double");
        }
        return Math.exp(logDensidade);
    }

    /**
     * Calcula a densidade de probabilidade de energia cinética translacional f(E) em (J/mol)^-1.
     * f(E) = 2 * sqrt(E / π) * (1 / (RT))^(3/2) * exp(-E / RT)
     */
    public double densidadeProbabilidadeEnergia(double energiaJPorMol) {
        ValidadorNumerico.validarNaoNegativo(energiaJPorMol, "Energia cinética");
        if (energiaJPorMol == 0.0) {
            return 0.0;
        }

        double rt = ConstantesFisicas.R * temperaturaKelvin;
        double termo1 = 2.0 * Math.sqrt(energiaJPorMol / Math.PI);
        double termo2 = Math.pow(1.0 / rt, 1.5);
        double expoente = -energiaJPorMol / rt;

        return termo1 * termo2 * Math.exp(expoente);
    }

    // Velocidade mais provável: v_mp = sqrt(2 * R * T / M)
    public double velocidadeMaisProvavel() {
        return Math.sqrt((2.0 * ConstantesFisicas.R * temperaturaKelvin) / gas.getMassaMolarKgPorMol());
    }

    // Velocidade média: v_m = sqrt(8 * R * T / (π * M))
    public double velocidadeMedia() {
        return Math.sqrt((8.0 * ConstantesFisicas.R * temperaturaKelvin) / (Math.PI * gas.getMassaMolarKgPorMol()));
    }

    // Velocidade quadrática média: v_rms = sqrt(3 * R * T / M)
    public double velocidadeQuadraticaMedia() {
        return Math.sqrt((3.0 * ConstantesFisicas.R * temperaturaKelvin) / gas.getMassaMolarKgPorMol());
    }

    // Velocidade do som no gás: c = sqrt(γ * R * T / M)
    public double velocidadeDoSom() {
        return Math.sqrt((gas.getCoeficienteAdiabatico() * ConstantesFisicas.R * temperaturaKelvin) / gas.getMassaMolarKgPorMol());
    }

    public ClasseGas getGas() {
        return gas;
    }

    public double getTemperaturaKelvin() {
        return temperaturaKelvin;
    }
}
