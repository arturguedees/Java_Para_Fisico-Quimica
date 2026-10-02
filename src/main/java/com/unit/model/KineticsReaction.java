package com.unit.model;

/**
 * Contrato comum para reações elementares A → B com cinética integrada conhecida.
 *
 * <p>Permite que o gerador de dados, o gráfico e a interface tratem reações de
 * ordem zero e de primeira ordem da mesma forma. Tempo em segundos e
 * concentrações em mol/L; a unidade de k depende da ordem (ver {@link ReactionOrder}).</p>
 */
public interface KineticsReaction {

    /** Ordem cinética da reação. */
    ReactionOrder order();

    /** [A]₀ em mol/L. */
    double initialConcentration();

    /** Constante de velocidade k, na unidade de {@link ReactionOrder#rateConstantUnit()}. */
    double rateConstant();

    /** [A](t) em mol/L para t ≥ 0. */
    double concentrationA(double time);

    /** [B](t) em mol/L para t ≥ 0, por conservação de massa: [B] = [A]₀ − [A]. */
    double concentrationB(double time);

    /** Primeira meia-vida: tempo para [A] cair de [A]₀ para [A]₀/2. */
    double halfLife();

    /**
     * Instante em que [A] = [A]₀ / 2ⁿ, isto é, ao final da n-ésima meia-vida sucessiva.
     * Na primeira ordem os intervalos são iguais (n · t½); na ordem zero cada
     * meia-vida dura metade da anterior.
     *
     * @param n número de meias-vidas, n ≥ 1
     * @return tempo em segundos (infinito se k = 0)
     */
    double timeAtSuccessiveHalfLife(int n);
}
