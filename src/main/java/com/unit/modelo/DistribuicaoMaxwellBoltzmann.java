package com.unit.modelo;

import com.unit.util.ConstantesFisicas;
import com.unit.util.ValidadorNumerico;

/**
 * Classe principal da Distribuicao de Maxwell-Boltzmann para velocidade f(v) e energia f(E).
 * Dica que aprendi fazendo os testes: calculei a normalizacao de f(v) usando logaritmo (Math.log)
 * antes de tirar a exponencial (Math.exp) pra evitar dar overflow/underflow no double do Java!
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

        // Pre-calculo essas constantes no construtor pra nao ter que recalcular toda vez no loop do grafico
        double m = gas.getMassaMolarKgPorMol();
        double denominador = 2.0 * Math.PI * ConstantesFisicas.R * this.temperaturaKelvin;
        this.logNormalizacaoVelocidade = Math.log(4.0 * Math.PI)
                + 1.5 * (Math.log(m) - Math.log(denominador));
        this.escalaVelocidadeTermica = Math.sqrt(m / (2.0 * ConstantesFisicas.R * this.temperaturaKelvin));
    }

    /**
     * Calcula a densidade de probabilidade f(v) em (s/m) para uma dada velocidade em m/s.
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
     * Calcula a distribuicao de energia cinetica translacional f(E) em (J/mol)^-1.
     * Curiosidade da fisica: pelo teorema da equiparticao, f(E) so depende de T (nao depende da massa molar M!).
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

    // Velocidade no topo da curva (pico): v_mp = sqrt(2 * R * T / M)
    public double velocidadeMaisProvavel() {
        return Math.sqrt((2.0 * ConstantesFisicas.R * temperaturaKelvin) / gas.getMassaMolarKgPorMol());
    }

    // Velocidade media aritmetica: v_m = sqrt(8 * R * T / (pi * M))
    public double velocidadeMedia() {
        return Math.sqrt((8.0 * ConstantesFisicas.R * temperaturaKelvin) / (Math.PI * gas.getMassaMolarKgPorMol()));
    }

    // Velocidade quadratica media: v_rms = sqrt(3 * R * T / M)
    public double velocidadeQuadraticaMedia() {
        return Math.sqrt((3.0 * ConstantesFisicas.R * temperaturaKelvin) / gas.getMassaMolarKgPorMol());
    }

    // Velocidade de propagacao do som no gas ideal: c = sqrt(gama * R * T / M)
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
