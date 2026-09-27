package com.unit.model;

public class ClasseGas{
    private String nome;
    private double massa;
    private double coeficienteAdiabatico;

    public ClasseGas(String nome, double massa, double coeficienteAdiabatico) {
        this.nome = nome;
        this.massa = massa;
        this.coeficienteAdiabatico = coeficienteAdiabatico;
    }

    /**
     * Construtor de conveniência a partir do enum Gas.
     * Define o coeficiente adiabático padrão (1.67 para monoatômicos, 1.40 para diatômicos).
     */
    public ClasseGas(Gas gas) {
        this(gas.displayName(), gas.molarMassKgPerMol(), gas == Gas.ARGON || gas == Gas.HELIUM ? 1.67 : 1.40);
    }

    public ClasseGas(Gas gas, double coeficienteAdiabatico) {
        this(gas.displayName(), gas.molarMassKgPerMol(), coeficienteAdiabatico);
    }

    public double getCoeficienteAdiabatico() {
        return coeficienteAdiabatico;
    }

    public String getNome(){
        return nome;
    }

    public double getMassa(){
        return massa;
    }

    @Override
    public String toString() {
        return String.format("Gás: %s (M = %.5f kg/mol, γ = %.2f)", nome, massa, coeficienteAdiabatico);
    }
}