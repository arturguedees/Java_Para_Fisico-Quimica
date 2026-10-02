package com.unit.numerical;

import java.util.List;

import com.unit.model.MaxwellBoltzmannDistribution;
import com.unit.model.MaxwellBoltzmannPoint;

/**
 * Integrais da distribuição de velocidades de Maxwell-Boltzmann.
 *
 * <p>Normalização: como f(v) é uma densidade de probabilidade (unidade s/m),
 * a área total ∫₀^∞ f(v) dv deve ser 1, isto é, 100 % das moléculas têm
 * alguma velocidade entre 0 e infinito.</p>
 *
 * <p>NOTA DE AUDITORIA (Maxwell_Boltzmann_Distribution_Notebook.ipynb, seção 3):
 * o notebook escreve o texto fixo "Area under curve = 1" no gráfico, mas nunca
 * calcula a área total. Com a malha {@code np.arange(2000)} (0 a 1999 m/s) e CH₄,
 * a área calculada é ≈ 1 a 25 K, mas cai para ≈ 0,94 a 1025 K e ≈ 0,74 a 1925 K,
 * porque a cauda da distribuição passa de 2000 m/s e é cortada. Aqui a área
 * normalizada é integrada até {@value #FULL_RANGE_FACTOR}·v_mp, onde a cauda
 * restante é desprezível (f ∝ v²·e^(−(v/v_mp)²), e e^(−100) ≈ 4·10⁻⁴⁴).</p>
 */
public final class MaxwellBoltzmannIntegration {
    /** Limite superior da integral "completa", em múltiplos de v_mp. */
    public static final double FULL_RANGE_FACTOR = 10.0;

    /** Passo de velocidade usado pelo notebook ({@code np.arange}, passo 1 m/s). */
    public static final double NOTEBOOK_SPEED_STEP = 1.0;

    private MaxwellBoltzmannIntegration() {
    }

    /**
     * Área sob f(v) amostrada em [startSpeed, endSpeedExclusive) com passo fixo,
     * como {@code np.arange(start, end, step)} no notebook.
     *
     * @param distribution distribuição a integrar
     * @param startSpeed velocidade inicial em m/s
     * @param endSpeedExclusive velocidade final (exclusiva) em m/s
     * @param speedStep passo em m/s
     * @param method trapézio ou Simpson
     * @return área (adimensional: fração de moléculas no intervalo amostrado)
     */
    public static double area(
            MaxwellBoltzmannDistribution distribution,
            double startSpeed,
            double endSpeedExclusive,
            double speedStep,
            IntegrationMethod method) {
        if (method == null) {
            throw new IllegalArgumentException("Método de integração não pode ser nulo");
        }
        List<MaxwellBoltzmannPoint> points = MaxwellBoltzmannDataGenerator.generate(
                distribution, startSpeed, endSpeedExclusive, speedStep);
        if (points.size() < 2) {
            throw new IllegalArgumentException("O intervalo precisa gerar pelo menos dois pontos");
        }

        double[] speeds = new double[points.size()];
        double[] densities = new double[points.size()];
        for (int i = 0; i < points.size(); i++) {
            speeds[i] = points.get(i).speedMetersPerSecond();
            densities[i] = points.get(i).probabilityDensity();
        }
        return method.integrate(speeds, densities);
    }

    /**
     * Velocidade até onde a integral é considerada completa: {@value #FULL_RANGE_FACTOR}·v_mp.
     */
    public static double fullRangeUpperSpeed(MaxwellBoltzmannDistribution distribution) {
        if (distribution == null) {
            throw new IllegalArgumentException("Distribution must not be null");
        }
        return FULL_RANGE_FACTOR * distribution.mostProbableSpeed();
    }

    /**
     * Área total sob f(v), de 0 até {@value #FULL_RANGE_FACTOR}·v_mp. Deve ser ≈ 1.
     *
     * @param distribution distribuição a integrar
     * @param speedStep passo em m/s (o notebook usa 1 m/s)
     * @param method trapézio ou Simpson
     * @return área total, ≈ 1 para uma distribuição normalizada
     */
    public static double normalizationArea(
            MaxwellBoltzmannDistribution distribution,
            double speedStep,
            IntegrationMethod method) {
        double upperSpeed = fullRangeUpperSpeed(distribution);
        // +passo para incluir o ponto final, já que o intervalo é aberto à direita
        return area(distribution, 0.0, upperSpeed + speedStep, speedStep, method);
    }

    /**
     * Mesma área com a malha fixa do notebook: 0 a 1999 m/s, passo 1 m/s.
     * Usada para reproduzir e comparar os valores do Python.
     */
    public static double notebookGridArea(
            MaxwellBoltzmannDistribution distribution,
            IntegrationMethod method) {
        return area(distribution, 0.0, 2000.0, NOTEBOOK_SPEED_STEP, method);
    }
}
