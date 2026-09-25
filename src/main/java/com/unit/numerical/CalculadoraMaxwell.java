package com.unit.numerical;
import com.unit.model.ClasseGas;

public class CalculadoraMaxwell {
    public static final double R = 8.3145;

    public double CalcularVelocidadeMedia(ClasseGas gas, double temperatura){
        double massa = gas.getMassa();
        double velocidadeMedia = (Math.sqrt(8.0 * R *temperatura)/(Math.PI*massa));
        return massa;
    }

    public double CalcularVelocidadeMaisProvavel(ClasseGas gas, double temperatura){
        double massa = gas.getMassa();
        double velocidadeMaisProvavel = (Math.sqrt(2.0 * R * temperatura)/(massa));
        return massa;
    }

    public double CalcularVelocidadeQuadraticaMedia(ClasseGas gas, double temperatura){
        double massa = gas.getMassa();
        double VelocidadeQuadraticaMedia = (Math.sqrt(3.0 * R * temperatura)/ (massa));
        return massa;
    }


}

