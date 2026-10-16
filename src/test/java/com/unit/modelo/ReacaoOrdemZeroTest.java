package com.unit.modelo;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ReacaoOrdemZeroTest {

    @Test
    @DisplayName("Deve calcular concentrações corretas e respeitar a trava física não-negativa")
    void testConcentracaoEVolucao() {
        ReacaoOrdemZero reacao = new ReacaoOrdemZero(1.0, 0.1);
        assertEquals(1.0, reacao.concentracaoA(0.0), 1e-6);
        assertEquals(0.0, reacao.concentracaoB(0.0), 1e-6);

        assertEquals(0.5, reacao.concentracaoA(5.0), 1e-6);
        assertEquals(0.5, reacao.concentracaoB(5.0), 1e-6);

        assertEquals(0.0, reacao.concentracaoA(10.0), 1e-6);
        assertEquals(1.0, reacao.concentracaoB(10.0), 1e-6);

        // Após tempo de consumo total, concentração de A permanece 0 (trava física)
        assertEquals(0.0, reacao.concentracaoA(15.0), 1e-6);
        assertEquals(1.0, reacao.concentracaoB(15.0), 1e-6);
    }

    @Test
    @DisplayName("Deve calcular 1ª, 2ª e 3ª meias-vidas corretamente")
    void testMeiasVidas() {
        ReacaoOrdemZero reacao = new ReacaoOrdemZero(1.0, 0.05);
        assertEquals(10.0, reacao.primeiraMeiaVida(), 1e-6);
        assertEquals(15.0, reacao.segundaMeiaVida(), 1e-6);
        assertEquals(17.5, reacao.terceiraMeiaVida(), 1e-6);
        assertEquals(20.0, reacao.tempoConsumoTotal(), 1e-6);
    }

    @Test
    @DisplayName("Deve rejeitar valores não finitos ou negativos")
    void testValidacoes() {
        assertThrows(IllegalArgumentException.class, () -> new ReacaoOrdemZero(-1.0, 0.1));
        assertThrows(IllegalArgumentException.class, () -> new ReacaoOrdemZero(Double.NaN, 0.1));
        assertThrows(IllegalArgumentException.class, () -> new ReacaoOrdemZero(1.0, Double.POSITIVE_INFINITY));
    }
}
