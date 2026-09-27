package com.unit.ui;

import java.awt.Color;
import java.util.List;

import javax.swing.SwingUtilities;

import javafx.application.Application;
import javafx.embed.swing.SwingNode;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.control.Slider;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

import org.knowm.xchart.XChartPanel;
import org.knowm.xchart.XYChart;

import com.unit.model.FirstOrderReaction;
import com.unit.model.ReactionConcentrationPoint;

/**
 * Interactive JavaFX demonstration of first-order reaction kinetics (Module 8).
 *
 * <p>Slider limits and increments follow the first-order widgets in
 * {@code Kinetics_Notebook.ipynb}.</p>
 */
public final class FirstOrderKineticsInteractiveApp extends Application {
        static final double START_TIME = 0.0;
        static final double END_TIME = 99.0;
        static final double TIME_STEP = 1.0;
        static final double INITIAL_CONCENTRATION_MIN = 0.0;
        static final double INITIAL_CONCENTRATION_MAX = 1.45;
        static final double INITIAL_CONCENTRATION_STEP = 0.2;
        static final double INITIAL_CONCENTRATION_DEFAULT = 1.0;
        static final double RATE_CONSTANT_MIN = 0.01;
        static final double RATE_CONSTANT_MAX = 0.1;
        static final double RATE_CONSTANT_STEP = 0.01;
        static final double RATE_CONSTANT_DEFAULT = 0.08;

    private final FirstOrderKineticsController controller =
            new FirstOrderKineticsController(START_TIME, END_TIME, TIME_STEP);

    private XYChart chart;
    private XChartPanel<XYChart> chartPanel;
    private Slider initialConcentrationSlider;
    private Slider rateConstantSlider;
    private Label initialConcentrationValue;
    private Label rateConstantValue;
        private Label characteristicTimesValue;

    @Override
    public void start(Stage stage) {
        FirstOrderReaction initialReaction = new FirstOrderReaction(
                INITIAL_CONCENTRATION_DEFAULT, RATE_CONSTANT_DEFAULT);
        chart = FirstOrderReactionChart.createChart(
                initialReaction, START_TIME, END_TIME, TIME_STEP);
        chart.setXAxisTitle("Time [s]");
        chart.setYAxisTitle("Concentration (mol/L)");
        chart.getStyler().setSeriesColors(new Color[] {Color.RED, Color.BLUE});

        initialConcentrationSlider = new Slider(
                INITIAL_CONCENTRATION_MIN,
                INITIAL_CONCENTRATION_MAX,
                INITIAL_CONCENTRATION_DEFAULT);
        initialConcentrationSlider.setShowTickMarks(true);
        initialConcentrationSlider.setShowTickLabels(true);
        initialConcentrationSlider.setMajorTickUnit(INITIAL_CONCENTRATION_STEP);
        initialConcentrationSlider.setBlockIncrement(INITIAL_CONCENTRATION_STEP);
        initialConcentrationSlider.setSnapToTicks(true);
        initialConcentrationSlider.setMinorTickCount(0);
        initialConcentrationValue = new Label();

        rateConstantSlider = new Slider(
                RATE_CONSTANT_MIN,
                RATE_CONSTANT_MAX,
                RATE_CONSTANT_DEFAULT);
        rateConstantSlider.setShowTickMarks(true);
        rateConstantSlider.setShowTickLabels(true);
        rateConstantSlider.setMajorTickUnit(RATE_CONSTANT_STEP);
        rateConstantSlider.setBlockIncrement(RATE_CONSTANT_STEP);
        rateConstantSlider.setSnapToTicks(true);
        rateConstantSlider.setMinorTickCount(0);
        rateConstantValue = new Label();
        characteristicTimesValue = new Label();

        initialConcentrationSlider.valueProperty().addListener(
                (observable, oldValue, newValue) -> updateSimulation());
        rateConstantSlider.valueProperty().addListener(
                (observable, oldValue, newValue) -> updateSimulation());

        VBox controls = new VBox(
                6,
                new Label("Concentração inicial [A]₀ (mol/L)"),
                initialConcentrationSlider,
                initialConcentrationValue,
                new Label("Constante de velocidade k (s⁻¹)"),
                rateConstantSlider,
                rateConstantValue,
                characteristicTimesValue,
                new Label("O gráfico mostra [A] em vermelho e [B] em azul, de 0 a 99 s."));
        controls.setPadding(new Insets(16));
        controls.setMaxWidth(520);

        SwingNode chartNode = new SwingNode();
        SwingUtilities.invokeLater(() -> {
            chartPanel = new XChartPanel<>(chart);
            chartNode.setContent(chartPanel);
        });

        BorderPane root = new BorderPane(chartNode);
        root.setTop(controls);
        updateParameterLabels();

        stage.setTitle("Módulo 8 — Cinética de primeira ordem interativa");
        stage.setScene(new Scene(root, 960, 760));
        stage.show();
    }

    private void updateSimulation() {
        double initialConcentration = initialConcentrationSlider.getValue();
        double rateConstant = rateConstantSlider.getValue();
        List<ReactionConcentrationPoint> points =
                controller.generateData(initialConcentration, rateConstant);

        double[] times = new double[points.size()];
        double[] concentrationsA = new double[points.size()];
        double[] concentrationsB = new double[points.size()];
        for (int index = 0; index < points.size(); index++) {
            ReactionConcentrationPoint point = points.get(index);
            times[index] = point.time();
            concentrationsA[index] = point.concentrationA();
            concentrationsB[index] = point.concentrationB();
        }

        updateParameterLabels();
        SwingUtilities.invokeLater(() -> {
            chart.updateXYSeries("[A]", times, concentrationsA, null);
            chart.updateXYSeries("[B]", times, concentrationsB, null);
            chartPanel.repaint();
        });
    }

    private void updateParameterLabels() {
        double initialConcentration = initialConcentrationSlider.getValue();
        double rateConstant = rateConstantSlider.getValue();
        FirstOrderReaction reaction = new FirstOrderReaction(initialConcentration, rateConstant);
        initialConcentrationValue.setText(String.format(
                "[A]₀ atual = %.2f mol/L", initialConcentration));
        rateConstantValue.setText(String.format(
                "k atual = %.2f s⁻¹", rateConstant));
        characteristicTimesValue.setText(String.format(
                "Meia-vida = %.2f s    Lifetime (τ) = %.2f s",
                reaction.halfLife(), reaction.lifetime()));
    }

    public static void main(String[] args) {
        launch(args);
    }
}
