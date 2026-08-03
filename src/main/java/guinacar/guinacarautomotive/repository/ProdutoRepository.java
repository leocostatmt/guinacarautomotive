package guinacar.guinacarautomotive.repository;

import guinacar.guinacarautomotive.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

/**
 * JpaSpecificationExecutor permite compor filtros dinâmicos (busca textual +
 * categoria + montadora, todos opcionais) sem precisar de um método de
 * consulta derivado para cada combinação possível — ver
 * {@link guinacar.guinacarautomotive.repository.spec.ProdutoSpecifications}.
 */
public interface ProdutoRepository extends JpaRepository<Produto, Long>, JpaSpecificationExecutor<Produto> {

    Optional<Produto> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
