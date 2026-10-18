package com.unit.modelo.entidade;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

/**
 * Classe de entidade que representa o aluno/pesquisador na tabela "usuarios" do banco.
 * Eu usei o Spring Data JPA (@Entity) pra mapear os atributos direto pras colunas do Postgres/H2,
 * juntando tanto a parte de login quanto a parte de gamificacao (XP, moedas, insignias e titulos).
 */
@Entity
@Table(name = "usuarios")
public class Usuario {

    // Chave primaria que aumenta sozinha (auto-incremento no banco)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nomeCompleto;

    // O email tem que ser unique=true pra nao deixar dois alunos criarem conta com o mesmo email
    @Column(nullable = false, unique = true, length = 100)
    private String email;

    // Aprendi em seguranca web que nunca podemos devolver a senha no JSON da API!
    // Com WRITE_ONLY, o Spring consegue ler a senha quando o usuario faz login/cadastro,
    // mas nunca coloca o campo "senha" na resposta que volta pro navegador.
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String senha;

    // Variaveis de gamificacao: o aluno comeca zerado de XP e no titulo inicial
    private int pontos = 0;
    private int experiencia = 0;

    @Column(length = 100)
    private String titulo = "Iniciante da Termodinâmica";

    @Column(length = 100)
    private String avatarId = "avatar_default";

    // Guardo os itens desbloqueados separados por virgula numa String TEXT pra ficar mais simples
    // de salvar sem precisar criar varias tabelas de relacionamento N:N agora
    @Column(columnDefinition = "TEXT")
    private String avataresDesbloqueados = "avatar_default";

    @Column(columnDefinition = "TEXT")
    private String titulosDesbloqueados = "Iniciante da Termodinâmica";

    @Column(columnDefinition = "TEXT")
    private String exerciciosResolvidos = "";

    // Construtor vazio obrigatorio pro Hibernate conseguir instanciar a classe via reflexao
    public Usuario() {
    }

    public Usuario(String nomeCompleto, String email, String senha) {
        this.nomeCompleto = nomeCompleto;
        this.email = email;
        this.senha = senha;
        this.pontos = 0;
        this.experiencia = 0;
        this.titulo = "Iniciante da Termodinâmica";
        this.avatarId = "avatar_default";
        this.avataresDesbloqueados = "avatar_default";
        this.titulosDesbloqueados = "Iniciante da Termodinâmica";
        this.exerciciosResolvidos = "";
    }

    // Getters e Setters padrao do Java pra acessar os campos privados (encapsulamento)
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
