package guinacar.guinacarautomotive.repository;

import guinacar.guinacarautomotive.model.Role;
import guinacar.guinacarautomotive.model.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByCpf(String cpf);

    boolean existsByRole(Role role);

    Optional<Usuario> findByTokenRecuperacaoSenha(String token);

    long countByRole(Role role);

    long countByRoleIn(Collection<Role> roles);

    @Query("""
            SELECT u FROM Usuario u
            WHERE u.role IN :roles
              AND (:ativo IS NULL OR u.ativo = :ativo)
              AND (
                  :busca IS NULL OR :busca = ''
                  OR LOWER(u.nome) LIKE LOWER(CONCAT('%', :busca, '%'))
                  OR LOWER(u.email) LIKE LOWER(CONCAT('%', :busca, '%'))
                  OR u.cpf LIKE CONCAT('%', :busca, '%')
                  OR LOWER(COALESCE(u.cargo, '')) LIKE LOWER(CONCAT('%', :busca, '%'))
              )
            """)
    Page<Usuario> buscarAdmin(
            @Param("roles") Collection<Role> roles,
            @Param("ativo") Boolean ativo,
            @Param("busca") String busca,
            Pageable pageable
    );
}
