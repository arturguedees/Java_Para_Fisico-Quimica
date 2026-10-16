package com.unit.modelo;

public enum Gas {
    ARGONIO("Ar", "Argônio", 0.039948, 1.67),
    OXIGENIO("O₂", "Oxigênio", 0.031998, 1.40),
    HELIO("He", "Hélio", 0.004002602, 1.67),
    HIDROGENIO("H₂", "Hidrogênio", 0.00201588, 1.40),
    NITROGENIO("N₂", "Nitrogênio", 0.0280134, 1.40);

    private final String simbolo;
    private final String nome;
    private final double massaMolarKgPorMol;
    private final double coeficienteAdiabatico;

    Gas(String simbolo, String nome, double massaMolarKgPorMol, double coeficienteAdiabatico) {
        this.simbolo = simbolo;
        this.nome = nome;
        this.massaMolarKgPorMol = massaMolarKgPorMol;
        this.coeficienteAdiabatico = coeficienteAdiabatico;
    }

    public String simbolo() {
        return simbolo;
    }

    public String nomeFormatado() {
        return nome;
    }

    public double massaMolarKgPorMol() {
        return massaMolarKgPorMol;
    }

    public double coeficienteAdiabatico() {
        return coeficienteAdiabatico;
    }
}
