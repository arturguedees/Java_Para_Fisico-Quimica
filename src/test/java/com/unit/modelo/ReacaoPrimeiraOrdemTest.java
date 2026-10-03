package com.unit.modelo;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ReacaoPrimeiraOrdemTest {

    @Test
    @DisplayName("Deve calcular concentrações exponenciais e meias-vidas de 1ª ordem")
    void testConcentracaoEValores() {
        ReacaoPrimeiraOrdem reacao = new ReacaoPrimeiraOrdem(1.0, 0.08);
        assertEquals(1.0, reacao.concentracaoA(0.0), 1e-6);
        assertEquals(0.0, reacao.concentracaoB(0.0), 1e-6);

        // t1/2 = ln(2) / 0.08 = 8.6643 s
        assertEquals(Math.log(2.0) / 0.08, reacao.primeiraMeiaVida(), 1e-6);
        assertEquals(1.0 / 0.08, reacao.tempoVidaQuimico(), 1e-6);

        // No instante t1/2, [A] deve ser 0.5
        assertEquals(0.5, reacao.concentracaoA(reacao.primeiraMeiaVida()), 1e-6);
        assertEquals(0.5, reacao.concentracaoB(reacao.primeiraMeiaVida()), 1e-6);

        // No instante tau (e-fold), [A] deve ser 1/e
        assertEquals(1.0 / Math.E, reacao.concentracaoA(reacao.tempoVidaQuimico()), 1e-6);
    }

    @Test
    @DisplayName("Deve rejeitar entradas inválidas")
    void testValidacoes() {
        assertThrows(IllegalArgumentException.class, () -> new ReacaoPrimeiraOrdem(0.0, 0.08));
        assertThrows(IllegalArgumentException.class, () -> new ReacaoPrimeiraOrdem(1.0, -0.05));
        assertThrows(IllegalArgumentException.class, () -> new ReacaoPrimeiraOrdem(Double.NaN, 0.08));
    }
}
