package com.unit.model;

/**
 * Gases named in the Maxwell-Boltzmann notebook, with molar masses in kg/mol.
 * The notebook defines a nitrogen mass but comments out its plotted series, so
 * N₂ is represented here but omitted from the interactive comparison. Its
 * interactive O₂ value is the atomic oxygen mass; this model uses O₂ molecular
 * mass, 2 × 15.999 g/mol. Notebook particle-mass values are likewise converted
 * to molar masses rather than copied as {@code molarMass × 10^-27 kg}.
 */
public enum Gas {
    ARGON("Ar", "Argon", 0.039948),
    OXYGEN("O₂", "Oxygen", 0.031998),
    HELIUM("He", "Helium", 0.004002602),
    HYDROGEN("H₂", "Hydrogen", 0.00201588),
    NITROGEN("N₂", "Nitrogen", 0.0280134);

    private final String symbol;
    private final String name;
    private final double molarMassKgPerMol;

    Gas(String symbol, String name, double molarMassKgPerMol) {
        this.symbol = symbol;
        this.name = name;
        this.molarMassKgPerMol = molarMassKgPerMol;
    }

    public String symbol() {
        return symbol;
    }

    public String displayName() {
        return name;
    }

    public double molarMassKgPerMol() {
        return molarMassKgPerMol;
    }
}
