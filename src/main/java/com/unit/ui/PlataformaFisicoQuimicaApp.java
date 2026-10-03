package com.unit.ui;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import javax.swing.SwingUtilities;

import javafx.application.Application;
import javafx.embed.swing.SwingNode;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Label;
import javafx.scene.control.RadioButton;
import javafx.scene.control.ScrollPane;
import javafx.scene.control.Slider;
import javafx.scene.control.Tab;
import javafx.scene.control.TabPane;
import javafx.scene.control.TextField;
import javafx.scene.control.ToggleGroup;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.FileChooser;
import javafx.stage.Stage;

import org.knowm.xchart.XChartPanel;
import org.knowm.xchart.XYChart;

import com.unit.modelo.ClasseGas;
import com.unit.modelo.ConjuntoDadosDsc;
import com.unit.modelo.DadosDscLisozima;
import com.unit.modelo.DistribuicaoMaxwellBoltzmann;
import com.unit.modelo.Gas;
import com.unit.modelo.ModeloCinetico;
import com.unit.modelo.PontoConcentracao;
import com.unit.modelo.PontoMaxwellBoltzmann;
import com.unit.modelo.ReacaoOrdemZero;
import com.unit.modelo.ReacaoPrimeiraOrdem;
import com.unit.numerico.AnaliseNumericaDsc;
import com.unit.numerico.GeradorDadosCinetica;
import com.unit.numerico.GeradorDadosMaxwell;
import com.unit.numerico.ServicoIntegracaoNumerica;
import com.unit.util.ExportadorCsv;

public final class PlataformaFisicoQuimicaApp extends Application {

    private Stage primaryStage;

    @Override
    public void start(Stage stage) {
        this.primaryStage = stage;
        Locale.setDefault(Locale.US);

        TabPane tabPane = new TabPane();

        Tab tabCinetica = new Tab("1. Cinética Química (Ordem 0 e 1)", criarAbaCinetica());
        tabCinetica.setClosable(false);

        Tab tabMaxwell = new Tab("2. Distribuição de Maxwell-Boltzmann", criarAbaMaxwell());
        tabMaxwell.setClosable(false);

        Tab tabEnergia = new Tab("3. Energia de Ativação (Ea)", criarAbaEnergia());
        tabEnergia.setClosable(false);

        Tab tabDsc = new Tab("4. Calorimetria DSC (Lisozima)", criarAbaDsc());
        tabDsc.setClosable(false);

        Tab tabAjuda = new Tab("5. Fórmulas e Teoria", criarAbaAjuda());
        tabAjuda.setClosable(false);

        tabPane.getTabs().addAll(tabCinetica, tabMaxwell, tabEnergia, tabDsc, tabAjuda);

        Scene scene = new Scene(tabPane, 1050, 780);
        stage.setTitle("Plataforma Computacional de Físico-Química — Java 21");
        stage.setScene(scene);
        stage.show();
    }

