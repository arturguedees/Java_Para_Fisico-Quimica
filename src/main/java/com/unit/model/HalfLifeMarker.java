package com.unit.model;

/**
 * Ponto do gráfico que marca o fim da n-ésima meia-vida.
 *
 * @param number número da meia-vida (1, 2, 3, ...)
 * @param time instante em s
 * @param concentrationA [A] nesse instante, em mol/L (= [A]₀ / 2ⁿ)
 */
public record HalfLifeMarker(int number, double time, double concentrationA) {
}
