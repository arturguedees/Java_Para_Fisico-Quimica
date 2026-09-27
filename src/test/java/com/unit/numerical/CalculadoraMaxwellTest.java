package com.unit.numerical;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.unit.model.ClasseGas;
import com.unit.model.Gas;

class CalculadoraMaxwellTest {

    private CalculadoraMaxwell calculadora;
    private ClasseGas argonio;
    private final double temperatura = 298.15; // 25°C em Kelvin

    @BeforeEach
    void setUp() {
        calculadora = new CalculadoraMaxwell();
        argonio = new ClasseGas("Argônio", 0.039948, 1.67);
    }

    @Test
    @DisplayName("Deve respeitar a relação fundamental: v_mp < v_media < v_rms")
    void testOrdemDasVelocidades() {
        double vMp = calculadora.calcularVelocidadeMaisProvavel(argonio, temperatura);
        double vMedia = calculadora.calcularVelocidadeMedia(argonio, temperatura);
        double vRms = calculadora.calcularVelocidadeQuadraticaMedia(argonio, temperatura);

        assertTrue(vMp < vMedia, "A velocidade mais provável deve ser menor que a média");
        assertTrue(vMedia < vRms, "A velocidade média deve ser menor que a quadrática média");
    }

    @Test
    @DisplayName("Deve calcular valores aproximados corretos para o Argônio a 298.15 K")
    void testValoresArgonio() {
        double vMp = calculadora.calcularVelocidadeMaisProvavel(argonio, temperatura);
        double vMedia = calculadora.calcularVelocidadeMedia(argonio, temperatura);
        double vRms = calculadora.calcularVelocidadeQuadraticaMedia(argonio, temperatura);
        double vSom = calculadora.calcularVelocidadeDoSom(argonio, temperatura);

        // v_mp ~ 352.4 m/s
        assertEquals(352.4, vMp, 1.0);
        // v_media ~ 397.7 m/s
        assertEquals(397.7, vMedia, 1.0);
        // v_rms ~ 431.6 m/s
        assertEquals(431.6, vRms, 1.0);
        // v_som ~ 321.7 m/s
        assertEquals(321.7, vSom, 2.0);
    }

    @Test
    @DisplayName("Deve funcionar também com a sobrecarga que aceita o enum Gas")
    void testSobrecargasComEnumGas() {
        double vMp = calculadora.calcularVelocidadeMaisProvavel(Gas.ARGON, temperatura);
        double vMedia = calculadora.calcularVelocidadeMedia(Gas.ARGON, temperatura);
        double vRms = calculadora.calcularVelocidadeQuadraticaMedia(Gas.ARGON, temperatura);

        assertEquals(352.4, vMp, 1.0);
        assertEquals(397.7, vMedia, 1.0);
        assertEquals(431.6, vRms, 1.0);
    }
}
