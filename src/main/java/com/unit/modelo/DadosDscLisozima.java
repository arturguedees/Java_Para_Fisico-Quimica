package com.unit.modelo;

import java.util.List;

public final class DadosDscLisozima {
    private static final List<PontoDsc> PONTOS_LISOZIMA = List.of(
            new PontoDsc(40.0, 0.00),
            new PontoDsc(42.5, 0.05),
            new PontoDsc(45.0, 0.12),
            new PontoDsc(47.5, 0.22),
            new PontoDsc(50.0, 0.40),
            new PontoDsc(52.5, 0.75),
            new PontoDsc(55.0, 1.35),
            new PontoDsc(57.5, 2.45),
            new PontoDsc(60.0, 4.30),
            new PontoDsc(62.5, 7.20),
            new PontoDsc(64.0, 9.60),
            new PontoDsc(65.0, 10.80),
            new PontoDsc(66.0, 10.20),
            new PontoDsc(67.5, 7.80),
            new PontoDsc(70.0, 4.50),
            new PontoDsc(72.5, 2.30),
            new PontoDsc(75.0, 1.15),
            new PontoDsc(77.5, 0.55),
            new PontoDsc(80.0, 0.25),
            new PontoDsc(82.5, 0.10),
            new PontoDsc(85.0, 0.04),
            new PontoDsc(87.5, 0.01),
            new PontoDsc(90.0, 0.00)
    );

    private DadosDscLisozima() {}

    public static ConjuntoDadosDsc obterDatasetLisozima() {
        return new ConjuntoDadosDsc("Lisozima de Clara de Ovo (HEWL)", PONTOS_LISOZIMA);
    }
}
