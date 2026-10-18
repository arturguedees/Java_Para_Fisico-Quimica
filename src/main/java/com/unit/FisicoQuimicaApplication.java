package com.unit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Classe principal que sobe o servidor Spring Boot da nossa API de Fisico-Quimica.
 * Ela ja inicia o Tomcat embutido na porta 8080 e conecta no banco automaticamente!
 */
@SpringBootApplication
public class FisicoQuimicaApplication {

    public static void main(String[] args) {
        // Roda a aplicacao Spring Boot passando os argumentos do terminal
        SpringApplication.run(FisicoQuimicaApplication.class, args);
    }
}
