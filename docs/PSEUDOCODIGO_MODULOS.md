# PSEUDOCÓDIGOS ESTRUTURADOS DOS MÓDULOS

---

## 1. Módulo de Cinética Química (Ordem Zero e Primeira Ordem)

```text
ALGORITMO SimularCineticaQuimica
ENTRADA: ordem (0 ou 1), concentracao_inicial (A0 > 0), constante_k (k > 0), tempo_final (t_max > 0), passo_tempo (dt > 0)
SAÍDA: lista_pontos (tempo, [A], [B]), t_meia_vida, t_lifetime

INÍCIO
    SE A0 <= 0 OU k <= 0 OU t_max <= 0 OU dt <= 0 ENTÃO
        RETORNAR ERRO "Parâmetros devem ser estritamente positivos"
    FIM SE

    SE ordem == 0 ENTÃO
        t_meia_vida = A0 / (2.0 * k)
        t_lifetime = A0 / k // Tempo de esgotamento total
    SENÃO
        t_meia_vida = ln(2.0) / k
        t_lifetime = 1.0 / k // Tau
    FIM SE

    tempo_atual = 0.0
    ENQUANTO tempo_atual <= t_max FAÇA
        SE ordem == 0 ENTÃO
            A_t = MAX(0.0, A0 - k * tempo_atual)
            B_t = A0 - A_t
        SENÃO
            A_t = A0 * EXP(-k * tempo_atual)
            B_t = A0 * (1.0 - EXP(-k * tempo_atual))
        FIM SE

        ARMANEZAR_PONTO(tempo_atual, A_t, B_t)
        tempo_atual = tempo_atual + dt
    FIM ENQUANTO

    PLOTAR_GRAFICO_LINHAS(lista_pontos, A_t="Vermelho", B_t="Azul")
    APRESENTAR_METRICAS(t_meia_vida, t_lifetime)
FIM
```

---

## 2. Módulo da Distribuição de Maxwell-Boltzmann e Velocidades

```text
ALGORITMO SimularMaxwellBoltzmann
ENTRADA: massa_molar_M (kg/mol), coeficiente_gama (γ), temperatura_T (Kelvin), v_max (m/s), passo_v (m/s)
SAÍDA: v_mp, v_m, v_rms, c_som, curva_densidade_f_v

INÍCIO
    SE M <= 0 OU T <= 0 OU γ <= 0 ENTÃO
        RETORNAR ERRO "Entradas termodinâmicas inválidas"
    FIM SE

    R = 8.314462618

    // Cálculo das Velocidades Características
    v_mp = SQRT(2.0 * R * T / M)
    v_m = SQRT(8.0 * R * T / (PI * M))
    v_rms = SQRT(3.0 * R * T / M)
    c_som = SQRT(γ * R * T / M)

    termo_normalizacao = 4.0 * PI * ((M / (2.0 * PI * R * T)) ^ 1.5)

    v_atual = 0.0
    ENQUANTO v_atual <= v_max FAÇA
        f_v = termo_normalizacao * (v_atual ^ 2) * EXP(-M * (v_atual ^ 2) / (2.0 * R * T))
        ARMAZENAR_COORDENADA(v_atual, f_v)
        v_atual = v_atual + passo_v
    FIM ENQUANTO

    APRESENTAR_GRAFICO(curva_densidade_f_v)
    EXIBIR_VALORES(v_mp, v_m, v_rms, c_som)
FIM
```

---

## 3. Módulo de Integração Numérica Reutilizável (Regra de Simpson 1/3)

```text
ALGORITMO IntegracaoSimpsonComposta
ENTRADA: funcao_f, limite_a, limite_b, numero_subintervalos_N (par)
SAÍDA: valor_area_integral

INÍCIO
    SE N é ímpar ENTÃO
        N = N + 1
    FIM SE

    h = (limite_b - limite_a) / N
    soma_pares = 0.0
    soma_impares = 0.0

    PARA i DE 1 ATÉ (N - 1) FAÇA
        x_i = limite_a + i * h
        SE (i MOD 2 == 0) ENTÃO
            soma_pares = soma_pares + funcao_f(x_i)
        SENÃO
            soma_impares = soma_impares + funcao_f(x_i)
        FIM SE
    FIM PARA

    area = (h / 3.0) * (funcao_f(limite_a) + 4.0 * soma_impares + 2.0 * soma_pares + funcao_f(limite_b))
    RETORNAR area
FIM
```
