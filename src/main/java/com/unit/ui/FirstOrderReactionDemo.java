package com.unit.ui;

import com.unit.model.FirstOrderReaction;

/**
 * Manual demonstration entry point for Module 5 first-order reaction kinetics.
 */
public final class FirstOrderReactionDemo {
    private FirstOrderReactionDemo() {
    }

    /**
     * Opens the Module 5 example chart using the notebook's reaction parameters.
     * Run this class directly to inspect the visualization manually.
     *
     * @param args command-line arguments (unused)
     */
    public static void main(String[] args) {
        FirstOrderReaction reaction = new FirstOrderReaction(1.0, 0.08);
        FirstOrderReactionChart.displayChart(reaction, 0.0, 99.0, 1.0);
    }
}
