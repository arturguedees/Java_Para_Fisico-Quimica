package com.unit.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Criei esse endpoint bem simples de Health Check pro frontend conseguir pingar rapido
 * e descobrir se o backend Java esta ligado ou se deve usar o motor cientifico local!
 */
@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "*")
public class HealthController {

    @GetMapping
    public Map<String, Object> health() {
        // Devolve status UP e o horario atual do servidor em formato ISO
        return Map.of(
                "status", "UP",
                "servico", "Quantum Lab - Physical Chemistry Computational API",
                "timestamp", Instant.now().toString()
        );
    }
}
