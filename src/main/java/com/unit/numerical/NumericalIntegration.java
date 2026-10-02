package com.unit.numerical;

import java.util.function.DoubleUnaryOperator;

/**
 * Integração numérica genérica de dados amostrados (x, y).
 *
 * <p>Não depende de nenhum modelo físico: serve para a distribuição de
 * Maxwell-Boltzmann, para a energia cinética, para o DSC ou para qualquer
 * outra curva. Os resultados reproduzem {@code scipy.integrate.trapezoid} e
 * {@code scipy.integrate.simpson} (SciPy ≥ 1.11), que substituíram
 * {@code trapz} e {@code simps} usados no notebook original.</p>
 */
public final class NumericalIntegration {
    private NumericalIntegration() {
    }

    /**
     * Regra do trapézio composta (aceita espaçamento não uniforme).
     *
     * <pre>  ∫ y dx ≈ Σ (x[i+1] − x[i]) · (y[i] + y[i+1]) / 2</pre>
     *
     * <p>Exata para retas. Erro proporcional a h² · f''.</p>
     *
     * @param x abscissas estritamente crescentes (pelo menos 2 pontos)
     * @param y ordenadas, mesmo tamanho de x
     * @return integral aproximada
     */
    public static double trapezoid(double[] x, double[] y) {
        validate(x, y, 2);
        double area = 0.0;
        for (int i = 1; i < x.length; i++) {
            area += (x[i] - x[i - 1]) * (y[i] + y[i - 1]) / 2.0;
        }
        return area;
    }

    /**
     * Regra de Simpson composta (1/3), com espaçamento possivelmente não uniforme.
     *
     * <p>Cada par de intervalos é integrado pela parábola que passa pelos três
     * pontos. Exata para polinômios de até 3º grau quando o número de intervalos
     * é par. Erro proporcional a h⁴ · f⁽⁴⁾.</p>
     *
     * <p>Quando o número de intervalos é ímpar (número de pontos par, como os
     * 2000 pontos de {@code np.arange(2000)} no notebook), o último intervalo é
     * tratado com a correção de Cartwright, a mesma do SciPy ≥ 1.11. Assim o
     * resultado coincide com {@code scipy.integrate.simpson} para a validação
     * Python × Java.</p>
     *
     * @param x abscissas estritamente crescentes (pelo menos 2 pontos)
     * @param y ordenadas, mesmo tamanho de x
     * @return integral aproximada
     */
    public static double simpson(double[] x, double[] y) {
        validate(x, y, 2);
        int points = x.length;
        if (points == 2) {
            // Com um único intervalo não há parábola: SciPy recai no trapézio.
            return trapezoid(x, y);
        }

        int intervals = points - 1;
        int lastEvenIndex = intervals % 2 == 0 ? points - 1 : points - 2;

        double area = 0.0;
        for (int i = 0; i + 2 <= lastEvenIndex; i += 2) {
            double h0 = x[i + 1] - x[i];
            double h1 = x[i + 2] - x[i + 1];
            double hSum = h0 + h1;
            area += hSum / 6.0 * (
                    y[i] * (2.0 - h1 / h0)
                    + y[i + 1] * hSum * hSum / (h0 * h1)
                    + y[i + 2] * (2.0 - h0 / h1));
        }

        if (intervals % 2 != 0) {
            // Correção de Cartwright para o último intervalo
            int n = points - 1;
            double h0 = x[n - 1] - x[n - 2];
            double h1 = x[n] - x[n - 1];
            double alpha = (2.0 * h1 * h1 + 3.0 * h0 * h1) / (6.0 * (h0 + h1));
            double beta = (h1 * h1 + 3.0 * h0 * h1) / (6.0 * h0);
            double eta = (h1 * h1 * h1) / (6.0 * h0 * (h0 + h1));
            area += alpha * y[n] + beta * y[n - 1] - eta * y[n - 2];
        }
        return area;
    }

    /**
     * Integra uma função f em [a, b] amostrando {@code intervals + 1} pontos igualmente espaçados.
     *
     * @param function função a integrar
     * @param a limite inferior
     * @param b limite superior (b &gt; a)
     * @param intervals número de subintervalos (≥ 1)
     * @param method trapézio ou Simpson
     * @return integral aproximada
     */
    public static double integrate(
            DoubleUnaryOperator function,
            double a,
            double b,
            int intervals,
            IntegrationMethod method) {
        if (function == null || method == null) {
            throw new IllegalArgumentException("Função e método não podem ser nulos");
        }
        if (!Double.isFinite(a) || !Double.isFinite(b) || b <= a) {
            throw new IllegalArgumentException("Limites devem ser finitos com b > a");
        }
        if (intervals < 1) {
            throw new IllegalArgumentException("Número de intervalos deve ser pelo menos 1");
        }

        double[] x = new double[intervals + 1];
        double[] y = new double[intervals + 1];
        double h = (b - a) / intervals;
        for (int i = 0; i <= intervals; i++) {
            x[i] = i == intervals ? b : a + i * h;
            y[i] = function.applyAsDouble(x[i]);
        }
        return method.integrate(x, y);
    }

    private static void validate(double[] x, double[] y, int minimumPoints) {
        if (x == null || y == null) {
            throw new IllegalArgumentException("Vetores x e y não podem ser nulos");
        }
        if (x.length != y.length) {
            throw new IllegalArgumentException("x e y devem ter o mesmo tamanho");
        }
        if (x.length < minimumPoints) {
            throw new IllegalArgumentException(
                    "São necessários pelo menos " + minimumPoints + " pontos");
        }
        for (int i = 0; i < x.length; i++) {
            if (!Double.isFinite(x[i]) || !Double.isFinite(y[i])) {
                throw new IllegalArgumentException("Valores de x e y devem ser finitos");
            }
            if (i > 0 && x[i] <= x[i - 1]) {
                throw new IllegalArgumentException("x deve ser estritamente crescente");
            }
        }
    }
}
