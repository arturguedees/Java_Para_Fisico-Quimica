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

    public double getCoeficienteAdiabatico() {
        return coeficienteAdiabatico;
    }

    public String getNome(){
        return nome;
    }

    public double getMassa(){
        return massa;
    }

}