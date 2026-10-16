package com.unit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Ponto de entrada do backend Spring Boot.
 * O Spring Boot é um framework que facilita a criação de aplicações web em Java.
 * Ele inicia um servidor Tomcat embutido e configura o acesso ao banco de dados.
 */
@SpringBootApplication
public class FisicoQuimicaApplication {

    public static void main(String[] args) {
        // Inicia a aplicação web na porta 8080
        SpringApplication.run(FisicoQuimicaApplication.class, args);
    }
}
