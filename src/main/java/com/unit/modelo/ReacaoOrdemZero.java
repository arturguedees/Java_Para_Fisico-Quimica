package com.unit.modelo;

import com.unit.util.ValidadorNumerico;

/**
 * Cinética de Ordem Zero: A -> B
 * Taxa de reação: -d[A]/dt = k
 * Equação integrada: [A](t) = max(0, [A]0 - k * t)
 * [B](t) = [A]0 - [A](t)
 */
public final class ReacaoOrdemZero implements ModeloCinetico {
    private final double concentracaoInicial; // [A]0 em mol/L
    private final double constanteVelocidade;   // k em mol/(L * s)

    public ReacaoOrdemZero(double concentracaoInicial, double constanteVelocidade) {
        this.concentracaoInicial = ValidadorNumerico.validarPositivo(concentracaoInicial, "Concentração inicial [A]0");
        this.constanteVelocidade = ValidadorNumerico.validarPositivo(constanteVelocidade, "Constante de velocidade k");
    }

    @Override
    public double concentracaoA(double tempo) {
        ValidadorNumerico.validarNaoNegativo(tempo, "Tempo");
        double restante = concentracaoInicial - (constanteVelocidade * tempo);
        return Math.max(0.0, restante); // trava física: concentração não fica negativa
    }

    @Override
    public double concentracaoB(double tempo) {
        return concentracaoInicial - concentracaoA(tempo);
    }

    // 1ª meia-vida: tempo pra concentração [A] cair para 50% de [A]0
    @Override
    public double primeiraMeiaVida() {
        return concentracaoInicial / (2.0 * constanteVelocidade);
    }

    // 2ª meia-vida acumulada: tempo pra concentração [A] cair para 25% de [A]0
    public double segundaMeiaVida() {
        return (3.0 * concentracaoInicial) / (4.0 * constanteVelocidade);
    }

    // 3ª meia-vida acumulada: tempo para [A] cair para 12.5% de [A]0
    public double terceiraMeiaVida() {
        return (7.0 * concentracaoInicial) / (8.0 * constanteVelocidade);
    }

    // Tempo total até o reagente se esgotar completamente (100% convertido)
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
