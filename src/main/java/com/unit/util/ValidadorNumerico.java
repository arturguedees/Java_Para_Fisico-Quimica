package com.unit.util;

public final class ValidadorNumerico {
    private ValidadorNumerico() {}

    public static double validarPositivo(double valor, String nomeCampo) {
        if (!Double.isFinite(valor) || valor <= 0.0) {
            throw new IllegalArgumentException(nomeCampo + " deve ser um número finito e estritamente positivo (> 0). Valor recebido: " + valor);
        }
        return valor;
    }

    public static double validarNaoNegativo(double valor, String nomeCampo) {
        if (!Double.isFinite(valor) || valor < 0.0) {
            throw new IllegalArgumentException(nomeCampo + " deve ser um número finito e não-negativo (>= 0). Valor recebido: " + valor);
        }
        return valor;
    }

    public static void validarIntervalo(double inicio, double fim, String nomeInicio, String nomeFim) {
        validarNaoNegativo(inicio, nomeInicio);
        validarNaoNegativo(fim, nomeFim);
        if (fim <= inicio) {
            throw new IllegalArgumentException(nomeFim + " deve ser estritamente maior que " + nomeInicio);
        }
    }
}
