package com.unit;

import java.util.Locale;
import java.util.Scanner;

import com.unit.model.ClasseGas;
import com.unit.numerical.CalculadoraMaxwell;
import com.unit.ui.FirstOrderKineticsInteractiveApp;
import com.unit.ui.LysozymeDscDemo;
import com.unit.ui.MaxwellBoltzmannInteractiveApp;

public class Main {
    public static void main(String[] args) {
        Locale.setDefault(Locale.US);
        Scanner scan = new Scanner(System.in);
        ClasseGas argonio = new ClasseGas("Argônio", 0.039948, 1.67);
        CalculadoraMaxwell calculadora = new CalculadoraMaxwell();

        double temperatura = 298.15; // 25°C em Kelvin

        System.out.println("==================================================");
        System.out.println("   PROJETO: FÍSICO-QUÍMICA COMPUTACIONAL (JAVA)   ");
        System.out.println("==================================================");
        System.out.printf("Cálculo demonstrativo para o gás %s a %.2f K (25°C):%n", argonio.getNome(), temperatura);
        System.out.printf("  • Velocidade mais provável (v_mp):          %.2f m/s%n",
                calculadora.calcularVelocidadeMaisProvavel(argonio, temperatura));
        System.out.printf("  • Velocidade média (v_media):               %.2f m/s%n",
                calculadora.calcularVelocidadeMedia(argonio, temperatura));
        System.out.printf("  • Velocidade quadrática média (v_rms):      %.2f m/s%n",
                calculadora.calcularVelocidadeQuadraticaMedia(argonio, temperatura));
        System.out.printf("  • Velocidade do som no gás (c):             %.2f m/s%n",
                calculadora.calcularVelocidadeDoSom(argonio, temperatura));
        System.out.println("==================================================");

        System.out.println("\nEscolha uma opção para executar:");
        System.out.println("1 - Testar outro gás e temperatura via console");
        System.out.println("2 - Abrir App Gráfico: Distribuição de Maxwell-Boltzmann (com Sliders)");
        System.out.println("3 - Abrir App Gráfico: Cinética Química de 1ª Ordem (com Sliders)");
        System.out.println("4 - Abrir App Gráfico: Calorimetria DSC (Curva da Lisozima)");
        System.out.println("0 - Sair");
        System.out.print("\nOpção: ");

        if (scan.hasNextInt()) {
            int opcao = scan.nextInt();
            switch (opcao) {
                case 1 -> {
                    scan.nextLine(); // consome quebra de linha
                    System.out.print("Nome do gás: ");
                    String nome = scan.nextLine();
                    System.out.print("Massa molar em kg/mol (ex: 0.028 para N2): ");
                    double massa = scan.nextDouble();
                    System.out.print("Coeficiente adiabático γ (ex: 1.40): ");
                    double gama = scan.nextDouble();
                    System.out.print("Temperatura em Kelvin (ex: 300): ");
                    double t = scan.nextDouble();

                    ClasseGas gasCustom = new ClasseGas(nome, massa, gama);
                    System.out.printf("%nResultados para %s a %.2f K:%n", gasCustom.getNome(), t);
                    System.out.printf("  • v_mp:    %.2f m/s%n", calculadora.calcularVelocidadeMaisProvavel(gasCustom, t));
                    System.out.printf("  • v_media: %.2f m/s%n", calculadora.calcularVelocidadeMedia(gasCustom, t));
                    System.out.printf("  • v_rms:   %.2f m/s%n", calculadora.calcularVelocidadeQuadraticaMedia(gasCustom, t));
                    System.out.printf("  • c (som): %.2f m/s%n", calculadora.calcularVelocidadeDoSom(gasCustom, t));
                }
                case 2 -> MaxwellBoltzmannInteractiveApp.main(args);
                case 3 -> FirstOrderKineticsInteractiveApp.main(args);
                case 4 -> LysozymeDscDemo.main(args);
                default -> System.out.println("Saindo do programa. Bons estudos!");
            }
        }
    }
}