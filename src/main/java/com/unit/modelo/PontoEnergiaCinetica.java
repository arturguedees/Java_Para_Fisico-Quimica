package com.unit.modelo;

public record PontoEnergiaCinetica(double energiaJPorMol, double densidadeProbabilidade) {
    public PontoEnergiaCinetica {
        if (energiaJPorMol < 0.0) {
            throw new IllegalArgumentException("Energia cinética não pode ser negativa");
        }
        if (densidadeProbabilidade < 0.0) {
            throw new IllegalArgumentException("Densidade de probabilidade de energia não pode ser negativa");
        }
    }
}
