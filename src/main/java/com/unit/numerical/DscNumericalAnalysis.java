package com.unit.numerical;

import java.util.List;

import org.apache.commons.math3.analysis.integration.RombergIntegrator;
import org.apache.commons.math3.analysis.integration.SimpsonIntegrator;
import org.apache.commons.math3.analysis.integration.UnivariateIntegrator;
import org.apache.commons.math3.analysis.interpolation.SplineInterpolator;
import org.apache.commons.math3.analysis.polynomials.PolynomialSplineFunction;

import com.unit.model.DscDataset;
import com.unit.model.DscPoint;

/**
 * Numerical operations for sampled DSC data and its cubic-spline interpolation.
 */
public final class DscNumericalAnalysis {
    private static final int MAX_EVALUATIONS = 100_000;

    private DscNumericalAnalysis() {
    }

    /**
     * Integrates the experimental samples with the trapezoidal rule.
     * Supports non-uniform temperature spacing.
     *
     * @param dataset ordered DSC samples
     * @return integral in the product of the dataset's stated axis units
     */
    public static double integrateTrapezoidal(DscDataset dataset) {
        List<DscPoint> points = dataset.points();
        double area = 0.0;
        for (int index = 1; index < points.size(); index++) {
            DscPoint left = points.get(index - 1);
            DscPoint right = points.get(index);
            double width = right.temperatureCelsius() - left.temperatureCelsius();
            area += width * (left.excessHeatCapacity() + right.excessHeatCapacity()) / 2.0;
        }
        return area;
    }

    /**
     * Integrates non-uniform samples using a composite three-point Simpson rule.
     * The number of subintervals must be even, as it is for the notebook's 23 points.
     * For each pair of intervals, the rule integrates the quadratic interpolant
     * through that triplet of measurements (the same general approach used by
     * SciPy's sampled-data Simpson routine).
     *
     * @param dataset ordered DSC samples
     * @return integral in the product of the dataset's stated axis units
     * @throws IllegalArgumentException if the dataset has an odd number of intervals
     */
    public static double integrateSimpson(DscDataset dataset) {
        List<DscPoint> points = dataset.points();
        int intervalCount = points.size() - 1;
        if (intervalCount % 2 != 0) {
            throw new IllegalArgumentException("Simpson integration requires an even number of intervals");
        }

        double area = 0.0;
        for (int index = 0; index < points.size() - 2; index += 2) {
            DscPoint first = points.get(index);
            DscPoint middle = points.get(index + 1);
            DscPoint last = points.get(index + 2);
            double firstWidth = middle.temperatureCelsius() - first.temperatureCelsius();
            double secondWidth = last.temperatureCelsius() - middle.temperatureCelsius();
            double totalWidth = firstWidth + secondWidth;

            area += totalWidth / 6.0 * (
                    first.excessHeatCapacity() * (2.0 - secondWidth / firstWidth)
                    + middle.excessHeatCapacity() * totalWidth * totalWidth / (firstWidth * secondWidth)
                    + last.excessHeatCapacity() * (2.0 - firstWidth / secondWidth));
        }
        return area;
    }

    /**
     * Returns the notebook's Simpson-rule estimate for the lysozyme unfolding enthalpy.
     * The notebook labels this full-range integral as kJ/mol. This method applies
     * no baseline correction or other conversion beyond integrating the supplied
     * data, so the result remains conditional on the notebook's stated units and model.
     *
     * @param dataset ordered DSC samples
     * @return full-range Simpson integral, interpreted as the notebook's kJ/mol estimate
     */
    public static double estimateUnfoldingEnthalpyWithSimpson(DscDataset dataset) {
        return integrateSimpson(dataset);
    }

    /**
     * Interpolates the dataset using Commons Math's natural cubic spline.
     *
     * <p>Important: this boundary condition is not identical to SciPy's default
     * {@code make_interp_spline(..., k=3)}, which uses not-a-knot conditions.
     * The spline passes through the supplied samples, but its endpoint curvature
     * and resulting curve integral can differ from the notebook.</p>
     *
     * @param dataset ordered DSC samples
     * @return cubic spline defined over the dataset's temperature range
     */
    public static PolynomialSplineFunction interpolate(DscDataset dataset) {
        double[] temperatures = new double[dataset.points().size()];
        double[] heatCapacities = new double[dataset.points().size()];
        for (int index = 0; index < dataset.points().size(); index++) {
            DscPoint point = dataset.points().get(index);
            temperatures[index] = point.temperatureCelsius();
            heatCapacities[index] = point.excessHeatCapacity();
        }
        return new SplineInterpolator().interpolate(temperatures, heatCapacities);
    }

    /**
     * Integrates the spline over the full dataset domain using Commons Math Simpson quadrature.
     * This is an additional smooth-curve estimate; the notebook's Simpson result
     * is computed from the original samples instead.
     *
     * @param dataset ordered DSC samples
     * @return integral of the spline in the product of the dataset's stated axis units
     */
    public static double integrateInterpolatedWithSimpson(DscDataset dataset) {
        return integrateInterpolated(dataset, new SimpsonIntegrator());
    }

    /**
     * Integrates the spline over the full dataset domain using Commons Math Romberg quadrature.
     * Romberg is introduced in the notebook's general text but is not used in its DSC cell.
     *
     * @param dataset ordered DSC samples
     * @return integral of the spline in the product of the dataset's stated axis units
     */
    public static double integrateInterpolatedWithRomberg(DscDataset dataset) {
        return integrateInterpolated(dataset, new RombergIntegrator());
    }

    private static double integrateInterpolated(DscDataset dataset, UnivariateIntegrator integrator) {
        PolynomialSplineFunction spline = interpolate(dataset);
        return integrator.integrate(
                MAX_EVALUATIONS,
                spline,
                dataset.firstPoint().temperatureCelsius(),
                dataset.lastPoint().temperatureCelsius());
    }
}
