package com.unit.repositorio;

import com.unit.modelo.entidade.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositório de Usuários.
 * O Spring Data JPA implementa automaticamente os métodos básicos (save, findById, findAll, delete).
 * É semelhante ao Prisma Client (ex: prisma.user.findUnique).
 */
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    // Método customizado que o Spring cria automaticamente baseado no nome!
    Optional<Usuario> findByEmail(String email);
}
