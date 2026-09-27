package com.unit.model;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ClasseGasTest {

    @Test
    @DisplayName("Deve inicializar os atributos corretamente pelo construtor padrão")
    void testConstrutorPadrao() {
        ClasseGas argonio = new ClasseGas("Argônio", 0.03995, 1.67);
        assertEquals("Argônio", argonio.getNome());
        assertEquals(0.03995, argonio.getMassa(), 1e-6);
        assertEquals(1.67, argonio.getCoeficienteAdiabatico(), 1e-6);
    }

    @Test
    @DisplayName("Deve inicializar a partir do enum Gas de conveniência")
    void testConstrutorComEnumGas() {
        ClasseGas oxigenio = new ClasseGas(Gas.OXYGEN);
        assertEquals("Oxygen", oxigenio.getNome());
        assertEquals(Gas.OXYGEN.molarMassKgPerMol(), oxigenio.getMassa(), 1e-6);
        assertEquals(1.40, oxigenio.getCoeficienteAdiabatico(), 1e-6);
    }
}
