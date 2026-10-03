package com.unit.numerico;

import java.util.ArrayList;
import java.util.List;

import com.unit.modelo.DistribuicaoMaxwellBoltzmann;
import com.unit.modelo.PontoEnergiaCinetica;
import com.unit.modelo.PontoMaxwellBoltzmann;
import com.unit.util.ValidadorNumerico;

public final class GeradorDadosMaxwell {
    private GeradorDadosMaxwell() {}

    public static List<PontoMaxwellBoltzmann> gerarPontosVelocidade(
            DistribuicaoMaxwellBoltzmann dist, double vInicial, double vFinal, double passo) {
        if (dist == null) {
            throw new IllegalArgumentException("Distribuição não pode ser nula");
        }
        ValidadorNumerico.validarIntervalo(vInicial, vFinal, "Velocidade inicial", "Velocidade final");
        ValidadorNumerico.validarPositivo(passo, "Passo de velocidade");

        int n = (int) Math.ceil((vFinal - vInicial) / passo) + 1;
        List<PontoMaxwellBoltzmann> pontos = new ArrayList<>(n);

        for (double v = vInicial; v <= vFinal + 1e-9; v += passo) {
            pontos.add(new PontoMaxwellBoltzmann(v, dist.densidadeProbabilidadeVelocidade(v)));
        }

        return List.copyOf(pontos);
    }

    public static List<PontoEnergiaCinetica> gerarPontosEnergia(
            DistribuicaoMaxwellBoltzmann dist, double eInicial, double eFinal, double passo) {
        if (dist == null) {
            throw new IllegalArgumentException("Distribuição não pode ser nula");
        }
        ValidadorNumerico.validarIntervalo(eInicial, eFinal, "Energia inicial", "Energia final");
        ValidadorNumerico.validarPositivo(passo, "Passo de energia");

        int n = (int) Math.ceil((eFinal - eInicial) / passo) + 1;
        List<PontoEnergiaCinetica> pontos = new ArrayList<>(n);

        for (double e = eInicial; e <= eFinal + 1e-9; e += passo) {
            pontos.add(new PontoEnergiaCinetica(e, dist.densidadeProbabilidadeEnergia(e)));
        }

        return List.copyOf(pontos);
    }
}
