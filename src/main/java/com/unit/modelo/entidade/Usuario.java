package com.unit.modelo.entidade;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidade Usuario. No Hibernate/JPA (nosso substituto do Prisma),
 * a anotação @Entity diz que essa classe vai virar uma tabela no banco de dados.
 */
@Data // Anotação do Lombok: cria Getters, Setters, toString, etc. automaticamente
@NoArgsConstructor // Lombok: cria o construtor vazio necessário para o JPA
@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nomeCompleto;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String senha; // futuramente usaremos BCrypt para criptografar

    // Sistema de Gamificação
    private int pontos = 0; // Moeda para comprar fotos
    private int experiencia = 0; // XP para subir de nível e ganhar títulos

    @Column(length = 50)
    private String titulo = "Iniciante"; // Iniciante, Intermediário, Expert, Mestre

    private String fotoPerfilUrl; // URL ou nome do arquivo da foto desbloqueada
}
