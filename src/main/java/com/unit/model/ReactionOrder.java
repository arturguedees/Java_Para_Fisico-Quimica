package com.unit.model;

/** Ordens cinéticas suportadas pelo módulo de cinética química. */
public enum ReactionOrder {
    ZERO("Ordem zero", "mol·L⁻¹·s⁻¹", "[A](t) = [A]₀ − k·t"),
    FIRST("Primeira ordem", "s⁻¹", "[A](t) = [A]₀·e^(−k·t)");

    private final String displayName;
    private final String rateConstantUnit;
    private final String integratedRateLaw;

    ReactionOrder(String displayName, String rateConstantUnit, String integratedRateLaw) {
        this.displayName = displayName;
        this.rateConstantUnit = rateConstantUnit;
        this.integratedRateLaw = integratedRateLaw;
    }

    public String displayName() {
        return displayName;
    }

    /** Unidade de k: na ordem zero k tem unidade de velocidade (mol·L⁻¹·s⁻¹). */
    public String rateConstantUnit() {
        return rateConstantUnit;
    }

    public String integratedRateLaw() {
        return integratedRateLaw;
    }

    /** Cria o modelo correspondente a esta ordem. */
    public KineticsReaction createReaction(double initialConcentration, double rateConstant) {
        return switch (this) {
            case ZERO -> new ZeroOrderReaction(initialConcentration, rateConstant);
            case FIRST -> new FirstOrderReaction(initialConcentration, rateConstant);
        };
    }

    @Override
    public String toString() {
        return displayName;
    }
}
