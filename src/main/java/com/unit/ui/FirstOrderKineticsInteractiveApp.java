package com.unit.ui;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.util.List;

import javafx.application.Application;
import javafx.embed.swing.SwingFXUtils;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Label;
import javafx.scene.control.ScrollPane;
import javafx.scene.control.Slider;
import javafx.scene.image.ImageView;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.Pane;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

import org.knowm.xchart.XYChart;
import org.knowm.xchart.XYSeries;
import org.knowm.xchart.style.markers.SeriesMarkers;

import com.unit.model.HalfLifeMarker;
import com.unit.model.KineticsReaction;
import com.unit.model.ReactionConcentrationPoint;
import com.unit.model.ReactionOrder;
import com.unit.model.ZeroOrderReaction;

/**
 * Interactive JavaFX demonstration of zero- and first-order reaction kinetics.
 *
 * <p>Slider limits and increments follow the widgets in {@code Kinetics_Notebook.ipynb}
 * (k de 0,01 a 0,1 em passos de 0,01 nas duas ordens). O gráfico marca o fim
 * de 1, 2 e 3 meias-vidas, como nos exercícios 2 e 3 do notebook.</p>
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
    static final ReactionOrder DEFAULT_ORDER = ReactionOrder.FIRST;
    static final String HALF_LIFE_SERIES = "Meias-vidas (1, 2, 3)";
    static final double CONTROLS_WIDTH = 380.0;

    private final FirstOrderKineticsController controller =
            new FirstOrderKineticsController(START_TIME, END_TIME, TIME_STEP);

    private XYChart chart;
    private Pane chartPane;
    private ImageView chartView;
    private ComboBox<ReactionOrder> orderSelector;
    private Slider initialConcentrationSlider;
    private Slider rateConstantSlider;
    private Label rateConstantTitle;
    private Label initialConcentrationValue;
    private Label rateConstantValue;
    private Label rateLawValue;
    private Label characteristicTimesValue;

    @Override
    public void start(Stage stage) {
        KineticsReaction initialReaction = controller.createReaction(
                DEFAULT_ORDER, INITIAL_CONCENTRATION_DEFAULT, RATE_CONSTANT_DEFAULT);
        chart = FirstOrderReactionChart.createChart(
                initialReaction, START_TIME, END_TIME, TIME_STEP);
        chart.setXAxisTitle("Time [s]");
        chart.setYAxisTitle("Concentration (mol/L)");
        chart.getStyler().setSeriesColors(new Color[] {Color.RED, Color.BLUE, Color.DARK_GRAY});
        updateHalfLifeSeries(controller.halfLifeMarkers(
                DEFAULT_ORDER, INITIAL_CONCENTRATION_DEFAULT, RATE_CONSTANT_DEFAULT));

        orderSelector = new ComboBox<>();
        orderSelector.getItems().addAll(ReactionOrder.values());
        orderSelector.setValue(DEFAULT_ORDER);

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
        rateConstantTitle = new Label();
        rateConstantValue = new Label();
        rateLawValue = new Label();
        characteristicTimesValue = new Label();

        orderSelector.valueProperty().addListener(
                (observable, oldValue, newValue) -> updateSimulation());
        initialConcentrationSlider.valueProperty().addListener(
                (observable, oldValue, newValue) -> updateSimulation());
        rateConstantSlider.valueProperty().addListener(
                (observable, oldValue, newValue) -> updateSimulation());

        Label legendNote = new Label(
                "O gráfico mostra [A] em vermelho, [B] em azul e as meias-vidas em cinza, de 0 a 99 s.");
        legendNote.setWrapText(true);
        characteristicTimesValue.setWrapText(true);

        VBox controls = new VBox(
                6,
                new Label("Ordem da reação"),
                orderSelector,
                rateLawValue,
                new Label("Concentração inicial [A]₀ (mol/L)"),
                initialConcentrationSlider,
                initialConcentrationValue,
                rateConstantTitle,
                rateConstantSlider,
                rateConstantValue,
                characteristicTimesValue,
                legendNote);
        controls.setPadding(new Insets(16));
        controls.setPrefWidth(CONTROLS_WIDTH);

        // Controles numa coluna à esquerda (com rolagem se a janela for baixa)
        ScrollPane controlsScroll = new ScrollPane(controls);
        controlsScroll.setFitToWidth(true);
        controlsScroll.setPrefWidth(CONTROLS_WIDTH + 20);
        controlsScroll.setMinWidth(CONTROLS_WIDTH + 20);

        // Gráfico ocupa todo o restante da janela e é redesenhado ao redimensionar
        chartView = new ImageView();
        chartPane = new Pane(chartView);
        chartPane.setMinSize(0, 0);
        chartPane.widthProperty().addListener((observable, oldValue, newValue) -> renderChart());
        chartPane.heightProperty().addListener((observable, oldValue, newValue) -> renderChart());

        BorderPane root = new BorderPane(chartPane);
        root.setLeft(controlsScroll);
        updateParameterLabels();

        stage.setTitle("Cinética química interativa — ordem zero e primeira ordem");
        stage.setScene(new Scene(root, 1200, 720));
        stage.show();
        renderChart();
    }

    /**
     * Desenha o XChart numa imagem do tamanho da área disponível.
     * Evita embutir o painel Swing no JavaFX, que corta/desloca o gráfico com
     * escala de tela do Windows diferente de 100%. A imagem é gerada na densidade
     * real da tela (outputScale) para o texto não ficar borrado.
     */
    private void renderChart() {
        if (chartPane == null) {
            return;
        }
        int width = (int) Math.floor(chartPane.getWidth());
        int height = (int) Math.floor(chartPane.getHeight());
        if (width < 10 || height < 10) {
            return;
        }

        double scale = chartPane.getScene() != null && chartPane.getScene().getWindow() != null
                ? chartPane.getScene().getWindow().getOutputScaleX()
                : 1.0;
        int pixelWidth = (int) Math.round(width * scale);
        int pixelHeight = (int) Math.round(height * scale);

        BufferedImage image = new BufferedImage(pixelWidth, pixelHeight, BufferedImage.TYPE_INT_ARGB);
        Graphics2D graphics = image.createGraphics();
        try {
            graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            graphics.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING,
                    RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
            graphics.scale(scale, scale);
            chart.paint(graphics, width, height);
        } finally {
            graphics.dispose();
        }

        chartView.setImage(SwingFXUtils.toFXImage(image, null));
        chartView.setFitWidth(width);
        chartView.setFitHeight(height);
    }

    private void updateSimulation() {
        ReactionOrder order = orderSelector.getValue();
        double initialConcentration = initialConcentrationSlider.getValue();
        double rateConstant = rateConstantSlider.getValue();
        List<ReactionConcentrationPoint> points =
                controller.generateData(order, initialConcentration, rateConstant);
        List<HalfLifeMarker> markers =
                controller.halfLifeMarkers(order, initialConcentration, rateConstant);

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
        chart.setTitle(FirstOrderReactionChart.titleFor(order));
        chart.updateXYSeries("[A]", times, concentrationsA, null);
        chart.updateXYSeries("[B]", times, concentrationsB, null);
        updateHalfLifeSeries(markers);
        renderChart();
    }

    /**
     * Mostra as meias-vidas como pontos. XChart não aceita série vazia, então a
     * série é removida quando nenhuma meia-vida cabe no intervalo de tempo.
     */
    private void updateHalfLifeSeries(List<HalfLifeMarker> markers) {
        boolean present = chart.getSeriesMap().containsKey(HALF_LIFE_SERIES);
        if (markers.isEmpty()) {
            if (present) {
                chart.removeSeries(HALF_LIFE_SERIES);
            }
            return;
        }

        double[] times = new double[markers.size()];
        double[] concentrations = new double[markers.size()];
        for (int index = 0; index < markers.size(); index++) {
            times[index] = markers.get(index).time();
            concentrations[index] = markers.get(index).concentrationA();
        }

        if (present) {
            chart.updateXYSeries(HALF_LIFE_SERIES, times, concentrations, null);
        } else {
            XYSeries series = chart.addSeries(HALF_LIFE_SERIES, times, concentrations);
            series.setXYSeriesRenderStyle(XYSeries.XYSeriesRenderStyle.Scatter);
            series.setMarker(SeriesMarkers.DIAMOND);
            series.setMarkerColor(Color.DARK_GRAY);
        }
    }

    private void updateParameterLabels() {
        ReactionOrder order = orderSelector.getValue();
        double initialConcentration = initialConcentrationSlider.getValue();
        double rateConstant = rateConstantSlider.getValue();
        KineticsReaction reaction =
                controller.createReaction(order, initialConcentration, rateConstant);

        rateLawValue.setText(order.integratedRateLaw());
        rateConstantTitle.setText(String.format(
                "Constante de velocidade k (%s)", order.rateConstantUnit()));
        initialConcentrationValue.setText(String.format(
                "[A]₀ atual = %.2f mol/L", initialConcentration));
        rateConstantValue.setText(String.format(
                "k atual = %.2f %s", rateConstant, order.rateConstantUnit()));

        String halfLives = String.format(
                "1ª meia-vida = %.2f s    2ª = %.2f s    3ª = %.2f s",
                reaction.timeAtSuccessiveHalfLife(1),
                reaction.timeAtSuccessiveHalfLife(2),
                reaction.timeAtSuccessiveHalfLife(3));
        String extra = switch (order) {
            case ZERO -> String.format(
                    "Reagente esgota em t = [A]₀/k = %.2f s (t½ depende de [A]₀)",
                    ((ZeroOrderReaction) reaction).completionTime());
            case FIRST -> String.format(
                    "Lifetime (τ = 1/k) = %.2f s (t½ independe de [A]₀)",
                    1.0 / rateConstant);
        };
        characteristicTimesValue.setText(halfLives + "\n" + extra);
    }

    public static void main(String[] args) {
        launch(args);
    }
}