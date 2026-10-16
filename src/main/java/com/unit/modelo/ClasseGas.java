package com.unit.modelo;

import com.unit.util.ValidadorNumerico;

public class ClasseGas {
    private String nome;
    private String simbolo;
    // IMPORTANTE: A massa molar DEVE estar em kg/mol (ex: 0.03995 para Argônio)
    // para que as fórmulas de velocidade resultem na unidade do SI (m/s).
    private double massaMolarKgPorMol;
    private double coeficienteAdiabatico; // γ = Cp / Cv

    public ClasseGas(String nome, double massaMolarKgPorMol, double coeficienteAdiabatico) {
        this(nome, nome, massaMolarKgPorMol, coeficienteAdiabatico);
    }

    public ClasseGas(String nome, String simbolo, double massaMolarKgPorMol, double coeficienteAdiabatico) {
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("O nome do gás não pode ser vazio");
        }
        this.nome = nome.trim();
        this.simbolo = (simbolo == null || simbolo.isBlank()) ? this.nome : simbolo.trim();
        this.massaMolarKgPorMol = ValidadorNumerico.validarPositivo(massaMolarKgPorMol, "Massa molar");
        this.coeficienteAdiabatico = ValidadorNumerico.validarPositivo(coeficienteAdiabatico, "Coeficiente adiabático (γ)");
    }

    public ClasseGas(Gas gas) {
        this(gas.nomeFormatado(), gas.simbolo(), gas.massaMolarKgPorMol(), gas.coeficienteAdiabatico());
    }

    public String getNome() {
        return nome;
    }

    public String getSimbolo() {
        return simbolo;
    }

    public double getMassa() {
        return massaMolarKgPorMol;
    }

    public double getMassaMolarKgPorMol() {
        return massaMolarKgPorMol;
    }

    public double getCoeficienteAdiabatico() {
        return coeficienteAdiabatico;
    }

    @Override
    public String toString() {
        return String.format("%s (%s) - M: %.5f kg/mol, γ: %.2f", nome, simbolo, massaMolarKgPorMol, coeficienteAdiabatico);
    }
}
