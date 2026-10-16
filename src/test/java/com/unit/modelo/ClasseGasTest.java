package com.unit.modelo;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ClasseGasTest {

    @Test
    @DisplayName("Deve inicializar gás padrão e gás personalizado")
    void testCriacaoGas() {
        ClasseGas ar = new ClasseGas(Gas.ARGONIO);
        assertEquals("Argônio", ar.getNome());
        assertEquals("Ar", ar.getSimbolo());
        assertEquals(0.039948, ar.getMassaMolarKgPorMol(), 1e-6);

        ClasseGas co2 = new ClasseGas("Dióxido de Carbono", "CO₂", 0.04401, 1.30);
        assertEquals("Dióxido de Carbono", co2.getNome());
        assertEquals("CO₂", co2.getSimbolo());
        assertEquals(0.04401, co2.getMassaMolarKgPorMol(), 1e-6);
        assertEquals(1.30, co2.getCoeficienteAdiabatico(), 1e-6);
    }
}
