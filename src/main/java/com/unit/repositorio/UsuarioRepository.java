package com.unit.repositorio;

import com.unit.modelo.entidade.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositório de Usuários com consultas para autenticação e ranking de gamificação.
 */
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    Optional<Usuario> findByEmail(String email);

    List<Usuario> findAllByOrderByExperienciaDesc();
}
