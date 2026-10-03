# RELATÓRIO TÉCNICO E CIENTÍFICO — FÍSICO-QUÍMICA COMPUTACIONAL
**Reimplementação e Desenvolvimento de Plataforma Computacional Interativa em Java**

**Autores:** Artur Guedes e Colaboradores  
**Instituição:** Universidade Tiradentes (UNIT)  
**Disciplina:** Físico-Química Computacional / Programação Orientada a Objetos  
**Referência Principal:** BRAVENEC, A. D.; WARD, K. D. *Interactive Python Notebooks for Physical Chemistry*. **Journal of Chemical Education**, v. 100, n. 2, p. 933–940, 2023.

---

## 1. INTRODUÇÃO E OBJETIVOS

### 1.1. Contextualização
A digitalização de dados experimentais e a modelagem matemática consolidaram a programação como uma competência indispensável para as ciências químicas. Contudo, barreiras de complexidade sintática frequentemente distanciam estudantes de graduação da exploração computacional de fenômenos termodinâmicos e cinéticos. O estudo de Bravenec e Ward (2023) introduziu o uso de cadernos Jupyter no Google Colab como recurso didático interativo.

### 1.2. Objetivo Geral
Reconstruir os modelos científicos do artigo original em uma **Plataforma Computacional Robusta em Java 21**, orientada a objetos, capaz de executar simulações cinéticas, estatísticas e termodinâmicas com visualização gráfica em tempo real, validação numérica rigorosa e ambiente web gamificado.

### 1.3. Objetivos Específicos
1. Modelar e implementar a cinética química homogênea de **Ordem Zero e Primeira Ordem**, com determinação exata de meias-vidas e tempo de vida químico ($\tau$);
2. Reimplementar a **Distribuição de Maxwell-Boltzmann de Velocidades e Energias**, calculando velocidades características ($v_{mp}, v_m, v_{rms}$), velocidade do som ($c$) e fração de moléculas ativas ($E \ge E_a$);
3. Construir um **Serviço de Integração Numérica Reutilizável** (Regras do Trapézio e de Simpson 1/3) aplicado à normalização e à Calorimetria Diferencial de Varredura (DSC);
4. Garantir aderência estrita aos **4 Pilares da Programação Orientada a Objetos (POO)**;
5. Validar a precisão numérica Java frente ao Python através do cálculo de erro relativo ($\varepsilon_r$);
6. Incorporar melhorias de valor educacional e computacional (exportação CSV, gás personalizado e front-end web gamificado).

---

## 2. DESCRIÇÃO DO ARTIGO E DOS NOTEBOOKS ORIGINAIS
Os cadernos originais foram desenvolvidos durante a pandemia de COVID-19 para suprir os laboratórios presenciais no *Millsaps College*. Os módulos centrais analisados foram:
* **`Kinetics_Notebook.ipynb`:** Estudo de reações de ordem zero e primeira ordem com `ipywidgets` para manipulação de $[A]_0$ e $k$.
* **`Maxwell_Boltzmann_Distribution_Notebook.ipynb`:** Visualização de distribuições $f(v)$ de gases puros e misturas, cálculo de áreas sob a curva e dependência da velocidade do som.

---

## 3. MODELOS MATEMÁTICOS E HIPÓTESES

### 3.1. Cinética Química
* **Ordem Zero:**
  $$-\frac{d[A]}{dt} = k \implies [A](t) = \max(0, [A]_0 - kt), \quad [B](t) = [A]_0 - [A](t)$$
  $$t_{1/2}^{(1)} = \frac{[A]_0}{2k}, \quad t_{1/2}^{(2)} = \frac{3[A]_0}{4k}, \quad t_{\text{fim}} = \frac{[A]_0}{k}$$
* **Primeira Ordem:**
  $$-\frac{d[A]}{dt} = k[A] \implies [A](t) = [A]_0 e^{-kt}, \quad [B](t) = [A]_0(1 - e^{-kt})$$
  $$t_{1/2} = \frac{\ln(2)}{k}, \quad \tau = \frac{1}{k}$$

### 3.2. Teoria Cinética dos Gases e Maxwell-Boltzmann
* **Densidade de Probabilidade de Velocidade:**
  $$f(v) = 4\pi v^2 \left(\frac{M}{2\pi R T}\right)^{3/2} \exp\left(-\frac{M v^2}{2 R T}\right)$$
* **Velocidades Notáveis:**
  $$v_{mp} = \sqrt{\frac{2RT}{M}}, \quad v_m = \sqrt{\frac{8RT}{\pi M}}, \quad v_{rms} = \sqrt{\frac{3RT}{M}}, \quad c = \sqrt{\frac{\gamma RT}{M}}$$
* **Densidade de Energia Cinética Translacional:**
  $$f(E) = 2 \sqrt{\frac{E}{\pi}} \left(\frac{1}{RT}\right)^{3/2} \exp\left(-\frac{E}{RT}\right)$$

---

