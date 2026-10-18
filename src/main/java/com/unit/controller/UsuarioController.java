package com.unit.controller;

import com.unit.modelo.entidade.Usuario;
import com.unit.repositorio.UsuarioRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

/**
 * Controller REST pra cuidar de tudo dos usuarios: login, cadastro, XP, loja de insignias e ranking.
 * Adicionei tambem hash SHA-256 com Salt nas senhas pra nao ficar salvo em texto puro no banco!
 */
@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    // Salt fixo que eu concatenei antes de rodar o SHA-256 pra evitar ataques de Rainbow Table
    private static final String SALT_SEGURANCA = "LabQuantico_FisicoQuimica_Salt_2026!";

    @Autowired
    private UsuarioRepository repository;

    /**
     * Funcao auxiliar que transforma a senha normal num hash SHA-256 hexadecimal de 64 caracteres.
     * Fiz usando o MessageDigest nativo do Java pra nao precisar puxar dependencia pesada de fora.
     */
    public static String gerarHashSenha(String senhaPura) {
        if (senhaPura == null) return "";
        // Se ja estiver com cara de hash SHA-256 (64 chars hex), nao faz hash duas vezes
        if (senhaPura.matches("^[a-fA-F0-9]{64}$")) {
            return senhaPura.toLowerCase();
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest((SALT_SEGURANCA + senhaPura).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (Exception e) {
            // Se der algum erro bizarro no algoritmo, retorna um fallback seguro
            return Integer.toHexString((SALT_SEGURANCA + senhaPura).hashCode());
        }
    }

    /**
     * Compara a senha que o usuario digitou no login com a que esta salva no banco.
     * Deixei compativel tanto com o hash SHA-256 novo quanto com contas antigas de teste!
     */
    private boolean verificarSenha(String senhaDigitada, String senhaNoBanco) {
        if (senhaDigitada == null || senhaNoBanco == null) return false;
        String hashDigitado = gerarHashSenha(senhaDigitada);
        return hashDigitado.equalsIgnoreCase(senhaNoBanco) || senhaDigitada.equals(senhaNoBanco);
    }

    // Esse metodo roda sozinho quando o Spring sobe (@PostConstruct) e cria 3 cientistas famosos
    // caso o banco esteja zerado, pro ranking nao aparecer vazio na apresentacao pro professor!
    @PostConstruct
    public void semearCientistasHistoricosSeVazio() {
        try {
            if (repository.count() == 0) {
                String senhaPadraoHash = gerarHashSenha("123456");

                Usuario curie = new Usuario("Marie Sklodowska Curie", "curie@sorbonne.fr", senhaPadraoHash);
                curie.setExperiencia(1250);
                curie.setPontos(640);
                curie.setTitulo("Cientista Sênior");
                curie.setAvatarId("avatar_void");
                curie.setAvataresDesbloqueados("avatar_default,avatar_void,avatar_cyber");
                curie.setTitulosDesbloqueados("Iniciante da Termodinâmica,Aprendiz de Cinética,Pesquisador de Gases,Mestre da Termodinâmica,Alquimista Quântico,Cientista Sênior");
                curie.setExerciciosResolvidos("cin_01,cin_02,max_01,dsc_01");

                Usuario boltzmann = new Usuario("Ludwig Boltzmann", "boltzmann@vienna.at", senhaPadraoHash);
                boltzmann.setExperiencia(890);
                boltzmann.setPontos(420);
                boltzmann.setTitulo("Alquimista Quântico");
                boltzmann.setAvatarId("avatar_cyber");
                boltzmann.setAvataresDesbloqueados("avatar_default,avatar_cyber");
                boltzmann.setTitulosDesbloqueados("Iniciante da Termodinâmica,Aprendiz de Cinética,Pesquisador de Gases,Mestre da Termodinâmica,Alquimista Quântico");
                boltzmann.setExerciciosResolvidos("max_01,max_02,max_03");

                Usuario arrhenius = new Usuario("Svante Arrhenius", "arrhenius@uppsala.se", senhaPadraoHash);
                arrhenius.setExperiencia(540);
                arrhenius.setPontos(310);
                arrhenius.setTitulo("Mestre da Termodinâmica");
                arrhenius.setAvatarId("avatar_quantum");
                arrhenius.setAvataresDesbloqueados("avatar_default,avatar_quantum");
                arrhenius.setTitulosDesbloqueados("Iniciante da Termodinâmica,Aprendiz de Cinética,Pesquisador de Gases,Mestre da Termodinâmica");
                arrhenius.setExerciciosResolvidos("cin_01,cin_03");

                repository.saveAll(List.of(curie, boltzmann, arrhenius));
            }
        } catch (Exception ignored) {
            // Se o banco ainda estiver criando a tabela na primeira vez, ignora pra nao travar o boot
        }
    }

    @PostMapping("/cadastrar")
    public ResponseEntity<?> cadastrar(@RequestBody Usuario novoUsuario) {
        // Validacao basica pra nao deixar salvar campo nulo ou vazio
        if (novoUsuario.getEmail() == null || novoUsuario.getEmail().trim().isEmpty() ||
            novoUsuario.getSenha() == null || novoUsuario.getSenha().trim().isEmpty() ||
            novoUsuario.getNomeCompleto() == null || novoUsuario.getNomeCompleto().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("All fields (name, email, and password) are required! / Todos os campos são obrigatórios!");
        }

        if (novoUsuario.getSenha().trim().length() < 6) {
            return ResponseEntity.badRequest().body("Password must be at least 6 characters long! / A senha deve ter pelo menos 6 caracteres!");
        }

        String emailLimpo = novoUsuario.getEmail().trim().toLowerCase();
        if (repository.findByEmail(emailLimpo).isPresent()) {
            return ResponseEntity.badRequest().body("EMAIL_JA_CADASTRADO");
        }

        // Aqui aplico o hash SHA-256 na senha antes de mandar pro banco!
        novoUsuario.setNomeCompleto(novoUsuario.getNomeCompleto().trim());
        novoUsuario.setEmail(emailLimpo);
        novoUsuario.setSenha(gerarHashSenha(novoUsuario.getSenha()));
        novoUsuario.setExperiencia(0);
        novoUsuario.setPontos(100); // Dou 100 moedas de bonus inicial pro aluno ja conseguir testar as dicas ou a loja
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

        Optional<Usuario> usuarioOpt = repository.findByEmail(loginAttempt.getEmail().trim().toLowerCase());

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(404).body("EMAIL_NAO_CADASTRADO");
        }

        Usuario u = usuarioOpt.get();
        if (verificarSenha(loginAttempt.getSenha(), u.getSenha())) {
            // Se a senha no banco ainda era antiga (sem hash), ja atualizo pro hash novo automaticamente
            if (!u.getSenha().matches("^[a-fA-F0-9]{64}$")) {
                u.setSenha(gerarHashSenha(loginAttempt.getSenha()));
                repository.save(u);
            }
            return ResponseEntity.ok(u);
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
        // Busca todo mundo ordenado do maior XP pro menor
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
        String resolvidos = u.getExerciciosResolvidos();
        Set<String> set = new HashSet<>();
        if (resolvidos != null && !resolvidos.isEmpty()) {
            for (String item : resolvidos.split(",")) {
                if (!item.trim().isEmpty()) {
                    set.add(item.trim());
                }
            }
        }

        // Checo se o exercicio ja foi resolvido antes pra pessoa nao ficar farmando XP infinito na mesma questao
        boolean jaResolvido = exercicioId != null && !exercicioId.trim().isEmpty() && set.contains(exercicioId.trim());
        if (!jaResolvido && pontosXp > 0) {
            u.setExperiencia(u.getExperiencia() + pontosXp);
            u.setPontos(u.getPontos() + pontosXp);
        }

        if (exercicioId != null && !exercicioId.trim().isEmpty()) {
            set.add(exercicioId.trim());
            u.setExerciciosResolvidos(String.join(",", set));
        }

        // Atualiza a lista de titulos caso o aluno tenha subido de patamar de XP
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
            return ResponseEntity.badRequest().body("Badge already unlocked! / Avatar já adquirido!");
        }

        if (u.getPontos() < preco) {
            return ResponseEntity.badRequest().body("Insufficient coins! Solve more exercises. / Pontos insuficientes!");
        }

        u.setPontos(u.getPontos() - preco);
        set.add(avatarId);
        u.setAvataresDesbloqueados(String.join(",", set));
        u.setAvatarId(avatarId); // Ja equipa automaticamente pra facilitar a vida do usuario

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
            return ResponseEntity.badRequest().body("Insufficient coins! / Pontos insuficientes!");
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
            return ResponseEntity.badRequest().body("Badge not unlocked yet! / Você ainda não desbloqueou este avatar!");
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
            return ResponseEntity.badRequest().body("Title not unlocked yet! / Você ainda não desbloqueou este título!");
        }

        u.setTitulo(titulo);
        repository.save(u);
        return ResponseEntity.ok(u);
    }

    // Regra de progressao: conforme o XP sobe, vou liberando os titulos cientificos na conta do aluno
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
