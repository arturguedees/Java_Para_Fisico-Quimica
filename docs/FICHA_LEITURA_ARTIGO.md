# FICHA DE LEITURA CIENTÍFICA DO ARTIGO
**Referência:** BRAVENEC, A. D.; WARD, K. D. *Interactive Python Notebooks for Physical Chemistry*. **Journal of Chemical Education**, v. 100, n. 2, p. 933–940, 2023. DOI: `10.1021/acs.jchemed.2c00665`.

---

## 1. Objetivo do Trabalho
Desenvolver, aplicar e avaliar uma suíte de cadernos interativos em Python (Jupyter Notebooks hospedados no Google Colab) integrados a uma disciplina de Físico-Química de graduação durante o ensino remoto emergencial da pandemia de COVID-19, proporcionando uma introdução suave e prática à programação científica e à visualização dinâmica de dados para estudantes sem experiência prévia em computação.

## 2. Fenômenos Físico-Químicos Abordados
1. **Cinética Química de Reações Homogêneas:**
   - Leis integradas de velocidade para reações de ordem zero e primeira ordem ($A \rightarrow B$).
   - Tempo de meia-vida ($t_{1/2}$), tempo de vida químico ($\tau$) e tempo de decaimento $e$-folding.
2. **Teoria Cinética dos Gases e Distribuição de Maxwell-Boltzmann:**
   - Distribuição contínua de velocidades moleculares $f(v)$ e normalização ($\int_0^\infty f(v)dv = 1$).
   - Velocidades características: mais provável ($v_{mp}$), média ($v_m$) e quadrática média ($v_{rms}$).
   - Efeito da temperatura absoluta e da massa molar na dispersão das velocidades.
   - Distribuição de energia cinética translacional $f(E)$ e fração de partículas ativas ($E \ge E_a$).
   - Velocidade do som em gases em função da temperatura e do coeficiente adiabático ($\gamma = C_p/C_v$).
3. **Termodinâmica e Calorimetria:**
   - Curvas de Calorimetria Diferencial de Varredura (DSC) para desnaturação térmica da proteína Lisozima.
   - Integração da capacidade calorífica em excesso para determinação da entalpia de transição ($\Delta H$).

## 3. Parâmetros que o Estudante Pode Alterar
* **Cinética:** Concentração inicial $[A]_0$ ($0{,}0$ a $2{,}0\text{ mol/L}$), constante de velocidade $k$ ($0{,}01$ a $0{,}20\text{ s}^{-1}$ ou $\text{mol/(L}\cdot\text{s)}$), e tempo de observação.
* **Gases:** Temperatura ($25\text{ K}$ a $1200\text{ K}$), seleção de gases ($\text{Ar}, \text{O}_2, \text{He}, \text{H}_2, \text{N}_2$) e criação de gases arbitrários (massa molar e $\gamma$).
* **Energia:** Energia de ativação $E_a$ ($5$ a $50\text{ kJ/mol}$).

## 4. Resultados Apresentados Numerica e Graficamente
* **Gráficos:** Curvas dinâmicas de decaimento/formação de espécies, curvas de densidade de probabilidade $f(v)$ e $f(E)$ com áreas sombreadas, e picos de transição de fase térmica.
* **Valores Numéricos:** $t_{1/2}$, $\tau$, $v_{mp}$, $v_m$, $v_{rms}$, $c$ (velocidade do som), porcentagens de moléculas em faixas de velocidade e áreas integradas.

## 5. Hipóteses, Unidades e Limitações dos Modelos
* **Hipóteses:** Comportamento de gás ideal (partículas pontuais sem forças intermoleculares atrativas/repulsivas); distribuição em equilíbrio térmico.
* **Unidades (SI):**
  * Temperatura: Kelvin ($\text{K}$);
  * Massa molar: Quilogramas por mol ($\text{kg/mol}$);
  * Constante dos gases: $R = 8{,}314462618\text{ J/(mol}\cdot\text{K)}$;
  * Concentração: $\text{mol/L}$;
  * Velocidade: $\text{m/s}$;
  * Energia: $\text{J/mol}$ ou $\text{kJ/mol}$.
* **Limitações:** Em pressões extremamente elevadas ou temperaturas muito baixas, os desvios da idealidade (equação de Van der Waals) se tornam relevantes.

## 6. Contribuição da Interatividade para a Aprendizagem
A manipulação em tempo real de botões deslizantes (*sliders*) permitiu que os estudantes associassem instantaneamente a mudança nas variáveis termodinâmicas com o comportamento microscópico das moléculas, eliminando a barreira puramente algébrica e promovendo a internalização dos conceitos por exploração visual ativa.
