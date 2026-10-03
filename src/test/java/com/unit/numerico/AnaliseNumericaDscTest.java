package com.unit.numerico;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.unit.modelo.ConjuntoDadosDsc;
import com.unit.modelo.DadosDscLisozima;

class AnaliseNumericaDscTest {

    @Test
    @DisplayName("Deve integrar a curva de DSC da Lisozima por Trapézio e Simpson")
    void testIntegracaoDsc() {
        ConjuntoDadosDsc dataset = DadosDscLisozima.obterDatasetLisozima();
        double trap = AnaliseNumericaDsc.integrarPorTrapezio(dataset);
        double simp = AnaliseNumericaDsc.integrarPorSimpson(dataset);

        assertTrue(trap > 0.0, "Área térmica por trapézio deve ser positiva");
        assertTrue(simp > 0.0, "Área térmica por Simpson deve ser positiva");

        // Os dois métodos devem ser muito próximos (< 1% de diferença)
        double diffPct = Math.abs(simp - trap) / simp * 100.0;
        assertTrue(diffPct < 1.0, "Diferença entre Trapézio e Simpson deve ser menor que 1%");
    }
}
