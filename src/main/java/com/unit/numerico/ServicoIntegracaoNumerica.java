package com.unit.numerico;

import java.util.List;
import java.util.function.DoubleUnaryOperator;

import com.unit.modelo.DistribuicaoMaxwellBoltzmann;
import com.unit.util.ValidadorNumerico;

/**
 * Serviço unificado e reutilizável de Integração Numérica.
 * Implementa métodos do Trapézio e de Simpson para dados discretos e funções contínuas.
 */
public final class ServicoIntegracaoNumerica {

    private ServicoIntegracaoNumerica() {}

    /**
     * Integração pela Regra do Trapézio para arrays de pontos (suporta passos não-uniformes).
     */
    public static double integrarTrapezio(double[] x, double[] y) {
        if (x == null || y == null || x.length != y.length || x.length < 2) {
            throw new IllegalArgumentException("Arrays x e y devem ser não-nulos e conter pelo menos 2 pontos de mesmo tamanho");
        }
        double area = 0.0;
        for (int i = 1; i < x.length; i++) {
            double h = x[i] - x[i - 1];
            area += h * (y[i - 1] + y[i]) / 2.0;
        }
        return area;
    }

    /**
     * Integração pela Regra de Simpson 1/3 Composta para arrays de pontos com passo uniforme h.
     * Requer quantidade ímpar de pontos (número par de subintervalos).
     */
    public static double integrarSimpson(double[] x, double[] y) {
        if (x == null || y == null || x.length != y.length || x.length < 3) {
            throw new IllegalArgumentException("Simpson requer pelo menos 3 pontos");
        }
        int n = x.length - 1; // número de intervalos
        if (n % 2 != 0) {
            // Se número de intervalos for ímpar, integra n-1 com Simpson e o último com trapézio
            double[] xSub = new double[x.length - 1];
            double[] ySub = new double[y.length - 1];
            System.arraycopy(x, 0, xSub, 0, xSub.length);
            System.arraycopy(y, 0, ySub, 0, ySub.length);
            double simpsonParte = integrarSimpson(xSub, ySub);
            double trapUltimo = (x[n] - x[n - 1]) * (y[n - 1] + y[n]) / 2.0;
            return simpsonParte + trapUltimo;
        }

        double h = (x[n] - x[0]) / n;
        double somaPares = 0.0;
        double somaImpares = 0.0;

        for (int i = 1; i < n; i++) {
            if (i % 2 == 0) {
                somaPares += y[i];
            } else {
                somaImpares += y[i];
            }
        }

        return (h / 3.0) * (y[0] + 4.0 * somaImpares + 2.0 * somaPares + y[n]);
    }

    /**
     * Integração de função contínua f(x) pela Regra do Trapézio em [a, b] com N subintervalos.
     */
    public static double integrarFuncaoTrapezio(DoubleUnaryOperator funcao, double a, double b, int nSubintervalos) {
        ValidadorNumerico.validarIntervalo(a, b, "Limite inferior a", "Limite superior b");
        if (nSubintervalos < 1) {
            throw new IllegalArgumentException("O número de subintervalos deve ser >= 1");
        }
        double h = (b - a) / nSubintervalos;
        double soma = 0.5 * (funcao.applyAsDouble(a) + funcao.applyAsDouble(b));
        for (int i = 1; i < nSubintervalos; i++) {
            soma += funcao.applyAsDouble(a + i * h);
        }
        return soma * h;
    }

    /**
     * Integração de função contínua f(x) pela Regra de Simpson Composta em [a, b] com N subintervalos (N par).
     */
    public static double integrarFuncaoSimpson(DoubleUnaryOperator funcao, double a, double b, int nSubintervalos) {
        ValidadorNumerico.validarIntervalo(a, b, "Limite inferior a", "Limite superior b");
        int n = (nSubintervalos % 2 == 0) ? nSubintervalos : nSubintervalos + 1;
        double h = (b - a) / n;
        double somaImpares = 0.0;
        double somaPares = 0.0;

        for (int i = 1; i < n; i++) {
            double x = a + i * h;
            if (i % 2 == 0) {
                somaPares += funcao.applyAsDouble(x);
            } else {
                somaImpares += funcao.applyAsDouble(x);
            }
        }

        return (h / 3.0) * (funcao.applyAsDouble(a) + 4.0 * somaImpares + 2.0 * somaPares + funcao.applyAsDouble(b));
    }

    /**
     * Módulo 3 de Maxwell-Boltzmann: Normalização e probabilidade no intervalo [v1, v2].
     */
    public static double calcularProbabilidadeIntervaloVelocidades(DistribuicaoMaxwellBoltzmann dist, double v1, double v2, int nPassos) {
        return integrarFuncaoSimpson(dist::densidadeProbabilidadeVelocidade, v1, v2, nPassos);
    }

    /**
     * Módulo 4 de Maxwell-Boltzmann: Fração de moléculas com Energia Cinética >= Ea.
     */
    public static double calcularFracaoMoleculasAcimaEa(DistribuicaoMaxwellBoltzmann dist, double eaJPorMol, int nPassos) {
        ValidadorNumerico.validarNaoNegativo(eaJPorMol, "Energia de ativação Ea");
        // Limite superior suficiente onde f(E) decai para valores desprezíveis (ex: Ea + 15 * R * T)
        double limiteSuperior = Math.max(eaJPorMol + 100_000.0, eaJPorMol * 5.0);
        return integrarFuncaoSimpson(dist::densidadeProbabilidadeEnergia, eaJPorMol, limiteSuperior, nPassos);
    }
}
