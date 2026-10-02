package com.unit.numerical;

/**
 * Métodos de integração numérica disponíveis para dados amostrados.
 *
 * <p>Equivalem às funções do SciPy usadas no notebook:
 * {@code scipy.integrate.trapz} / {@code trapezoid} e
 * {@code scipy.integrate.simps} / {@code simpson}.</p>
 */
public enum IntegrationMethod {
    TRAPEZOID("Trapézio"),
    SIMPSON("Simpson");

    private final String displayName;

    IntegrationMethod(String displayName) {
        this.displayName = displayName;
    }

    public String displayName() {
        return displayName;
    }

    /**
     * Integra os pontos (x, y) com este método.
     *
     * @param x abscissas estritamente crescentes
     * @param y ordenadas, mesmo tamanho de x
     * @return integral aproximada de y dx
     */
    public double integrate(double[] x, double[] y) {
        return switch (this) {
            case TRAPEZOID -> NumericalIntegration.trapezoid(x, y);
            case SIMPSON -> NumericalIntegration.simpson(x, y);
        };
    }

    @Override
    public String toString() {
        return displayName;
    }
}
