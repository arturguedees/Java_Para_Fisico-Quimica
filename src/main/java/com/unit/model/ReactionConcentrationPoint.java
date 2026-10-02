package com.unit.model;

/**
 * Concentrations of reactant A and product B at a point in time.
 *
 * @param time elapsed time
 * @param concentrationA concentration of A
 * @param concentrationB concentration of B
 */
public record ReactionConcentrationPoint(
        double time,
        double concentrationA,
        double concentrationB) {
}