    // ==========================================
    // 1. ABA DE CINÉTICA QUÍMICA
    // ==========================================
    private BorderPane criarAbaCinetica() {
        BorderPane layout = new BorderPane();

        RadioButton rbOrdemZero = new RadioButton("Ordem Zero ([A](t) = [A]₀ - kt)");
        RadioButton rbOrdemUm = new RadioButton("Primeira Ordem ([A](t) = [A]₀ e⁻ᵏᵗ)");
        ToggleGroup groupOrdem = new ToggleGroup();
        rbOrdemZero.setToggleGroup(groupOrdem);
        rbOrdemUm.setToggleGroup(groupOrdem);
        rbOrdemUm.setSelected(true);

        Slider sliderA0 = new Slider(0.05, 2.0, 1.0);
        sliderA0.setShowTickLabels(true);
        sliderA0.setShowTickMarks(true);
        sliderA0.setMajorTickUnit(0.5);

        Slider sliderK = new Slider(0.01, 0.20, 0.08);
        sliderK.setShowTickLabels(true);
        sliderK.setShowTickMarks(true);
        sliderK.setMajorTickUnit(0.05);

        Slider sliderTempo = new Slider(20.0, 200.0, 100.0);
        sliderTempo.setShowTickLabels(true);
        sliderTempo.setShowTickMarks(true);
        sliderTempo.setMajorTickUnit(50.0);

        Label lblInfo = new Label();
        lblInfo.setStyle("-fx-font-weight: bold; -fx-text-fill: #1a5276;");

        Button btnExportar = new Button("📥 Exportar Dados para CSV");
        btnExportar.setStyle("-fx-background-color: #2e86c1; -fx-text-fill: white; -fx-font-weight: bold;");

        SwingNode chartNode = new SwingNode();

        Runnable atualizar = () -> {
            boolean ordemUm = rbOrdemUm.isSelected();
            double a0 = sliderA0.getValue();
            double k = sliderK.getValue();
            double tMax = sliderTempo.getValue();

            ModeloCinetico modelo = ordemUm ? new ReacaoPrimeiraOrdem(a0, k) : new ReacaoOrdemZero(a0, k);
            XYChart chart = GraficoCinetica.criarGrafico(modelo, tMax, 1.0);

            if (ordemUm) {
                ReacaoPrimeiraOrdem r1 = (ReacaoPrimeiraOrdem) modelo;
                lblInfo.setText(String.format(
                        "Ordem 1 | [A]₀ = %.2f mol/L | k = %.3f s⁻¹ | Meia-vida (t₁/₂) = %.2f s | Lifetime (τ) = %.2f s",
                        a0, k, r1.primeiraMeiaVida(), r1.tempoVidaQuimico()));
            } else {
                ReacaoOrdemZero r0 = (ReacaoOrdemZero) modelo;
                lblInfo.setText(String.format(
                        "Ordem 0 | [A]₀ = %.2f mol/L | k = %.3f mol/(L·s) | 1ª Meia-vida = %.2f s | 2ª = %.2f s | 3ª = %.2f s | Consumo Total = %.2f s",
                        a0, k, r0.primeiraMeiaVida(), r0.segundaMeiaVida(), r0.terceiraMeiaVida(), r0.tempoConsumoTotal()));
            }

            SwingUtilities.invokeLater(() -> chartNode.setContent(new XChartPanel<>(chart)));
        };

        btnExportar.setOnAction(e -> {
            try {
                boolean ordemUm = rbOrdemUm.isSelected();
                double a0 = sliderA0.getValue();
                double k = sliderK.getValue();
                double tMax = sliderTempo.getValue();
                ModeloCinetico modelo = ordemUm ? new ReacaoPrimeiraOrdem(a0, k) : new ReacaoOrdemZero(a0, k);
                List<PontoConcentracao> pontos = GeradorDadosCinetica.gerarPontos(modelo, tMax, 1.0);

                List<String> linhas = new ArrayList<>();
                for (PontoConcentracao p : pontos) {
                    linhas.add(ExportadorCsv.formatarLinhaTresColunas(p.tempo(), p.concentracaoA(), p.concentracaoB()));
                }

                FileChooser fileChooser = new FileChooser();
                fileChooser.setTitle("Salvar Cinética em CSV");
                fileChooser.setInitialFileName("cinetica_quimica.csv");
                fileChooser.getExtensionFilters().add(new FileChooser.ExtensionFilter("CSV Files (*.csv)", "*.csv"));
                File file = fileChooser.showSaveDialog(primaryStage);
                if (file != null) {
                    ExportadorCsv.exportarParaCsv(file.getAbsolutePath(), "Tempo_s,Concentracao_A_mol_L,Concentracao_B_mol_L", linhas);
                    new Alert(Alert.AlertType.INFORMATION, "Dados exportados com sucesso para:\n" + file.getAbsolutePath()).show();
                }
            } catch (IOException ex) {
                new Alert(Alert.AlertType.ERROR, "Erro ao exportar CSV: " + ex.getMessage()).show();
            }
        });

        rbOrdemZero.setOnAction(e -> atualizar.run());
        rbOrdemUm.setOnAction(e -> atualizar.run());
        sliderA0.valueProperty().addListener((obs, o, n) -> atualizar.run());
        sliderK.valueProperty().addListener((obs, o, n) -> atualizar.run());
        sliderTempo.valueProperty().addListener((obs, o, n) -> atualizar.run());

        HBox radioBox = new HBox(20, new Label("Modelo:"), rbOrdemUm, rbOrdemZero);
        VBox painelControles = new VBox(
                8,
                radioBox,
                new Label("Concentração Inicial [A]₀ (mol/L):"),
                sliderA0,
                new Label("Constante de Velocidade (k):"),
                sliderK,
                new Label("Tempo Máximo de Simulação (s):"),
                sliderTempo,
                lblInfo,
                btnExportar);
        painelControles.setPadding(new Insets(12));
        painelControles.setStyle("-fx-background-color: #f8f9f9; -fx-border-color: #d5dbdb; -fx-border-width: 0 0 1 0;");

        layout.setTop(painelControles);
        layout.setCenter(chartNode);

        atualizar.run();
        return layout;
    }

