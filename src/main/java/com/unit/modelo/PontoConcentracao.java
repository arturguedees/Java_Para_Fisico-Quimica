package com.unit.modelo;

public record PontoConcentracao(double tempo, double concentracaoA, double concentracaoB) {
    public PontoConcentracao {
        if (tempo < 0.0) {
            throw new IllegalArgumentException("O tempo não pode ser negativo");
        }
    }
}
