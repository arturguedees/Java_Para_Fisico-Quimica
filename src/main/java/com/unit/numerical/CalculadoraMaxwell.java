package com.unit.numerical;

import com.unit.model.ClasseGas;
import com.unit.model.Gas;

public class CalculadoraMaxwell {
    // Constante Universal dos Gases no SI: J / (mol * K)
    public static final double R = 8.3145;

    // Relação física esperada entre as velocidades: v_mp < v_media < v_rms
    public double calcularVelocidadeMedia(ClasseGas gas, double temperatura) {
        double massa = gas.getMassa();
        return Math.sqrt((8.0 * R * temperatura) / (Math.PI * massa));
    }

    public double calcularVelocidadeMaisProvavel(ClasseGas gas, double temperatura) {
        double massa = gas.getMassa();
        return Math.sqrt((2.0 * R * temperatura) / massa);
    }

    public double calcularVelocidadeQuadraticaMedia(ClasseGas gas, double temperatura) {
        double massa = gas.getMassa();
        return Math.sqrt((3.0 * R * temperatura) / massa);
    }

    // Módulo 5: c = sqrt(γ * R * T / M). Exige o coeficiente adiabático γ do gás.
    public double calcularVelocidadeDoSom(ClasseGas gas, double temperatura) {
        double massa = gas.getMassa();
        double gama = gas.getCoeficienteAdiabatico();
        return Math.sqrt((gama * R * temperatura) / massa);
    }

    // Sobrecargas para interoperabilidade com o enum Gas
    public double calcularVelocidadeMedia(Gas gas, double temperatura) {
        return Math.sqrt((8.0 * R * temperatura) / (Math.PI * gas.molarMassKgPerMol()));
    }

    public double calcularVelocidadeMaisProvavel(Gas gas, double temperatura) {
        return Math.sqrt((2.0 * R * temperatura) / gas.molarMassKgPerMol());
    }

    public double calcularVelocidadeQuadraticaMedia(Gas gas, double temperatura) {
        return Math.sqrt((3.0 * R * temperatura) / gas.molarMassKgPerMol());
    }
}
