package com.unit.modelo;

import java.util.List;

public final class ConjuntoDadosDsc {
    private final String nomeAmostra;
    private final List<PontoDsc> pontos;

    public ConjuntoDadosDsc(String nomeAmostra, List<PontoDsc> pontos) {
        if (nomeAmostra == null || nomeAmostra.isBlank()) {
            throw new IllegalArgumentException("Nome da amostra não pode ser vazio");
        }
        if (pontos == null || pontos.size() < 2) {
            throw new IllegalArgumentException("Conjunto de dados DSC precisa de no mínimo 2 pontos");
        }
        this.nomeAmostra = nomeAmostra;
        this.pontos = List.copyOf(pontos);
    }

    public String getNomeAmostra() {
        return nomeAmostra;
    }

    public List<PontoDsc> getPontos() {
        return pontos;
    }

    public int quantidadePontos() {
        return pontos.size();
    }

    public PontoDsc primeiroPonto() {
        return pontos.get(0);
    }

    public PontoDsc ultimoPonto() {
        return pontos.get(pontos.size() - 1);
    }
}
