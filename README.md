# 🧪 Plataforma Computacional de Físico-Química (Java 21)

> **Reimplementação Orientada a Objetos dos Cadernos Interativos de Físico-Química**  
> *Baseado no artigo de Ardith D. Bravenec & Karen D. Ward (Journal of Chemical Education, 2023)*

---

## 🌟 Visão Geral do Projeto
Esta plataforma foi desenvolvida como parte da disciplina de **Físico-Química Computacional / Programação Orientada a Objetos**. O projeto reconstruiu os modelos científicos de cinéticas de reações e teoria cinética dos gases em **Java 21**, com suporte a **JavaFX**, **XChart**, **Apache Commons Math**, **JUnit 5** e uma **versão Web Gamificada**.

---

## 🚀 Funcionalidades Implementadas

### 1. ⏱️ Cinética Química (Ordem Zero e Primeira Ordem)
* **Ordem Zero ($A \rightarrow B$):** $[A](t) = \max(0, [A]_0 - kt)$, com cálculo analítico de $1ª, 2ª, 3ª$ meias-vidas e tempo de consumo total.
* **Primeira Ordem ($A \rightarrow B$):** $[A](t) = [A]_0 e^{-kt}$, com cálculo de meia-vida ($t_{1/2} = \ln(2)/k$) e tempo de vida químico / decaimento $e$-folding ($\tau = 1/k$).
* **Interface Gráfica com Sliders:** Controle em tempo real de $[A]_0$, $k$ e tempo de simulação.

### 2. 💨 Teoria Cinética dos Gases e Maxwell-Boltzmann
* **Curva de Densidade $f(v)$:** Normalizada e calculada em domínio logarítmico contra *overflow*.
* **Velocidades Notáveis:** Mais provável ($v_{mp}$), média ($v_m$), quadrática média ($v_{rms}$) e velocidade do som ($c$).
* **Energia de Ativação ($E_a$):** Distribuição $f(E)$ e integração da fração de moléculas com $E \ge E_a$.
* **Gás Personalizado e Comparação Simultânea:** Comparação de múltiplos gases ($\text{Ar}, \text{O}_2, \text{He}, \text{H}_2, \text{N}_2$) e cadastro customizado de massa molar e $\gamma$.

### 3. 🔬 Integração Numérica e Calorimetria DSC
* **Serviço Reutilizável:** Métodos da **Regra do Trapézio** e **Regra de Simpson 1/3 Composta**.
* **Proteína Lisozima:** 23 pontos experimentais de capacidade calorífica ($C_p$), ajuste por **Spline Cúbico Natural** e cálculo de entalpia de desnaturação ($\Delta H$).

### 4. 🎮 Plataforma Web Gamificada
* Dashboard interativo em HTML5/Tailwind com sistema de **XP**, **Níveis de Pesquisador**, **Badges Desbloqueáveis** e **Quiz Científico**.

### 5. 📥 Exportação de Dados em CSV
* Botão em todas as telas para download direto dos dados numéricos simulados em `.csv`.

---

## 🏛️ Arquitetura do Software (Pilares de POO)

O projeto está estruturado em pacotes limpos e com nomes 100% em português:

```text
com.unit/
 ├── Main.java                         <-- Ponto de entrada com menu no console
 │
 ├── modelo/                           <-- Entidades e conceitos físico-químicos
 │    ├── ModeloCinetico.java          (Interface polimórfica)
 │    ├── ReacaoOrdemZero.java         (Cinética de ordem 0)
 │    ├── ReacaoPrimeiraOrdem.java     (Cinética de ordem 1)
 │    ├── ClasseGas.java               (Entidade do gás com massa em kg/mol e γ)
 │    ├── Gas.java                     (Enum com gases padrão)
 │    ├── DistribuicaoMaxwellBoltzmann.java (Distribuição f(v) e f(E))
 │    ├── ConjuntoDadosDsc.java        (Dados de calorimetria)
 │    └── DadosDscLisozima.java        (Dataset da Lisozima)
 │
 ├── numerico/                         <-- Algoritmos de cálculo e integração
 │    ├── ServicoIntegracaoNumerica.java (Trapézio e Simpson 1/3)
 │    ├── CalculadoraMaxwell.java      (Velocidades e energias)
 │    ├── GeradorDadosCinetica.java    (Séries temporais de concentração)
 │    ├── GeradorDadosMaxwell.java     (Séries de velocidade e energia)
 │    └── AnaliseNumericaDsc.java      (Integração térmica e splines)
 │
 ├── ui/                               <-- Interfaces gráficas (JavaFX + XChart)
 │    ├── PlataformaFisicoQuimicaApp.java (App Unificado com Abas e Sliders)
 │    ├── GraficoCinetica.java
 │    ├── GraficoMaxwellBoltzmann.java
 │    ├── GraficoEnergiaCinetica.java
 │    └── GraficoDsc.java
 │
 └── util/                             <-- Utilitários
      ├── ConstantesFisicas.java
      ├── ValidadorNumerico.java       (Proteção contra NaN e infinitos)
      └── ExportadorCsv.java           (Exportação para planilhas)
```

---

## 🛠️ Como Executar

### 1. Execução no Console / Menu Geral
Abra o projeto na sua IDE (IntelliJ IDEA, Eclipse ou VS Code) e execute a classe:
```bash
com.unit.Main
```

### 2. Execução da Interface Gráfica JavaFX
Execute a classe:
```bash
com.unit.ui.PlataformaFisicoQuimicaApp
```

### 3. Abertura da Plataforma Web Gamificada
Basta dar dois cliques no arquivo:
```bash
web/index.html
```
*(Uma cópia também foi salva na sua pasta `Downloads` para acesso imediato).*

---

## 🧪 Testes Unitários
Para rodar a suíte completa de testes no JUnit 5:
```bash
mvn test
```

---

## 📂 Documentos Acadêmicos Disponíveis na Pasta `docs/`
* 📄 [`RELATORIO_TECNICO_ABNT.md`](docs/RELATORIO_TECNICO_ABNT.md) — Relatório acadêmico completo em normas ABNT.
* 📋 [`FICHA_LEITURA_ARTIGO.md`](docs/FICHA_LEITURA_ARTIGO.md) — Ficha de leitura científica do artigo.
* 🗺️ [`MAPA_FUNCIONAL_PYTHON.md`](docs/MAPA_FUNCIONAL_PYTHON.md) — Mapeamento do código Python original.
* 📝 [`PSEUDOCODIGO_MODULOS.md`](docs/PSEUDOCODIGO_MODULOS.md) — Algoritmos e pseudocódigos estruturados.
* 📊 [`VALIDACAO_PYTHON_JAVA.md`](docs/VALIDACAO_PYTHON_JAVA.md) — Tabela comparativa com cálculo do erro relativo ($\varepsilon_r$).
* 🎤 [`PROMPT_SLIDES_APRESENTACAO.md`](docs/PROMPT_SLIDES_APRESENTACAO.md) — Prompt estruturado para geração dos slides da apresentação.
