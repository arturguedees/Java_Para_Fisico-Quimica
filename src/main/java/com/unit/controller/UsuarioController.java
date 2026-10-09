package com.unit.controller;

import com.unit.modelo.entidade.Usuario;
import com.unit.repositorio.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Controlador REST de Usuários e Gamificação.
 * Gerencia autenticação, experiência, loja de avatares animados, títulos e ranking.
 */
@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioRepository repository;

    @PostMapping("/cadastrar")
    public ResponseEntity<?> cadastrar(@RequestBody Usuario novoUsuario) {
        if (novoUsuario.getEmail() == null || novoUsuario.getEmail().trim().isEmpty() ||
            novoUsuario.getSenha() == null || novoUsuario.getSenha().trim().isEmpty() ||
            novoUsuario.getNomeCompleto() == null || novoUsuario.getNomeCompleto().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Todos os campos (nome, email e senha) são obrigatórios!");
        }

        if (repository.findByEmail(novoUsuario.getEmail().trim().toLowerCase()).isPresent()) {
            return ResponseEntity.badRequest().body("Email já cadastrado!");
        }

        novoUsuario.setEmail(novoUsuario.getEmail().trim().toLowerCase());
        novoUsuario.setExperiencia(0);
        novoUsuario.setPontos(100); // Bônus de boas-vindas de 100 pontos para começar!
        novoUsuario.setTitulo("Iniciante da Termodinâmica");
        novoUsuario.setAvatarId("avatar_default");
        novoUsuario.setAvataresDesbloqueados("avatar_default");
        novoUsuario.setTitulosDesbloqueados("Iniciante da Termodinâmica");
        novoUsuario.setExerciciosResolvidos("");

        Usuario salvo = repository.save(novoUsuario);
        return ResponseEntity.ok(salvo);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario loginAttempt) {
        if (loginAttempt.getEmail() == null || loginAttempt.getSenha() == null) {
            return ResponseEntity.badRequest().body("Informe email e senha.");
        }

        Optional<Usuario> usuario = repository.findByEmail(loginAttempt.getEmail().trim().toLowerCase());

        if (usuario.isEmpty()) {
            return ResponseEntity.status(404).body("EMAIL_NAO_CADASTRADO");
        }

        if (usuario.get().getSenha().equals(loginAttempt.getSenha())) {
            return ResponseEntity.ok(usuario.get());
        }

        return ResponseEntity.status(401).body("SENHA_INCORRETA");
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> buscarPerfil(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/ranking")
    public ResponseEntity<List<Map<String, Object>>> obterRanking() {
        List<Usuario> lista = repository.findAllByOrderByExperienciaDesc();
        List<Map<String, Object>> ranking = new ArrayList<>();
        
        int posicao = 1;
        for (Usuario u : lista) {
            Map<String, Object> item = new HashMap<>();
            item.put("posicao", posicao++);
            item.put("id", u.getId());
            item.put("nomeCompleto", u.getNomeCompleto());
            item.put("titulo", u.getTitulo());
            item.put("avatarId", u.getAvatarId());
            item.put("experiencia", u.getExperiencia());
            item.put("pontos", u.getPontos());
            ranking.add(item);
        }
        return ResponseEntity.ok(ranking);
    }

    @PostMapping("/{id}/ganhar-xp")
    public ResponseEntity<Usuario> ganharXp(@PathVariable Long id, 
                                           @RequestParam int pontosXp,
                                           @RequestParam(required = false) String exercicioId) {
        Optional<Usuario> usuarioOpt = repository.findById(id);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Usuario u = usuarioOpt.get();
        u.setExperiencia(u.getExperiencia() + pontosXp);
        u.setPontos(u.getPontos() + pontosXp);

        // Registra o exercício resolvido se enviado
        if (exercicioId != null && !exercicioId.trim().isEmpty()) {
            String resolvidos = u.getExerciciosResolvidos();
            if (resolvidos == null || resolvidos.isEmpty()) {
                u.setExerciciosResolvidos(exercicioId);
            } else {
                Set<String> set = new HashSet<>(Arrays.asList(resolvidos.split(",")));
                set.add(exercicioId);
                u.setExerciciosResolvidos(String.join(",", set));
            }
        }

        // Títulos desbloqueados automaticamente por nível de XP
        verificarEAtualizarTitulosPorXp(u);

        repository.save(u);
        return ResponseEntity.ok(u);
    }

    @PostMapping("/{id}/comprar-avatar")
    public ResponseEntity<?> comprarAvatar(@PathVariable Long id, 
                                           @RequestParam String avatarId, 
                                           @RequestParam int preco) {
        Optional<Usuario> usuarioOpt = repository.findById(id);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Usuario u = usuarioOpt.get();
        String avatares = u.getAvataresDesbloqueados() != null ? u.getAvataresDesbloqueados() : "avatar_default";
        Set<String> set = new HashSet<>(Arrays.asList(avatares.split(",")));

        if (set.contains(avatarId)) {
            return ResponseEntity.badRequest().body("Avatar já adquirido!");
        }

        if (u.getPontos() < preco) {
            return ResponseEntity.badRequest().body("Pontos insuficientes! Resolva mais exercícios.");
        }

        u.setPontos(u.getPontos() - preco);
        set.add(avatarId);
        u.setAvataresDesbloqueados(String.join(",", set));
        u.setAvatarId(avatarId); // Auto equipa o novo avatar

        repository.save(u);
        return ResponseEntity.ok(u);
    }

    @PostMapping("/{id}/descontar-pontos")
    public ResponseEntity<?> descontarPontos(@PathVariable Long id, @RequestParam int pontos) {
        Optional<Usuario> usuarioOpt = repository.findById(id);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Usuario u = usuarioOpt.get();
        if (u.getPontos() < pontos) {
            return ResponseEntity.badRequest().body("Pontos insuficientes para esta ação!");
        }

        u.setPontos(u.getPontos() - pontos);
        repository.save(u);
        return ResponseEntity.ok(u);
    }

    @PostMapping("/{id}/equipar-avatar")
    public ResponseEntity<?> equiparAvatar(@PathVariable Long id, @RequestParam String avatarId) {
        Optional<Usuario> usuarioOpt = repository.findById(id);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Usuario u = usuarioOpt.get();
        String avatares = u.getAvataresDesbloqueados() != null ? u.getAvataresDesbloqueados() : "avatar_default";
        Set<String> set = new HashSet<>(Arrays.asList(avatares.split(",")));

        if (!set.contains(avatarId) && !avatarId.equals("avatar_default")) {
            return ResponseEntity.badRequest().body("Você ainda não desbloqueou este avatar!");
        }

        u.setAvatarId(avatarId);
        repository.save(u);
        return ResponseEntity.ok(u);
    }

    @PostMapping("/{id}/equipar-titulo")
    public ResponseEntity<?> equiparTitulo(@PathVariable Long id, @RequestParam String titulo) {
        Optional<Usuario> usuarioOpt = repository.findById(id);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Usuario u = usuarioOpt.get();
        String titulos = u.getTitulosDesbloqueados() != null ? u.getTitulosDesbloqueados() : "Iniciante da Termodinâmica";
        Set<String> set = new HashSet<>(Arrays.asList(titulos.split(",")));

        if (!set.contains(titulo)) {
            return ResponseEntity.badRequest().body("Você ainda não desbloqueou este título!");
        }

        u.setTitulo(titulo);
        repository.save(u);
        return ResponseEntity.ok(u);
    }

    private void verificarEAtualizarTitulosPorXp(Usuario u) {
        String titulosStr = u.getTitulosDesbloqueados() != null ? u.getTitulosDesbloqueados() : "Iniciante da Termodinâmica";
        Set<String> titulos = new HashSet<>(Arrays.asList(titulosStr.split(",")));

        if (u.getExperiencia() >= 50) titulos.add("Aprendiz de Cinética");
        if (u.getExperiencia() >= 150) titulos.add("Pesquisador de Gases");
        if (u.getExperiencia() >= 300) titulos.add("Mestre da Termodinâmica");
        if (u.getExperiencia() >= 600) titulos.add("Alquimista Quântico");
        if (u.getExperiencia() >= 1000) titulos.add("Cientista Sênior");
        if (u.getExperiencia() >= 2000) titulos.add("Prêmio Nobel da Físico-Química");

        u.setTitulosDesbloqueados(String.join(",", titulos));
    }
}