    // ==========================================
    // 2. ABA DE MAXWELL-BOLTZMANN
    // ==========================================
    private BorderPane criarAbaMaxwell() {
        BorderPane layout = new BorderPane();

        ComboBox<String> cbGases = new ComboBox<>();
        cbGases.getItems().addAll("Argônio (Ar)", "Oxigênio (O₂)", "Hélio (He)", "Hidrogênio (H₂)", "Nitrogênio (N₂)", "Comparar Todos", "Gás Customizado");
        cbGases.setValue("Argônio (Ar)");

        TextField txtNomeCustom = new TextField("Gás X");
        txtNomeCustom.setPromptText("Nome");
        TextField txtMassaCustom = new TextField("0.044"); // ex: CO2 em kg/mol
        txtMassaCustom.setPromptText("Massa (kg/mol)");
        TextField txtGamaCustom = new TextField("1.30");
        txtGamaCustom.setPromptText("γ");

        HBox boxCustom = new HBox(8, new Label("Nome:"), txtNomeCustom, new Label("M (kg/mol):"), txtMassaCustom, new Label("γ:"), txtGamaCustom);
        boxCustom.setVisible(false);
        boxCustom.setManaged(false);

        Slider sliderTemp = new Slider(25.0, 1200.0, 298.15);
        sliderTemp.setShowTickLabels(true);
        sliderTemp.setShowTickMarks(true);
        sliderTemp.setMajorTickUnit(200.0);

        Label lblValores = new Label();
        lblValores.setStyle("-fx-font-weight: bold; -fx-text-fill: #117864;");

        Button btnExportar = new Button("📥 Exportar Distribuição (CSV)");
        btnExportar.setStyle("-fx-background-color: #16a085; -fx-text-fill: white; -fx-font-weight: bold;");

        SwingNode chartNode = new SwingNode();

        Runnable atualizar = () -> {
            double temp = sliderTemp.getValue();
            String escolha = cbGases.getValue();
            boxCustom.setVisible("Gás Customizado".equals(escolha));
            boxCustom.setManaged("Gás Customizado".equals(escolha));

            List<ClasseGas> listaGases = new ArrayList<>();
            if ("Comparar Todos".equals(escolha)) {
                for (Gas g : Gas.values()) {
                    listaGases.add(new ClasseGas(g));
                }
                lblValores.setText(String.format("Comparação simultânea de 5 gases a %.2f K", temp));
            } else if ("Gás Customizado".equals(escolha)) {
                try {
                    double m = Double.parseDouble(txtMassaCustom.getText());
                    double gama = Double.parseDouble(txtGamaCustom.getText());
                    ClasseGas custom = new ClasseGas(txtNomeCustom.getText(), m, gama);
                    listaGases.add(custom);
                    DistribuicaoMaxwellBoltzmann dist = new DistribuicaoMaxwellBoltzmann(custom, temp);
                    lblValores.setText(String.format(
                            "%s a %.2f K | v_mp = %.1f m/s | v_m = %.1f m/s | v_rms = %.1f m/s | c (som) = %.1f m/s",
                            custom.getNome(), temp, dist.velocidadeMaisProvavel(), dist.velocidadeMedia(), dist.velocidadeQuadraticaMedia(), dist.velocidadeDoSom()));
                } catch (Exception ex) {
                    lblValores.setText("Preencha valores numéricos válidos para o gás customizado");
                    return;
                }
            } else {
                Gas gasEscolhido = switch (escolha) {
                    case "Oxigênio (O₂)" -> Gas.OXIGENIO;
                    case "Hélio (He)" -> Gas.HELIO;
                    case "Hidrogênio (H₂)" -> Gas.HIDROGENIO;
                    case "Nitrogênio (N₂)" -> Gas.NITROGENIO;
                    default -> Gas.ARGONIO;
                };
                ClasseGas cg = new ClasseGas(gasEscolhido);
                listaGases.add(cg);
                DistribuicaoMaxwellBoltzmann dist = new DistribuicaoMaxwellBoltzmann(cg, temp);
                lblValores.setText(String.format(
                        "%s a %.2f K | v_mp = %.1f m/s | v_m = %.1f m/s | v_rms = %.1f m/s | c (som) = %.1f m/s",
                        cg.getNome(), temp, dist.velocidadeMaisProvavel(), dist.velocidadeMedia(), dist.velocidadeQuadraticaMedia(), dist.velocidadeDoSom()));
            }

            XYChart chart = GraficoMaxwellBoltzmann.criarGraficoComparativo(listaGases, temp);
            SwingUtilities.invokeLater(() -> chartNode.setContent(new XChartPanel<>(chart)));
        };

        btnExportar.setOnAction(e -> {
            try {
                double temp = sliderTemp.getValue();
                ClasseGas gas = new ClasseGas(Gas.ARGONIO);
                DistribuicaoMaxwellBoltzmann dist = new DistribuicaoMaxwellBoltzmann(gas, temp);
                List<PontoMaxwellBoltzmann> pontos = GeradorDadosMaxwell.gerarPontosVelocidade(dist, 0.0, 1600.0, 2.0);

                List<String> linhas = new ArrayList<>();
                for (PontoMaxwellBoltzmann p : pontos) {
                    linhas.add(ExportadorCsv.formatarLinhaDuasColunas(p.velocidade(), p.densidadeProbabilidade()));
                }

                FileChooser fileChooser = new FileChooser();
                fileChooser.setTitle("Salvar Distribuição Maxwell-Boltzmann em CSV");
                fileChooser.setInitialFileName("maxwell_boltzmann.csv");
                File file = fileChooser.showSaveDialog(primaryStage);
                if (file != null) {
                    ExportadorCsv.exportarParaCsv(file.getAbsolutePath(), "Velocidade_m_s,Densidade_Probabilidade_s_m", linhas);
                    new Alert(Alert.AlertType.INFORMATION, "Exportado com sucesso para:\n" + file.getAbsolutePath()).show();
                }
            } catch (Exception ex) {
                new Alert(Alert.AlertType.ERROR, "Erro ao exportar: " + ex.getMessage()).show();
            }
        });

        cbGases.setOnAction(e -> atualizar.run());
        sliderTemp.valueProperty().addListener((obs, o, n) -> atualizar.run());
        txtMassaCustom.setOnAction(e -> atualizar.run());
        txtGamaCustom.setOnAction(e -> atualizar.run());

        VBox controles = new VBox(
                8,
                new HBox(12, new Label("Gás:"), cbGases, btnExportar),
                boxCustom,
                new Label("Temperatura (K):"),
                sliderTemp,
                lblValores);
        controles.setPadding(new Insets(12));
        controles.setStyle("-fx-background-color: #e8f8f5; -fx-border-color: #a3e4d7; -fx-border-width: 0 0 1 0;");

        layout.setTop(controles);
        layout.setCenter(chartNode);

        atualizar.run();
        return layout;
    }

