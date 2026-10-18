package com.unit.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.unit.modelo.entidade.Usuario;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes unitarios para validar as melhorias de seguranca (hash SHA-256 + WRITE_ONLY)
 * e a internacionalizacao bilingue (EN padrao / PT) do QuizController.
 *
 * Comentario de dev junior:
 * Criei esses testes para ter 100% de certeza de que:
 * 1) A senha do usuario nunca vaza no JSON quando o Spring serializa o objeto Usuario;
 * 2) O hash SHA-256 funciona de forma deterministica e nunca guarda texto puro;
 * 3) O banco de questoes responde tanto em Ingles (padrao) quanto em Portugues!
 */
class SegurancaEQuizControllerTest {

    @Test
    @DisplayName("Deve gerar hash SHA-256 deterministico com salt e nao manter texto puro")
    void deveGerarHashSenhaSha256() {
        String senhaPura = "MinhaSenhaQuimica123!";
        String hash1 = UsuarioController.gerarHashSenha(senhaPura);
        String hash2 = UsuarioController.gerarHashSenha(senhaPura);

        assertNotNull(hash1);
        assertTrue(hash1.startsWith("sha256:"), "O hash deve possuir o prefixo sha256:");
        assertNotEquals(senhaPura, hash1, "O hash nunca pode ser igual a senha em texto puro");
        assertEquals(hash1, hash2, "A mesma senha deve produzir o mesmo hash deterministico");
        assertEquals(7 + 64, hash1.length(), "Prefixo 'sha256:' (7) + 64 caracteres hexadecimais");
    }

    @Test
    @DisplayName("Nao deve serializar o campo senha no JSON de saida (WRITE_ONLY), mas deve permitir leitura no JSON de entrada")
    void naoDeveSerializarSenhaNoJsonDeSaida() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        Usuario u = new Usuario("Marie Curie", "marie@sorbonne.fr", "sha256:segredo123");
        u.setId(42L);

        String jsonSaida = mapper.writeValueAsString(u);
        assertFalse(jsonSaida.contains("senha"), "O JSON serializado nao deve conter a chave 'senha'");
        assertFalse(jsonSaida.contains("segredo123"), "O JSON serializado nao deve conter o valor da senha");
        assertTrue(jsonSaida.contains("Marie Curie"), "O JSON deve conter o nomeCompleto normalmente");

        String jsonEntrada = "{\"nomeCompleto\":\"Ludwig Boltzmann\",\"email\":\"ludwig@vienna.at\",\"senha\":\"EntropiaS=klnW\"}";
        Usuario lido = mapper.readValue(jsonEntrada, Usuario.class);
        assertEquals("EntropiaS=klnW", lido.getSenha(), "O Jackson deve conseguir ler a senha no payload de entrada");
    }

    @Test
    @DisplayName("QuizController deve retornar questoes em Ingles por padrao e em Portugues quando solicitado")
    void deveRetornarExerciciosEmInglesEPortugues() {
        QuizController controller = new QuizController();

        List<Map<String, Object>> listaEn = controller.listarExercicios("en");
        List<Map<String, Object>> listaPt = controller.listarExercicios("pt");

        assertTrue(listaEn.size() >= 10, "Deve conter pelo menos 10 questões em inglês");
        assertTrue(listaPt.size() >= 10, "Deve conter pelo menos 10 questões em português");

        // Verifica que os titulos estao no idioma correto e sem gabarito exposto
        assertTrue(listaEn.get(0).get("titulo").toString().contains("Half-Life"));
        assertTrue(listaPt.get(0).get("titulo").toString().contains("Meia-Vida"));
        assertFalse(listaEn.get(0).containsKey("respostaCorreta"), "Nao deve expor gabarito na listagem");

        // Testa validacao de resposta numerica em Ingles e Portugues
        Map<String, Object> bodyEn = controller.validarResposta(Map.of(
                "id", "cin_01",
                "resposta", 13.86,
                "lang", "en"
        ), "en");
        assertNotNull(bodyEn);
        assertEquals(true, bodyEn.get("correto"));
        assertTrue(bodyEn.get("mensagem").toString().contains("Correct"));

        Map<String, Object> bodyPt = controller.validarResposta(Map.of(
                "id", "cin_01",
                "resposta", 13.86,
                "lang", "pt"
        ), "pt");
        assertNotNull(bodyPt);
        assertEquals(true, bodyPt.get("correto"));
        assertTrue(bodyPt.get("mensagem").toString().contains("Correta"));

        // Testa dicas em Ingles e Portugues
        Map<String, Object> dicaBodyEn = controller.obterDica("max_01", "formula", "en");
        assertNotNull(dicaBodyEn);
        assertTrue(dicaBodyEn.get("dica").toString().toLowerCase().contains("formula") || dicaBodyEn.get("dica").toString().contains("v_mp"));

        Map<String, Object> dicaBodyPt = controller.obterDica("max_01", "formula", "pt");
        assertNotNull(dicaBodyPt);
        assertTrue(dicaBodyPt.get("dica").toString().toLowerCase().contains("fórmula") || dicaBodyPt.get("dica").toString().contains("v_mp"));
    }
}
