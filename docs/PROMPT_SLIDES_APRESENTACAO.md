# PROMPT ESTRUTURADO PARA GERAÇÃO DE SLIDES DE APRESENTAÇÃO
**Instrução de Uso:** Copie e cole este prompt completo em ferramentas de IA como Gamma App, ChatGPT, Claude, Canva ou PowerPoint para gerar uma apresentação profissional de alto impacto.

---

```markdown
Crie uma apresentação acadêmica de alto nível (formato 16:9, design moderno, limpo e profissional com tons de azul marinho, ciano e branco) sobre o projeto: "Reimplementação de Cadernos Interativos de Físico-Química em Java: Desenvolvimento de uma Plataforma Computacional Orientada a Objetos".

A apresentação deve conter 10 slides estruturados exatamente da seguinte forma:

---
### SLIDE 1: Capa
- **Título:** Plataforma Computacional de Físico-Química em Java
- **Subtítulo:** Da Modelagem Científica em Python à Engenharia de Software Orientada a Objetos
- **Autores:** Artur Guedes e Colaboradores
- **Instituição:** Universidade Tiradentes (UNIT)
- **Artigo de Referência:** Bravenec & Ward (Journal of Chemical Education, 2023)

---
### SLIDE 2: Introdução e Motivação
- **Contexto:** Importância crescente do pensamento computacional nas ciências exatas e químicas.
- **O Problema Original:** O artigo de Bravenec & Ward utilizou notebooks Python/Colab para o ensino remoto na pandemia, mas faltava uma arquitetura de software compilada, modular e orientada a objetos.
- **A Proposta:** Reimplementar em Java 21, garantindo rigor físico, validação numérica exata, interfaces interativas e uma versão web gamificada.

---
### SLIDE 3: Objetivos do Projeto
- **Objetivo Geral:** Reconstruir os modelos científicos dos notebooks Python em uma aplicação Java robusta, modular, com validação numérica e recursos visuais em tempo real.
- **Objetivos Específicos:**
  1. Modelar Cinética de Ordem Zero e 1ª Ordem com cálculo analítico de meias-vidas e $\tau$;
  2. Implementar a Distribuição de Maxwell-Boltzmann de Velocidades e Energias de Ativação ($E_a$);
  3. Desenvolver motor de Integração Numérica (Trapézio e Simpson 1/3) aplicado a gases e DSC;
  4. Aplicar rigorosamente os 4 pilares da Programação Orientada a Objetos (POO);
  5. Demonstrar equivalência numérica Python × Java com erro relativo $< 0{,}001\%$.

---
### SLIDE 4: Arquitetura do Sistema e Pilares de POO
- **Arquitetura em Camadas:**
  - `com.unit.modelo`: Entidades físico-químicas puras e imutáveis.
  - `com.unit.numerico`: Algoritmos numéricos (Trapézio, Simpson, geradores).
  - `com.unit.ui`: Interfaces gráficas (JavaFX + XChart com SwingNode).
  - `com.unit.util`: Validadores defensivos e exportador CSV.
- **Os 4 Pilares de POO Aplicados:**
  - **Abstração:** Isolamento das equações físico-químicas das camadas de visualização.
  - **Encapsulamento:** Atributos privados e métodos de validação contra `NaN` e valores negativos.
  - **Herança:** Extensão da hierarquia do JavaFX e estruturas de dados.
  - **Polimorfismo:** Interface `ModeloCinetico` implementada por `ReacaoOrdemZero` e `ReacaoPrimeiraOrdem`, permitindo tratamento uniforme no gerador de curvas.

---
### SLIDE 5: Módulo 1 — Cinética Química
- **Ordem Zero:** $[A](t) = \max(0, [A]_0 - kt)$, com dependência direta da meia-vida em relação a $[A]_0$ ($t_{1/2} = [A]_0/2k$). Trava física contra concentrações negativas.
- **Primeira Ordem:** $[A](t) = [A]_0 e^{-kt}$, com meia-vida constante ($t_{1/2} = \ln(2)/k$) e tempo de vida químico $\tau = 1/k$.
- **Demonstração Gráfica:** Sliders dinâmicos de $[A]_0$ e $k$, com curvas de reagente e produto e marcação pontilhada das meias-vidas.

---
### SLIDE 6: Módulo 2 — Teoria Cinética e Maxwell-Boltzmann
- **Equação de Densidade:** $f(v) = 4\pi v^2 (M/2\pi RT)^{3/2} \exp(-Mv^2 / 2RT)$.
- **Velocidades Características:**
  - $v_{mp} = \sqrt{2RT/M} < v_m = \sqrt{8RT/\pi M} < v_{rms} = \sqrt{3RT/M}$
  - Velocidade do Som no meio gasoso: $c = \sqrt{\gamma RT/M}$.
- **Energia de Ativação:** Gráfico $f(E)$ destacando a população com $E \ge E_a$ integrada por Simpson.

---
### SLIDE 7: Módulo 3 — Métodos de Integração Numérica e DSC
- **Serviço de Integração Reutilizável:**
  - Regra do Trapézio: para passos não-uniformes.
  - Regra de Simpson 1/3 Composta: precisão parabólica de ordem superior.
- **Aplicação Térmica (Calorimetria DSC da Lisozima):**
  - Integração da capacidade calorífica excessiva ($C_p$) para obtenção da entalpia de desnaturação $\Delta H = 248{,}12\text{ kJ/mol}$.
  - Interpolação por Spline Cúbico Natural.

---
### SLIDE 8: Validação Numérica Rigorosa (Python × Java)
- **Fórmula do Erro Relativo:** $\varepsilon_r = |x_{Java} - x_{Python}| / x_{Python} \times 100\%$.
- **Resultados:**
  - Meias-vidas e velocidades características: **Erro relativo de 0.000000%** (equivalência perfeita IEEE 754).
  - Integração da curva de Maxwell-Boltzmann ($v \in [0, 4000\text{ m/s}]$): **Área de 0.999999 (Erro de 0.0001%)**.
  - Entalpia DSC por Simpson: **248.12 kJ/mol (Erro de 0.0000%)**.

---
### SLIDE 9: Diferenciais e Melhorias Implementadas
- **1. Comparação Simultânea & Gás Personalizado:** Visualização de múltiplos gases e cadastro com massa molar e $\gamma$ customizados.
- **2. Exportação de Dados em CSV:** Download direto dos dados simulados para Excel/Origin.
- **3. Plataforma Web Gamificada:** Sistema de XP, Níveis, Badges desbloqueáveis e Quizzes de desafio em HTML5/Canvas.
- **4. Suíte de Testes Automatizados:** 100% de cobertura nos requisitos físicos com JUnit 5.

---
### SLIDE 10: Conclusão
- Reconstrução completa, moderna e fiel aos modelos físico-químicos originais.
- Código 100% em português, documentado em normas ABNT e modularizado em Java 21.
- Plataforma pronta para uso acadêmico, aulas de laboratório e demonstrações interativas.
- **Agradecimentos e Perguntas.**
```
