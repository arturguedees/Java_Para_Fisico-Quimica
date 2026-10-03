package com.unit.numerico;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.unit.modelo.ClasseGas;
import com.unit.modelo.Gas;

class CalculadoraMaxwellTest {

    private CalculadoraMaxwell calculadora;
    private ClasseGas argonio;
    private final double temperatura = 298.15; // 25°C em Kelvin

    @BeforeEach
    void setUp() {
        calculadora = new CalculadoraMaxwell();
        argonio = new ClasseGas(Gas.ARGONIO);
    }

    @Test
    @DisplayName("Deve calcular velocidades e velocidade do som com precisão")
    void testCalculosCompletos() {
        double vMp = calculadora.calcularVelocidadeMaisProvavel(argonio, temperatura);
        double vMedia = calculadora.calcularVelocidadeMedia(argonio, temperatura);
        double vRms = calculadora.calcularVelocidadeQuadraticaMedia(argonio, temperatura);
        double vSom = calculadora.calcularVelocidadeDoSom(argonio, temperatura);

        assertEquals(352.4, vMp, 1.0);
        assertEquals(397.7, vMedia, 1.0);
        assertEquals(431.6, vRms, 1.0);
        assertEquals(321.7, vSom, 2.0);
    }

    @Test
    @DisplayName("Deve calcular fração com Energia >= Ea")
    void testEnergiaAtivacao() {
        double fracao = calculadora.calcularFracaoEnergiaAtivacao(argonio, temperatura, 20_000.0);
        assertTrue(fracao >= 0.0 && fracao <= 1.0, "A fração deve ser uma probabilidade válida entre 0 e 1");
    }
}
