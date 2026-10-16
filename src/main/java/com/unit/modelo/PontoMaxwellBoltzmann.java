package com.unit.modelo;

public record PontoMaxwellBoltzmann(double velocidade, double densidadeProbabilidade) {
    public PontoMaxwellBoltzmann {
        if (velocidade < 0.0) {
            throw new IllegalArgumentException("Velocidade não pode ser negativa");
        }
        if (densidadeProbabilidade < 0.0) {
            throw new IllegalArgumentException("Densidade de probabilidade não pode ser negativa");
        }
    }
}
