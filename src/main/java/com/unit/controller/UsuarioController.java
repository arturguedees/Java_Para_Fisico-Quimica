package com.unit.controller;

import com.unit.modelo.entidade.Usuario;
import com.unit.repositorio.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * Controlador de Usuários (API REST).
 * Aqui é onde o frontend (React) fará as requisições HTTP (GET, POST).
 * A anotação @CrossOrigin permite que o React rodando na porta 5173 consiga se conectar ao Java na porta 8080.
 */
@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*") // Permite acesso do frontend
public class UsuarioController {

    @Autowired
    private UsuarioRepository repository;

    @PostMapping("/cadastrar")
    public ResponseEntity<?> cadastrar(@RequestBody Usuario novoUsuario) {
        // Verifica se o email já existe
        if (repository.findByEmail(novoUsuario.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email já cadastrado!");
        }
        
        // Regra de Gamificação Inicial
        novoUsuario.setExperiencia(0);
        novoUsuario.setPontos(0);
        novoUsuario.setTitulo("Iniciante");

        // Salva no banco de dados (PostgreSQL)
        Usuario salvo = repository.save(novoUsuario);
        return ResponseEntity.ok(salvo);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario loginAttempt) {
        Optional<Usuario> usuario = repository.findByEmail(loginAttempt.getEmail());
        
        // Verifica se o usuário existe e se a senha está correta
        // OBS para o Dev Jr: Em produção, NUNCA comparamos senhas em texto puro, sempre usamos Hashes como BCrypt!
        if (usuario.isPresent() && usuario.get().getSenha().equals(loginAttempt.getSenha())) {
            return ResponseEntity.ok(usuario.get());
        }
        return ResponseEntity.status(401).body("Email ou senha inválidos.");
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> buscarPerfil(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/ganhar-xp")
    public ResponseEntity<Usuario> ganharXp(@PathVariable Long id, @RequestParam int pontosXp) {
        Optional<Usuario> usuarioOpt = repository.findById(id);
        
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Usuario u = usuarioOpt.get();
        // Adiciona experiência e pontos na carteira
        u.setExperiencia(u.getExperiencia() + pontosXp);
        u.setPontos(u.getPontos() + pontosXp); // Cada XP ganha rende 1 ponto de loja

        // Lógica simples de progressão de nível/títulos
        if (u.getExperiencia() >= 1000) {
            u.setTitulo("Mestre da Físico-Química");
        } else if (u.getExperiencia() >= 500) {
            u.setTitulo("Expert");
        } else if (u.getExperiencia() >= 200) {
            u.setTitulo("Pesquisador Intermediário");
        } else if (u.getExperiencia() >= 50) {
            u.setTitulo("Aprendiz");
        }

        repository.save(u);
        return ResponseEntity.ok(u);
    }
}
