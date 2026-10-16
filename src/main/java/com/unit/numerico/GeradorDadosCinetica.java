package com.unit.numerico;

import java.util.ArrayList;
import java.util.List;

import com.unit.modelo.ModeloCinetico;
import com.unit.modelo.PontoConcentracao;
import com.unit.util.ValidadorNumerico;

public final class GeradorDadosCinetica {
    private GeradorDadosCinetica() {}

    public static List<PontoConcentracao> gerarPontos(ModeloCinetico modelo, double tempoFinal, double passoTempo) {
        if (modelo == null) {
            throw new IllegalArgumentException("Modelo cinético não pode ser nulo");
        }
        ValidadorNumerico.validarPositivo(tempoFinal, "Tempo final");
        ValidadorNumerico.validarPositivo(passoTempo, "Passo de tempo");

        int quantidadePontos = (int) Math.ceil(tempoFinal / passoTempo) + 1;
        List<PontoConcentracao> pontos = new ArrayList<>(quantidadePontos);

        for (double t = 0.0; t <= tempoFinal + 1e-9; t += passoTempo) {
            double cA = modelo.concentracaoA(t);
            double cB = modelo.concentracaoB(t);
            pontos.add(new PontoConcentracao(t, cA, cB));
        }

        return List.copyOf(pontos);
    }
}
