package com.unit.numerico;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.unit.modelo.DistribuicaoMaxwellBoltzmann;
import com.unit.modelo.Gas;

class ServicoIntegracaoNumericaTest {

    @Test
    @DisplayName("Deve integrar polinômio conhecido com exatidão")
    void testIntegracaoFuncao() {
        // Integral de x^2 de 0 a 3 = [x^3 / 3]_0^3 = 9.0
        double trap = ServicoIntegracaoNumerica.integrarFuncaoTrapezio(x -> x * x, 0.0, 3.0, 1000);
        double simp = ServicoIntegracaoNumerica.integrarFuncaoSimpson(x -> x * x, 0.0, 3.0, 100);

        assertEquals(9.0, trap, 1e-4);
        assertEquals(9.0, simp, 1e-6); // Simpson é exato para polinômios até grau 2 e 3
    }

    @Test
    @DisplayName("Deve provar que a integral da curva de Maxwell-Boltzmann é normalizada (Área ≈ 1.0)")
    void testNormalizacaoMaxwell() {
        DistribuicaoMaxwellBoltzmann dist = new DistribuicaoMaxwellBoltzmann(Gas.ARGONIO, 300.0);
        // Integra de 0 a 4000 m/s
        double areaTotal = ServicoIntegracaoNumerica.calcularProbabilidadeIntervaloVelocidades(dist, 0.0, 4000.0, 2000);
        assertEquals(1.0, areaTotal, 1e-4, "A área sob a curva de distribuição de velocidades deve ser igual a 1.0");
    }

    @Test
    @DisplayName("Deve calcular a probabilidade de velocidades entre 0 e 800 m/s para o Argônio a 225 K")
    void testIntervaloArgonio225K() {
        DistribuicaoMaxwellBoltzmann dist = new DistribuicaoMaxwellBoltzmann(Gas.ARGONIO, 225.0);
        double prob = ServicoIntegracaoNumerica.calcularProbabilidadeIntervaloVelocidades(dist, 0.0, 800.0, 1000);
        // No artigo original, para T = 225 K, a fração é ~ 99.8% (0.998)
        assertTrue(prob > 0.99, "Quase todas as moléculas de Ar a 225 K estão abaixo de 800 m/s");
    }
}
