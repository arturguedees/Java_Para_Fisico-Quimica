# MAPA FUNCIONAL DO CÓDIGO PYTHON ORIGINAL E EQUIVALÊNCIA JAVA

| Componente | Função no Código Python Original | Reimplementação na Plataforma Java |
| :--- | :--- | :--- |
| **Entrada de Parâmetros** | Variáveis em células e `ipywidgets.FloatSlider` | `javafx.scene.control.Slider` e `TextField` com validação de tipos |
| **Estruturas de Vetores** | `numpy.linspace()`, `numpy.arange()` e arrays | `double[]` primitivos, `List<Record>` imutáveis (`PontoConcentracao`, `PontoMaxwellBoltzmann`) |
| **Equações Cinéticas** | Funções matemáticas com operadores vetorizados NumPy | Classes `ReacaoOrdemZero` e `ReacaoPrimeiraOrdem` implementando `ModeloCinetico` |
| **Distribuição dos Gases** | $f(v)$ com `numpy.exp()` e `numpy.pi` | `DistribuicaoMaxwellBoltzmann` com normalização logarítmica contra overflow |
| **Integração Numérica** | `scipy.integrate.quad` e `scipy.integrate.simps` | `ServicoIntegracaoNumerica` (Trapézio e Simpson 1/3 compostos) e Apache Commons Math |
| **Visualização Gráfica** | `matplotlib.pyplot.plot()`, legendas e cores | `org.knowm.xchart.XYChart` estilizado e renderizado via `SwingNode` |
| **Interação Reativa** | `ipywidgets.interactive_output()` | Listeners JavaFX (`valueProperty().addListener(...)`) |
| **Exportação e Análise** | Não possuía exportação direta nativa nos notebooks | `ExportadorCsv` para salvar dados tabulados em `.csv` |
