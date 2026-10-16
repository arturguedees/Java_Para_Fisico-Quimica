package com.unit.modelo.entidade;

import jakarta.persistence.*;

/**
 * Entidade Usuario mapeada para tabela PostgreSQL com Spring Data JPA (Hibernate).
 * Contém os campos de autenticação e toda a estrutura de gamificação (XP, Pontos, Título, Avatar, Inventário).
 */
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
    private String senha;

    // Gamificação e Progressão
    private int pontos = 0;
    private int experiencia = 0;

    @Column(length = 100)
    private String titulo = "Iniciante";

    @Column(length = 100)
    private String avatarId = "avatar_default";

    @Column(columnDefinition = "TEXT")
    private String avataresDesbloqueados = "avatar_default";

    @Column(columnDefinition = "TEXT")
    private String titulosDesbloqueados = "Iniciante";

    @Column(columnDefinition = "TEXT")
    private String exerciciosResolvidos = "";

    public Usuario() {
    }

    public Usuario(String nomeCompleto, String email, String senha) {
        this.nomeCompleto = nomeCompleto;
        this.email = email;
        this.senha = senha;
        this.pontos = 0;
        this.experiencia = 0;
        this.titulo = "Iniciante";
        this.avatarId = "avatar_default";
        this.avataresDesbloqueados = "avatar_default";
        this.titulosDesbloqueados = "Iniciante";
        this.exerciciosResolvidos = "";
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomeCompleto() {
        return nomeCompleto;
    }

    public void setNomeCompleto(String nomeCompleto) {
        this.nomeCompleto = nomeCompleto;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public int getPontos() {
        return pontos;
    }

    public void setPontos(int pontos) {
        this.pontos = pontos;
    }

    public int getExperiencia() {
        return experiencia;
    }

    public void setExperiencia(int experiencia) {
        this.experiencia = experiencia;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getAvatarId() {
        return avatarId;
    }

    public void setAvatarId(String avatarId) {
        this.avatarId = avatarId;
    }

    public String getAvataresDesbloqueados() {
        return avataresDesbloqueados;
    }

    public void setAvataresDesbloqueados(String avataresDesbloqueados) {
        this.avataresDesbloqueados = avataresDesbloqueados;
    }

    public String getTitulosDesbloqueados() {
        return titulosDesbloqueados;
    }

    public void setTitulosDesbloqueados(String titulosDesbloqueados) {
        this.titulosDesbloqueados = titulosDesbloqueados;
    }

    public String getExerciciosResolvidos() {
        return exerciciosResolvidos;
    }

    public void setExerciciosResolvidos(String exerciciosResolvidos) {
        this.exerciciosResolvidos = exerciciosResolvidos;
    }
}
