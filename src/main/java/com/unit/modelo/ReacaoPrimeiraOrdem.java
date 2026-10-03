package com.unit.modelo;

import com.unit.util.ValidadorNumerico;

/**
 * Cinética de Primeira Ordem: A -> B
 * Taxa de reação: -d[A]/dt = k * [A]
 * Equação integrada: [A](t) = [A]0 * exp(-k * t)
 * [B](t) = [A]0 * (1 - exp(-k * t))
 */
public final class ReacaoPrimeiraOrdem implements ModeloCinetico {
    private final double concentracaoInicial; // [A]0 em mol/L
    private final double constanteVelocidade;   // k em s^-1

    public ReacaoPrimeiraOrdem(double concentracaoInicial, double constanteVelocidade) {
        this.concentracaoInicial = ValidadorNumerico.validarPositivo(concentracaoInicial, "Concentração inicial [A]0");
        this.constanteVelocidade = ValidadorNumerico.validarPositivo(constanteVelocidade, "Constante de velocidade k");
    }

    @Override
    public double concentracaoA(double tempo) {
        ValidadorNumerico.validarNaoNegativo(tempo, "Tempo");
        return concentracaoInicial * Math.exp(-constanteVelocidade * tempo);
    }

    @Override
    public double concentracaoB(double tempo) {
        ValidadorNumerico.validarNaoNegativo(tempo, "Tempo");
        return concentracaoInicial * (1.0 - Math.exp(-constanteVelocidade * tempo));
    }

    // Tempo de Meia-Vida: t_1/2 = ln(2) / k (tempo para [A] cair para 50%)
    @Override
    public double primeiraMeiaVida() {
        return Math.log(2.0) / constanteVelocidade;
    }

    // Tempo de vida químico / e-folding (tau): tau = 1 / k (tempo para [A] cair para 1/e ~ 36.8%)
    public double tempoVidaQuimico() {
        return 1.0 / constanteVelocidade;
    }

    // n-ésimo e-fold: tempo para [A] atingir exp(-n)
    public double tempoEFold(int n) {
        if (n <= 0) {
            throw new IllegalArgumentException("O multiplicador n do e-fold deve ser maior que zero");
        }
        return (double) n / constanteVelocidade;
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
        return 1;
    }
}
