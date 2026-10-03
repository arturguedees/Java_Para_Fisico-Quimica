package com.unit.numerico;

import com.unit.modelo.ClasseGas;
import com.unit.modelo.DistribuicaoMaxwellBoltzmann;
import com.unit.modelo.Gas;
import com.unit.util.ConstantesFisicas;

public class CalculadoraMaxwell {
    public static final double R = ConstantesFisicas.R;

    public double calcularVelocidadeMaisProvavel(ClasseGas gas, double temperatura) {
        return new DistribuicaoMaxwellBoltzmann(gas, temperatura).velocidadeMaisProvavel();
    }

    public double calcularVelocidadeMedia(ClasseGas gas, double temperatura) {
        return new DistribuicaoMaxwellBoltzmann(gas, temperatura).velocidadeMedia();
    }

    public double calcularVelocidadeQuadraticaMedia(ClasseGas gas, double temperatura) {
        return new DistribuicaoMaxwellBoltzmann(gas, temperatura).velocidadeQuadraticaMedia();
    }

    public double calcularVelocidadeDoSom(ClasseGas gas, double temperatura) {
        return new DistribuicaoMaxwellBoltzmann(gas, temperatura).velocidadeDoSom();
    }

    public double calcularProbabilidadeIntervalo(ClasseGas gas, double temperatura, double v1, double v2) {
        DistribuicaoMaxwellBoltzmann dist = new DistribuicaoMaxwellBoltzmann(gas, temperatura);
        return ServicoIntegracaoNumerica.calcularProbabilidadeIntervaloVelocidades(dist, v1, v2, 500);
    }

    public double calcularFracaoEnergiaAtivacao(ClasseGas gas, double temperatura, double eaJPorMol) {
        DistribuicaoMaxwellBoltzmann dist = new DistribuicaoMaxwellBoltzmann(gas, temperatura);
        return ServicoIntegracaoNumerica.calcularFracaoMoleculasAcimaEa(dist, eaJPorMol, 1000);
    }

    // Sobrecargas para o enum Gas
    public double calcularVelocidadeMaisProvavel(Gas gas, double temperatura) {
        return calcularVelocidadeMaisProvavel(new ClasseGas(gas), temperatura);
    }

    public double calcularVelocidadeMedia(Gas gas, double temperatura) {
        return calcularVelocidadeMedia(new ClasseGas(gas), temperatura);
    }

    public double calcularVelocidadeQuadraticaMedia(Gas gas, double temperatura) {
        return calcularVelocidadeQuadraticaMedia(new ClasseGas(gas), temperatura);
    }

    public double calcularVelocidadeDoSom(Gas gas, double temperatura) {
        return calcularVelocidadeDoSom(new ClasseGas(gas), temperatura);
    }
}