    // ==========================================
    // 3. ABA DE ENERGIA DE ATIVAÇÃO
    // ==========================================
    private BorderPane criarAbaEnergia() {
        BorderPane layout = new BorderPane();

        Slider sliderTemp = new Slider(100.0, 1200.0, 298.15);
        sliderTemp.setShowTickLabels(true);
        sliderTemp.setShowTickMarks(true);
        sliderTemp.setMajorTickUnit(200.0);

        Slider sliderEa = new Slider(5_000.0, 50_000.0, 20_000.0);
        sliderEa.setShowTickLabels(true);
        sliderEa.setShowTickMarks(true);
        sliderEa.setMajorTickUnit(10_000.0);

        Label lblResultado = new Label();
        lblResultado.setStyle("-fx-font-weight: bold; -fx-text-fill: #922b21;");

        SwingNode chartNode = new SwingNode();

        Runnable atualizar = () -> {
            double t = sliderTemp.getValue();
            double ea = sliderEa.getValue();
            ClasseGas gas = new ClasseGas(Gas.ARGONIO);
            DistribuicaoMaxwellBoltzmann dist = new DistribuicaoMaxwellBoltzmann(gas, t);

            double fracaoAtiva = ServicoIntegracaoNumerica.calcularFracaoMoleculasAcimaEa(dist, ea, 1000);
            double pct = fracaoAtiva * 100.0;

            lblResultado.setText(String.format(
                    "Temperatura: %.1f K | Ea: %.0f J/mol (%.1f kJ/mol) | Fração com E ≥ Ea: %.4f (%.2f%% das moléculas)",
                    t, ea, ea / 1000.0, fracaoAtiva, pct));

            XYChart chart = GraficoEnergiaCinetica.criarGraficoEnergia(gas, t, ea);
            SwingUtilities.invokeLater(() -> chartNode.setContent(new XChartPanel<>(chart)));
        };

        sliderTemp.valueProperty().addListener((obs, o, n) -> atualizar.run());
        sliderEa.valueProperty().addListener((obs, o, n) -> atualizar.run());

        VBox controles = new VBox(
                8,
                new Label("Temperatura (K):"),
                sliderTemp,
                new Label("Energia de Ativação Ea (J/mol):"),
                sliderEa,
                lblResultado);
        controles.setPadding(new Insets(12));
        controles.setStyle("-fx-background-color: #fdedec; -fx-border-color: #f5b7b1; -fx-border-width: 0 0 1 0;");

        layout.setTop(controles);
        layout.setCenter(chartNode);

        atualizar.run();
        return layout;
    }

