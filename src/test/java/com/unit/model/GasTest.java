package com.unit.model;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class GasTest {
    private static final double TOLERANCE = 1.0e-12;

    @Test
    void notebookMolarMassesAreRepresentedInKilogramsPerMole() {
        assertEquals(0.039948, Gas.ARGON.molarMassKgPerMol(), TOLERANCE);
        assertEquals(0.031998, Gas.OXYGEN.molarMassKgPerMol(), TOLERANCE);
        assertEquals(0.004002602, Gas.HELIUM.molarMassKgPerMol(), TOLERANCE);
        assertEquals(0.00201588, Gas.HYDROGEN.molarMassKgPerMol(), TOLERANCE);
        assertEquals(0.0280134, Gas.NITROGEN.molarMassKgPerMol(), TOLERANCE);
    }
}