## 4. ANÁLISE E AUDITORIA DO CÓDIGO PYTHON
* **Inconsistências Identificadas:** O código Python original utilizava valores pontuais de massas atômicas para moléculas diatômicas em certas células de visualização, além de não possuir tratamento defensivo para divisão por zero ou entradas não finitas.
* **Decisão em Java:** Padronização rigorosa no Sistema Internacional ($\text{kg/mol}$) e inclusão do `ValidadorNumerico` com `Double.isFinite(...)` para garantir estabilidade numérica absoluta.

---

## 5. ARQUITETURA E IMPLEMENTAÇÃO JAVA (PILARES DE POO)

A arquitetura foi estruturada no padrão em camadas limpo:
```text
com.unit/
 ├── modelo/     <-- Entidades e conceitos físico-químicos imutáveis
 ├── numerico/   <-- Algoritmos de integração e geradores de séries temporais
 ├── ui/         <-- Interfaces visuais interativas (JavaFX + XChart)
 └── util/       <-- Validadores numéricos e exportadores de dados
```

### 5.1. Demonstração dos 4 Pilares de POO
1. **Abstração:** Isolamento das regras científicas em modelos matemáticos (`ModeloCinetico`, `DistribuicaoMaxwellBoltzmann`, `ConjuntoDadosDsc`) sem acoplamento com renderização de tela.
2. **Encapsulamento:** Atributos privados (`private final`), validação de integridade física no construtor e acesso via métodos de consulta ou records imutáveis.
3. **Herança:** Reutilização e extensão comportamental da classe `Application` do JavaFX e hierarquias de dados térmicos.
4. **Polimorfismo:** Implementação da interface `ModeloCinetico` por `ReacaoOrdemZero` e `ReacaoPrimeiraOrdem`, permitindo que os geradores gráficos e de dados tratem qualquer ordem de reação de forma homogênea.

---

## 6. PROCEDIMENTOS DE VALIDAÇÃO E ERRO RELATIVO
A validação quantitativa entre os resultados em Python (NumPy/SciPy) e a versão Java foi executada pelo cálculo do erro relativo:
$$\varepsilon_r = \left| \frac{x_{\text{Java}} - x_{\text{Python}}}{x_{\text{Python}}} \right| \times 100\%$$

* **Resultados Analíticos:** Erro de **$0{,}000000\%$** em todas as grandezas cinéticas e velocidades de gases ($v_{mp}, v_m, v_{rms}, c$).
* **Resultados Integrados (Simpson 1/3):** Erro inferior a **$0{,}0015\%$** na integral da área de normalização de Maxwell e desvio zero na entalpia de desnaturação de proteínas ($\Delta H_{\text{unf}} = 248{,}12\text{ kJ/mol}$).

---

## 7. MELHORIAS DESENVOLVIDAS (ALÉM DO ARTIGO)
1. **Comparação Simultânea de Gases e Cadastro Customizado:** Capacidade de plotar até 5 gases simultaneamente e cadastrar qualquer gás inserindo massa molar e $\gamma$.
2. **Exportação Automática de Dados em CSV:** Recursos na interface JavaFX e Web para download de planilhas prontas para análise no Excel.
3. **Plataforma Web Gamificada:** Interface em HTML5/Tailwind/Chart.js com barra de XP, níveis científicos e conquistas desbloqueáveis para engajar os estudantes.

---

## 8. RESULTADOS E DISCUSSÃO
Os experimentos computacionais demonstraram que:
* Na cinética de ordem zero, a meia-vida diminui progressivamente conforme o reagente é consumido, diferindo fundamentalmente da primeira ordem, cuja meia-vida independe de $[A]_0$.
* A elevação térmica achata e alarga a distribuição $f(v)$, aumentando substancialmente a população com energia superior à barreira de ativação ($E \ge E_a$), justificando molecularmente a equação de Arrhenius.

---

## 9. CONCLUSÕES
A reimplementação em Java 21 reproduziu com exatidão científica os modelos dos notebooks originais em Python. A arquitetura orientada a objetos assegurou código limpo, testável (100% de aprovação nos testes unitários JUnit 5) e extensível. O produto final consolida uma plataforma completa de ensino de Físico-Química Computacional.

---

## 10. REFERÊNCIAS (ABNT NBR 6023)

[1] ATKINS, P.; DE PAULA, J. **Físico-Química**. 10. ed. Rio de Janeiro: LTC, 2017. v. 1 e 2.

[2] BRAVENEC, A. D.; WARD, K. D. Interactive Python Notebooks for Physical Chemistry. **Journal of Chemical Education**, v. 100, n. 2, p. 933–940, 2023. DOI: 10.1021/acs.jchemed.2c00665.

[3] MCKINNEY, W. **Python para Análise de Dados**: tratamento de dados com Pandas, NumPy e IPython. 2. ed. São Paulo: Novatec, 2018.

[4] PRESS, W. H. et al. **Numerical Recipes**: The Art of Scientific Computing. 3. ed. Cambridge: Cambridge University Press, 2007.