    // ==========================================
    // 4. ABA DE DSC
    // ==========================================
    private BorderPane criarAbaDsc() {
        BorderPane layout = new BorderPane();

        ConjuntoDadosDsc dataset = DadosDscLisozima.obterDatasetLisozima();
        double integralTrap = AnaliseNumericaDsc.integrarPorTrapezio(dataset);
        double integralSimp = AnaliseNumericaDsc.integrarPorSimpson(dataset);
        double diffPct = Math.abs(integralSimp - integralTrap) / integralSimp * 100.0;

        Label lblInfo = new Label(String.format(
                "Amostra: %s (23 pontos) | ΔH_unf (Trapézio): %.2f kJ/mol | ΔH_unf (Simpson): %.2f kJ/mol | Dif: %.3f%%",
                dataset.getNomeAmostra(), integralTrap, integralSimp, diffPct));
        lblInfo.setStyle("-fx-font-weight: bold; -fx-text-fill: #2c3e50;");

        VBox topo = new VBox(8, lblInfo);
        topo.setPadding(new Insets(12));
        topo.setStyle("-fx-background-color: #ebedef; -fx-border-color: #bdc3c7; -fx-border-width: 0 0 1 0;");

        SwingNode chartNode = new SwingNode();
        XYChart chart = GraficoDsc.criarGraficoDsc(dataset);
        SwingUtilities.invokeLater(() -> chartNode.setContent(new XChartPanel<>(chart)));

        layout.setTop(topo);
        layout.setCenter(chartNode);

        return layout;
    }

    // ==========================================
    // 5. ABA DE TEORIA E AJUDA
    // ==========================================
    private ScrollPane criarAbaAjuda() {
        VBox conteudo = new VBox(14);
        conteudo.setPadding(new Insets(20));

        Label titulo = new Label("📘 Guia Teórico e Equações da Plataforma");
        titulo.setStyle("-fx-font-size: 18px; -fx-font-weight: bold; -fx-text-fill: #1a5276;");

        Label cinetica = new Label(
                "1. Cinética Química\n"
                + "• Ordem Zero: [A](t) = max(0, [A]₀ - kt), com t₁/₂ = [A]₀ / (2k). A velocidade é constante.\n"
                + "• Primeira Ordem: [A](t) = [A]₀·e⁻ᵏᵗ, com t₁/₂ = ln(2)/k e tempo de vida químico τ = 1/k.\n");
        cinetica.setWrapText(true);

        Label maxwell = new Label(
                "2. Teoria Cinética dos Gases e Maxwell-Boltzmann\n"
                + "• f(v) = 4π v² (M / (2π R T))^(3/2) exp(-M v² / (2 R T))\n"
                + "• v_mp = √(2RT / M)  <  v_m = √(8RT / πM)  <  v_rms = √(3RT / M)\n"
                + "• Velocidade do Som: c = √(γ R T / M), onde γ = Cp/Cv (1.67 para monoatômicos, 1.40 para diatômicos).\n"
                + "• Fração de Energia ≥ Ea calculada numericamente integrando f(E) por Simpson.");
        maxwell.setWrapText(true);

        Label integracao = new Label(
                "3. Métodos de Integração Numérica\n"
                + "• Regra do Trapézio: aproxima a área por trapézios lineares.\n"
                + "• Regra de Simpson 1/3: aproxima curvas por parábolas (ordem superior de precisão).\n"
                + "• Spline Cúbico Natural: garante continuidade de 1ª e 2ª derivadas para dados térmicos experimentais.");
        integracao.setWrapText(true);

        conteudo.getChildren().addAll(titulo, cinetica, maxwell, integracao);
        return new ScrollPane(conteudo);
    }

    public static void main(String[] args) {
        launch(args);
    }
}
