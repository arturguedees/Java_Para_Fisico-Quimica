package com.unit.repositorio;

import com.unit.modelo.entidade.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Interface do Spring Data JPA pra acessar a tabela de usuarios sem precisar escrever SQL na mao!
 * O proprio Spring gera as queries baseadas no nome dos metodos (findByEmail, findAllByOrderBy...).
 */
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    // Busca um usuario pelo email (uso no login e pra ver se o email ja existe no cadastro)
    Optional<Usuario> findByEmail(String email);

    // Traz todo mundo ordenado pela experiencia (XP) do maior pro menor para montar o Ranking
    List<Usuario> findAllByOrderByExperienciaDesc();
}
