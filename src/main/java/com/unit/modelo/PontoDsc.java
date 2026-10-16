package com.unit.modelo;

public record PontoDsc(double temperaturaCelsius, double capacidadeCalorificaExcesso) {
    public PontoDsc {
        if (!Double.isFinite(temperaturaCelsius)) {
            throw new IllegalArgumentException("A temperatura deve ser finita");
        }
        if (!Double.isFinite(capacidadeCalorificaExcesso)) {
            throw new IllegalArgumentException("A capacidade calorífica deve ser finita");
        }
    }
}
