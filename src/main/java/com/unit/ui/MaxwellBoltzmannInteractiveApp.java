package com.unit.ui;

import java.util.List;
import java.util.Locale;

import javax.swing.SwingUtilities;

import javafx.application.Application;
import javafx.embed.swing.SwingNode;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.control.Slider;
import javafx.scene.control.Tab;
import javafx.scene.control.TabPane;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

import org.knowm.xchart.XChartPanel;
import org.knowm.xchart.XYChart;

import com.unit.model.Gas;
import com.unit.model.MaxwellBoltzmannDistribution;
import com.unit.model.MaxwellBoltzmannPoint;
import com.unit.numerical.MaxwellBoltzmannDataGenerator;

/** Interactive Module 9 temperature/gas comparison and notebook argon reference chart. */
public final class MaxwellBoltzmannInteractiveApp extends Application {
    static final double TEMPERATURE_MIN_KELVIN = 25.0;
    static final double TEMPERATURE_MAX_KELVIN = 1000.0;
    static final double TEMPERATURE_STEP_KELVIN = 100.0;
    static final double DEFAULT_TEMPERATURE_KELVIN = 25.0;

    private XYChart gasComparisonChart;
    private XChartPanel<XYChart> gasComparisonPanel;
    private Label temperatureValue;
    private boolean argonReferenceLoaded;

    @Override
    public void start(Stage stage) {
        gasComparisonChart = MaxwellBoltzmannChart.createGasComparisonChart(
                DEFAULT_TEMPERATURE_KELVIN);
        Slider temperatureSlider = new Slider(
                TEMPERATURE_MIN_KELVIN,
                TEMPERATURE_MAX_KELVIN,
                DEFAULT_TEMPERATURE_KELVIN);
        temperatureSlider.setShowTickMarks(true);
        temperatureSlider.setShowTickLabels(true);
        temperatureSlider.setMajorTickUnit(TEMPERATURE_STEP_KELVIN);
        temperatureSlider.setBlockIncrement(TEMPERATURE_STEP_KELVIN);
        temperatureValue = new Label();
        updateTemperatureLabel(DEFAULT_TEMPERATURE_KELVIN);

        VBox controls = new VBox(
                8,
                new Label("Temperatura (K); comparação simultânea de Ar, O₂, He e H₂"),
                temperatureSlider,
                temperatureValue,
                new Label("Velocidade amostrada de 0 a 1499 m/s, em passos de 1 m/s."));
        controls.setPadding(new Insets(16));

        SwingNode gasChartNode = new SwingNode();
        SwingUtilities.invokeLater(() -> {
            gasComparisonPanel = new XChartPanel<>(gasComparisonChart);
            gasChartNode.setContent(gasComparisonPanel);
        });

        BorderPane gasComparisonView = new BorderPane(gasChartNode);
        gasComparisonView.setTop(controls);

        Tab gasComparisonTab = new Tab("Temperatura e gases", gasComparisonView);
        gasComparisonTab.setClosable(false);

        SwingNode argonChartNode = new SwingNode();
        Tab argonReferenceTab = new Tab("Argônio: temperaturas de referência", argonChartNode);
        argonReferenceTab.setClosable(false);
        argonReferenceTab.setOnSelectionChanged(event -> {
            if (argonReferenceTab.isSelected() && !argonReferenceLoaded) {
                XYChart argonChart = MaxwellBoltzmannChart.createArgonTemperatureReferenceChart();
                SwingUtilities.invokeLater(() -> argonChartNode.setContent(new XChartPanel<>(argonChart)));
                argonReferenceLoaded = true;
            }
        });

        temperatureSlider.valueProperty().addListener((observable, oldValue, newValue) -> {
            double selectedTemperature = snapTemperatureToNotebookStep(newValue.doubleValue());
            if (selectedTemperature != newValue.doubleValue()) {
                temperatureSlider.setValue(selectedTemperature);
                return;
            }
            updateGasComparison(selectedTemperature);
        });

        TabPane tabs = new TabPane(gasComparisonTab, argonReferenceTab);
        stage.setTitle("Módulo 9 — Distribuição de Maxwell-Boltzmann");
        stage.setScene(new Scene(tabs, 960, 720));
        stage.show();
    }

    private void updateGasComparison(double temperatureKelvin) {
        updateTemperatureLabel(temperatureKelvin);
        List<Gas> gases = MaxwellBoltzmannChart.NOTEBOOK_COMPARISON_GASES;
        double[][] speedsByGas = new double[gases.size()][];
        double[][] densitiesByGas = new double[gases.size()][];

        for (int gasIndex = 0; gasIndex < gases.size(); gasIndex++) {
            Gas gas = gases.get(gasIndex);
            List<MaxwellBoltzmannPoint> points = MaxwellBoltzmannDataGenerator.generate(
                    new MaxwellBoltzmannDistribution(gas, temperatureKelvin),
                    MaxwellBoltzmannChart.INTERACTIVE_SPEED_START,
                    MaxwellBoltzmannChart.INTERACTIVE_SPEED_END_EXCLUSIVE,
                    MaxwellBoltzmannChart.INTERACTIVE_SPEED_STEP);
            speedsByGas[gasIndex] = new double[points.size()];
            densitiesByGas[gasIndex] = new double[points.size()];
            for (int pointIndex = 0; pointIndex < points.size(); pointIndex++) {
                MaxwellBoltzmannPoint point = points.get(pointIndex);
                speedsByGas[gasIndex][pointIndex] = point.speedMetersPerSecond();
                densitiesByGas[gasIndex][pointIndex] = point.probabilityDensity();
            }
        }

        SwingUtilities.invokeLater(() -> {
            for (int gasIndex = 0; gasIndex < gases.size(); gasIndex++) {
                gasComparisonChart.updateXYSeries(
                        gases.get(gasIndex).symbol(),
                        speedsByGas[gasIndex],
                        densitiesByGas[gasIndex],
                        null);
            }
            gasComparisonChart.setTitle(String.format(
                    Locale.ROOT,
                    "Maxwell-Boltzmann speed distribution — T = %.0f K",
                    temperatureKelvin));
            gasComparisonPanel.repaint();
        });
    }

    private void updateTemperatureLabel(double temperatureKelvin) {
        temperatureValue.setText(String.format(
                Locale.ROOT, "T atual = %.0f K", temperatureKelvin));
    }

        static double snapTemperatureToNotebookStep(double temperatureKelvin) {
        double numberOfSteps = Math.round(
            (temperatureKelvin - TEMPERATURE_MIN_KELVIN) / TEMPERATURE_STEP_KELVIN);
        double snappedTemperature = TEMPERATURE_MIN_KELVIN
            + numberOfSteps * TEMPERATURE_STEP_KELVIN;
        return Math.min(TEMPERATURE_MAX_KELVIN, snappedTemperature);
        }

    public static void main(String[] args) {
        launch(args);
    }
}
