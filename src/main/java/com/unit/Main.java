package com.unit;

import java.awt.Desktop;
import java.io.File;
import java.util.Locale;
import java.util.Scanner;

import com.unit.modelo.ClasseGas;
import com.unit.modelo.Gas;
import com.unit.modelo.ReacaoOrdemZero;
import com.unit.modelo.ReacaoPrimeiraOrdem;
import com.unit.numerico.CalculadoraMaxwell;
import com.unit.ui.PlataformaFisicoQuimicaApp;

public class Main {
    public static void main(String[] args) {
        Locale.setDefault(Locale.US);
        Scanner scan = new Scanner(System.in);
        CalculadoraMaxwell calculadora = new CalculadoraMaxwell();
        ClasseGas argonio = new ClasseGas(Gas.ARGONIO);

        double tempRef = 298.15; // 25°C em Kelvin

        System.out.println("===============================================================");
        System.out.println("  PLATAFORMA COMPUTACIONAL DE FÍSICO-QUÍMICA (JAVA 21 / POO)   ");
        System.out.println("===============================================================");
        System.out.printf("🔹 Exemplo: Gás %s (M = %.5f kg/mol, γ = %.2f) a %.2f K:%n",
                argonio.getNome(), argonio.getMassaMolarKgPorMol(), argonio.getCoeficienteAdiabatico(), tempRef);
        System.out.printf("   • Velocidade Mais Provável (v_mp):          %.2f m/s%n", calculadora.calcularVelocidadeMaisProvavel(argonio, tempRef));
        System.out.printf("   • Velocidade Média (v_m):                   %.2f m/s%n", calculadora.calcularVelocidadeMedia(argonio, tempRef));
        System.out.printf("   • Velocidade Quadrática Média (v_rms):      %.2f m/s%n", calculadora.calcularVelocidadeQuadraticaMedia(argonio, tempRef));
        System.out.printf("   • Velocidade do Som no Gás (c):             %.2f m/s%n", calculadora.calcularVelocidadeDoSom(argonio, tempRef));
        System.out.printf("   • Probabilidade v ∈ [0, 800 m/s]:           %.2f%%%n", calculadora.calcularProbabilidadeIntervalo(argonio, tempRef, 0.0, 800.0) * 100.0);
        System.out.printf("   • Fração com Energia ≥ 20.000 J/mol:        %.2f%%%n", calculadora.calcularFracaoEnergiaAtivacao(argonio, tempRef, 20_000.0) * 100.0);

        ReacaoOrdemZero r0 = new ReacaoOrdemZero(1.0, 0.05);
        ReacaoPrimeiraOrdem r1 = new ReacaoPrimeiraOrdem(1.0, 0.08);
        System.out.println("\n🔹 Cinética Química Comparativa ([A]₀ = 1.0 mol/L):");
        System.out.printf("   • Ordem Zero (k = 0.05):       t₁/₂ = %.2f s | Consumo Total = %.2f s%n", r0.primeiraMeiaVida(), r0.tempoConsumoTotal());
        System.out.printf("   • Primeira Ordem (k = 0.08):   t₁/₂ = %.2f s | Lifetime (τ) = %.2f s%n", r1.primeiraMeiaVida(), r1.tempoVidaQuimico());
        System.out.println("===============================================================");

        System.out.println("\nEscolha como deseja interagir:");
        System.out.println("1 - Abrir a Interface Gráfica Unificada (JavaFX + Sliders + CSV)");
        System.out.println("2 - Abrir a Plataforma Web Gamificada (Navegador)");
        System.out.println("3 - Simular Cinética no Console");
        System.out.println("4 - Simular Gás Customizado no Console");
        System.out.println("0 - Sair");
        System.out.print("\nOpção: ");

        if (scan.hasNextInt()) {
            int op = scan.nextInt();
            switch (op) {
                case 1 -> PlataformaFisicoQuimicaApp.main(args);
                case 2 -> abrirPlataformaWeb();
                case 3 -> {
                    System.out.print("Escolha a ordem (0 ou 1): ");
                    int ordem = scan.nextInt();
                    System.out.print("Concentração inicial [A]₀ (mol/L): ");
                    double a0 = scan.nextDouble();
                    System.out.print("Constante k: ");
                    double k = scan.nextDouble();
                    if (ordem == 0) {
                        ReacaoOrdemZero custom0 = new ReacaoOrdemZero(a0, k);
                        System.out.printf("Resultados Ordem 0: 1ª Meia-vida = %.2f s | 2ª = %.2f s | Fim = %.2f s%n",
                                custom0.primeiraMeiaVida(), custom0.segundaMeiaVida(), custom0.tempoConsumoTotal());
                    } else {
                        ReacaoPrimeiraOrdem custom1 = new ReacaoPrimeiraOrdem(a0, k);
                        System.out.printf("Resultados Ordem 1: Meia-vida = %.2f s | Lifetime (τ) = %.2f s%n",
                                custom1.primeiraMeiaVida(), custom1.tempoVidaQuimico());
                    }
                }
                case 4 -> {
                    scan.nextLine();
                    System.out.print("Nome do gás: ");
                    String nome = scan.nextLine();
                    System.out.print("Massa molar em kg/mol (ex: 0.044 para CO2): ");
                    double m = scan.nextDouble();
                    System.out.print("Coeficiente adiabático γ (ex: 1.30): ");
                    double gama = scan.nextDouble();
                    System.out.print("Temperatura (K): ");
                    double t = scan.nextDouble();

                    ClasseGas gasCustom = new ClasseGas(nome, m, gama);
                    System.out.printf("%nResultados para %s a %.2f K:%n", gasCustom.getNome(), t);
                    System.out.printf("  • v_mp = %.2f m/s | v_m = %.2f m/s | v_rms = %.2f m/s | c_som = %.2f m/s%n",
                            calculadora.calcularVelocidadeMaisProvavel(gasCustom, t),
                            calculadora.calcularVelocidadeMedia(gasCustom, t),
                            calculadora.calcularVelocidadeQuadraticaMedia(gasCustom, t),
                            calculadora.calcularVelocidadeDoSom(gasCustom, t));
                }
                default -> System.out.println("Encerrando aplicação. Bons estudos!");
            }
        }
    }

    private static void abrirPlataformaWeb() {
        try {
            File arquivoHtml = new File("web/index.html");
            if (arquivoHtml.exists() && Desktop.isDesktopSupported()) {
                Desktop.getDesktop().open(arquivoHtml);
                System.out.println("Plataforma web aberta no seu navegador padrão: " + arquivoHtml.getAbsolutePath());
            } else {
                System.out.println("Arquivo web/index.html disponível para abertura manual no navegador.");
            }
        } catch (Exception ex) {
            System.err.println("Não foi possível abrir o navegador automaticamente: " + ex.getMessage());
        }
    }
}
