package com.unit.model;

import java.util.List;

/**
 * Experimental hen egg-white lysozyme DSC samples transcribed from
 * Introduction_to_Python.ipynb (Privalov et al., Anal. Biochem. 79, 232 (1995)).
 *
 * <p>The notebook labels the ordinate as excess heat capacity in kJ K^-1 mol^-1.
 * That scale is retained without conversion; the notebook does not provide a
 * baseline correction or further unit clarification.</p>
 */
public final class HenEggWhiteLysozymeDscData {
    private static final DscDataset DATASET = new DscDataset(List.of(
            new DscPoint(30.0, 20.0),
            new DscPoint(40.0, 23.0),
            new DscPoint(50.0, 26.0),
            new DscPoint(54.0, 28.0),
            new DscPoint(56.0, 33.0),
            new DscPoint(57.0, 40.0),
            new DscPoint(58.0, 46.0),
            new DscPoint(59.0, 52.0),
            new DscPoint(60.0, 58.0),
            new DscPoint(61.0, 63.0),
            new DscPoint(62.0, 70.0),
            new DscPoint(63.0, 80.0),
            new DscPoint(64.0, 89.0),
            new DscPoint(64.5, 90.0),
            new DscPoint(65.0, 85.0),
            new DscPoint(66.0, 80.0),
            new DscPoint(67.0, 68.0),
            new DscPoint(68.0, 60.0),
            new DscPoint(69.0, 52.0),
            new DscPoint(70.0, 47.0),
            new DscPoint(72.0, 41.0),
            new DscPoint(74.0, 37.0),
            new DscPoint(80.0, 36.0)));

    private HenEggWhiteLysozymeDscData() {
    }

    public static DscDataset dataset() {
        return DATASET;
    }
}
