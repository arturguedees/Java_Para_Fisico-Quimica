package com.unit.numerical;
import com.unit.model.ClasseGas;
import com.unit.model.Gas;

public class CalculadoraMaxwell {
    public static final double R = 8.3145;

    public double calcularVelocidadeMedia(ClasseGas gas, double temperatura){
        double massa = gas.getMassa();
        double velocidadeMedia = Math.sqrt((8.0 * R *temperatura)/(Math.PI*massa));
        return velocidadeMedia;
    }

    public double calcularVelocidadeMaisProvavel(ClasseGas gas, double temperatura){
        double massa = gas.getMassa();
        double velocidadeMaisProvavel = Math.sqrt((2.0 * R * temperatura)/(massa));
        return velocidadeMaisProvavel;
    }

    public double calcularVelocidadeQuadraticaMedia(ClasseGas gas, double temperatura){
        double massa = gas.getMassa();
        double velocidadeQuadraticaMedia = Math.sqrt((3.0 * R * temperatura)/ (massa));
        return velocidadeQuadraticaMedia;
    }

    /**
     * Módulo 5: Velocidade do som no gás ideal: c = sqrt(γ * R * T / M)
     */
    public double calcularVelocidadeDoSom(ClasseGas gas, double temperatura) {
        double massa = gas.getMassa();
        double gama = gas.getCoeficienteAdiabatico();
        return Math.sqrt((gama * R * temperatura) / massa);
    }

    // Sobrecargas diretas para o enum Gas
    public double calcularVelocidadeMedia(Gas gas, double temperatura){
        return Math.sqrt((8.0 * R * temperatura) / (Math.PI * gas.molarMassKgPerMol()));
    }

    public double calcularVelocidadeMaisProvavel(Gas gas, double temperatura){
        return Math.sqrt((2.0 * R * temperatura) / gas.molarMassKgPerMol());
    }

    public double calcularVelocidadeQuadraticaMedia(Gas gas, double temperatura){
        return Math.sqrt((3.0 * R * temperatura) / gas.molarMassKgPerMol());
    }
}

