package com.unit.model;

public final class FirstOrderReaction {
    private final double initialConcentration; // [A]₀ em mol/L
    private final double rateConstant;         // k em s⁻¹

    public FirstOrderReaction(double initialConcentration, double rateConstant) {
        if (initialConcentration < 0.0) {
            throw new IllegalArgumentException("Concentração inicial não pode ser negativa");
        }
        if (rateConstant < 0.0) {
            throw new IllegalArgumentException("Constante k não pode ser negativa");
        }
        this.initialConcentration = initialConcentration;
        this.rateConstant = rateConstant;
    }

    // [A](t) = [A]₀ * e^(-k * t)
    public double concentrationA(double time) {
        validateTime(time);
        return initialConcentration * Math.exp(-rateConstant * time);
    }

    // Por conservação de massa: [B](t) = [A]₀ - [A](t)
    public double concentrationB(double time) {
        validateTime(time);
        return initialConcentration - concentrationA(time);
    }

    // Tempo para [A] cair para 50%: t_1/2 = ln(2) / k
    public double halfLife() {
        return Math.log(2.0) / rateConstant;
    }

    // Tempo de decaimento e-fold (tau): tempo para [A] cair para 1/e (~36.8%): τ = 1 / k
    public double lifetime() {
        return 1.0 / rateConstant;
    }

    public double initialConcentration() {
        return initialConcentration;
    }

    public double rateConstant() {
        return rateConstant;
    }

    private static void validateTime(double time) {
        if (time < 0.0) {
            throw new IllegalArgumentException("Tempo não pode ser negativo");
        }
    }
}
