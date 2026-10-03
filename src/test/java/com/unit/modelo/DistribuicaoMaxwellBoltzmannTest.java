package com.unit.modelo;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class DistribuicaoMaxwellBoltzmannTest {

    @Test
    @DisplayName("Deve obedecer à ordenação estrita v_mp < v_m < v_rms para qualquer gás")
    void testOrdenacaoVelocidades() {
        DistribuicaoMaxwellBoltzmann dist = new DistribuicaoMaxwellBoltzmann(Gas.ARGONIO, 298.15);
        double vMp = dist.velocidadeMaisProvavel();
        double vM = dist.velocidadeMedia();
        double vRms = dist.velocidadeQuadraticaMedia();
        double cSom = dist.velocidadeDoSom();

        assertTrue(vMp < vM, "v_mp deve ser menor que v_m");
        assertTrue(vM < vRms, "v_m deve ser menor que v_rms");
        assertTrue(cSom > 0, "Velocidade do som deve ser positiva");
    }

    @Test
    @DisplayName("Valores de referência para o Argônio a 298.15 K")
    void testValoresArgonio() {
        DistribuicaoMaxwellBoltzmann dist = new DistribuicaoMaxwellBoltzmann(Gas.ARGONIO, 298.15);
        assertEquals(352.4, dist.velocidadeMaisProvavel(), 1.0);
        assertEquals(397.7, dist.velocidadeMedia(), 1.0);
        assertEquals(431.6, dist.velocidadeQuadraticaMedia(), 1.0);
        assertEquals(321.7, dist.velocidadeDoSom(), 2.0);
    }
}
