package com.unit.modelo;

import com.unit.util.ValidadorNumerico;

/**
 * Classe que implementa a Cinetica de Primeira Ordem (A -> B).
 * Aqui a taxa depende de quanto reagente ainda resta (-d[A]/dt = k * [A]),
 * gerando aquele decaimento exponencial classico: [A](t) = [A]0 * e^(-k * t).
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

    // Na 1a ordem a meia-vida nao depende de [A]0! Vale sempre ln(2) / k (~0.693 / k)
    @Override
    public double primeiraMeiaVida() {
        return Math.log(2.0) / constanteVelocidade;
    }

    // Tempo de vida quimico (e-folding time tau do artigo da ACS): tempo pra cair pra 1/e (~36.8%)
    public double tempoVidaQuimico() {
        return 1.0 / constanteVelocidade;
    }

    // Calcula o tempo para atingir n decaimentos exponenciais (e^-n)
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
