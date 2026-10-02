package com.unit.ui;

import java.util.Locale;

import com.unit.model.DscDataset;
import com.unit.model.HenEggWhiteLysozymeDscData;
import com.unit.numerical.DscNumericalAnalysis;

/**
 * Manual demonstration of the DSC integration and interpolation example.
 */
public final class LysozymeDscDemo {
    private LysozymeDscDemo() {
    }

    /**
     * Prints integration comparisons and opens the static DSC chart.
     *
     * @param args command-line arguments (unused)
     */
    public static void main(String[] args) {
        DscDataset dataset = HenEggWhiteLysozymeDscData.dataset();

        System.out.printf(Locale.ROOT, "Trapezoidal area of raw DSC samples: %.2f%n",
                DscNumericalAnalysis.integrateTrapezoidal(dataset));
        System.out.printf(Locale.ROOT, "Notebook Simpson unfolding-enthalpy estimate (kJ/mol): %.2f%n",
                DscNumericalAnalysis.estimateUnfoldingEnthalpyWithSimpson(dataset));
        System.out.printf(Locale.ROOT, "Simpson quadrature of cubic spline: %.2f%n",
                DscNumericalAnalysis.integrateInterpolatedWithSimpson(dataset));
        System.out.printf(Locale.ROOT, "Romberg quadrature of cubic spline: %.2f%n",
                DscNumericalAnalysis.integrateInterpolatedWithRomberg(dataset));
        System.out.println("Areas follow the notebook's stated axis units and use the full range without baseline correction.");
        System.out.println("The notebook labels its Simpson area as kJ/mol; its data scale is not independently clarified.");

        LysozymeDscChart.displayNotebookExample();
    }
}
