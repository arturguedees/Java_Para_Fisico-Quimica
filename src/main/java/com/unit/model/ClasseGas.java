package com.unit.model;

public class ClasseGas {
    private String nome;
    // IMPORTANTE: A massa molar DEVE estar em kg/mol (ex: 0.03995 para Argônio)
    // para que as fórmulas de velocidade resultem na unidade correta do SI (m/s).
    private double massa;
    private double coeficienteAdiabatico; // γ (Cp / Cv)

    public ClasseGas(String nome, double massa, double coeficienteAdiabatico) {
        this.nome = nome;
        this.massa = massa;
        this.coeficienteAdiabatico = coeficienteAdiabatico;
    }

    // Construtor auxiliar para compatibilidade com o enum Gas
    public ClasseGas(Gas gas) {
        this(gas.displayName(), gas.molarMassKgPerMol(), gas == Gas.ARGON || gas == Gas.HELIUM ? 1.67 : 1.40);
    }

    public ClasseGas(Gas gas, double coeficienteAdiabatico) {
        this(gas.displayName(), gas.molarMassKgPerMol(), coeficienteAdiabatico);
    }

    public double getCoeficienteAdiabatico() {
        return coeficienteAdiabatico;
    }

    public String getNome() {
        return nome;
    }

    public double getMassa() {
        return massa;
    }

    @Override
    public String toString() {
        return String.format("Gás: %s (M = %.5f kg/mol, γ = %.2f)", nome, massa, coeficienteAdiabatico);
    }
}