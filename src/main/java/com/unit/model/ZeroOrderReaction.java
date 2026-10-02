package com.unit.model;

/**
 * Reação de ordem zero A → B: a velocidade não depende da concentração.
 *
 * <pre>
 *   −d[A]/dt = d[B]/dt = k
 *   [A](t) = [A]₀ − k·t        para t &lt; t_esgot = [A]₀ / k
 *   [A](t) = 0                 para t ≥ t_esgot
 *   [B](t) = [A]₀ − [A](t)
 *   t½     = [A]₀ / (2k)
 * </pre>
 *
 * <p>NOTA DE AUDITORIA (Kinetics_Notebook.ipynb, Exercício 2):</p>
 * <ul>
 *   <li>O notebook calcula {@code A_0 - t*k} sem limite inferior. Para t &gt; [A]₀/k a
 *   concentração fica negativa, o que não tem significado físico; o gráfico só
 *   esconde isso com {@code plt.ylim(0, 1.1)}. Aqui [A] é limitada a zero: o
 *   reagente se esgota e a reação para.</li>
 *   <li>O notebook escreve {@code B = A_0 - (1 - t*k)}, que só coincide com o
 *   correto ([B] = k·t) porque usa [A]₀ = 1. Aqui [B] = [A]₀ − [A], válido para
 *   qualquer [A]₀.</li>
 * </ul>
 *
 * <p>Unidades: [A]₀ em mol/L, k em mol·L⁻¹·s⁻¹, t em s.</p>
 */
public final class ZeroOrderReaction implements KineticsReaction {
    private final double initialConcentration;
    private final double rateConstant;

    public ZeroOrderReaction(double initialConcentration, double rateConstant) {
        if (!Double.isFinite(initialConcentration) || initialConcentration < 0.0) {
            throw new IllegalArgumentException("Concentração inicial deve ser finita e não negativa");
        }
        if (!Double.isFinite(rateConstant) || rateConstant < 0.0) {
            throw new IllegalArgumentException("Constante k deve ser finita e não negativa");
        }
        this.initialConcentration = initialConcentration;
        this.rateConstant = rateConstant;
    }

    @Override
    public ReactionOrder order() {
        return ReactionOrder.ZERO;
    }

    /** [A](t) = max(0, [A]₀ − k·t). */
    @Override
    public double concentrationA(double time) {
        validateTime(time);
        return Math.max(0.0, initialConcentration - rateConstant * time);
    }

    /** [B](t) = [A]₀ − [A](t); atinge [A]₀ quando o reagente se esgota. */
    @Override
    public double concentrationB(double time) {
        return initialConcentration - concentrationA(time);
    }

    /** t½ = [A]₀ / (2k). Depende de [A]₀, ao contrário da primeira ordem. */
    @Override
    public double halfLife() {
        return initialConcentration / (2.0 * rateConstant);
    }

    /**
     * Tempo em que [A] = [A]₀/2ⁿ: t = ([A]₀/k)·(1 − 2⁻ⁿ).
     * Ex.: 1 meia-vida → t½; 2 → 1,5·t½; 3 → 1,75·t½.
     */
    @Override
    public double timeAtSuccessiveHalfLife(int n) {
        if (n < 1) {
            throw new IllegalArgumentException("Número de meias-vidas deve ser pelo menos 1");
        }
        return completionTime() * (1.0 - Math.pow(2.0, -n));
    }

    /** Tempo para o reagente se esgotar: t = [A]₀ / k. */
    public double completionTime() {
        return initialConcentration / rateConstant;
    }

    @Override
    public double initialConcentration() {
        return initialConcentration;
    }

    @Override
    public double rateConstant() {
        return rateConstant;
    }

    private static void validateTime(double time) {
        if (!Double.isFinite(time) || time < 0.0) {
            throw new IllegalArgumentException("Tempo deve ser finito e não negativo");
        }
    }
}
