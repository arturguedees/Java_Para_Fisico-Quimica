package com.unit.modelo;

import com.unit.util.ValidadorNumerico;

/**
 * Classe que representa uma Reacao de Ordem Zero (A -> B).
 * Na ordem zero a velocidade de consumo e constante (-d[A]/dt = k), nao importa quanto reagente tenha!
 * Por isso a equacao integrada vira uma reta: [A](t) = max(0, [A]0 - k * t).
 */
public final class ReacaoOrdemZero implements ModeloCinetico {
    private final double concentracaoInicial; // [A]0 em mol/L
    private final double constanteVelocidade;   // k em mol/(L * s)

    public ReacaoOrdemZero(double concentracaoInicial, double constanteVelocidade) {
        // Valido antes se os valores sao positivos pra nao ter concentracao ou constante k negativa
        this.concentracaoInicial = ValidadorNumerico.validarPositivo(concentracaoInicial, "Concentração inicial [A]0");
        this.constanteVelocidade = ValidadorNumerico.validarPositivo(constanteVelocidade, "Constante de velocidade k");
    }

    @Override
    public double concentracaoA(double tempo) {
        ValidadorNumerico.validarNaoNegativo(tempo, "Tempo");
        double restante = concentracaoInicial - (constanteVelocidade * tempo);
        // Coloquei Math.max com 0.0 pq fisicamente a concentracao nao pode ficar negativa depois que acaba o reagente!
        return Math.max(0.0, restante);
    }

    @Override
    public double concentracaoB(double tempo) {
        // Pela estequiometria 1:1 (A -> B), tudo que sumiu de A virou produto B
        return concentracaoInicial - concentracaoA(tempo);
    }

    // 1a meia-vida: tempo pra concentracao [A] cair pela metade (50% de [A]0)
    @Override
    public double primeiraMeiaVida() {
        return concentracaoInicial / (2.0 * constanteVelocidade);
    }

    // 2a meia-vida acumulada: tempo pra sobrar so 25% do reagente inicial
    public double segundaMeiaVida() {
        return (3.0 * concentracaoInicial) / (4.0 * constanteVelocidade);
    }

    // 3a meia-vida acumulada: tempo pra cair pra 12.5% de [A]0
    public double terceiraMeiaVida() {
        return (7.0 * concentracaoInicial) / (8.0 * constanteVelocidade);
    }

    // Tempo total ate o reagente zerar completamente (so existe em ordem zero pq na 1a ordem e assintotico!)
    public double tempoConsumoTotal() {
        return concentracaoInicial / constanteVelocidade;
    }

    @Override
    public double concentracaoInicial() {
        return concentracaoInicial;
    }

    @Override
    public double constanteVelocidade() {
        return constanteVelocidade;
    }

    @Override
    public int obterOrdem() {
        return 0;
    }
}
