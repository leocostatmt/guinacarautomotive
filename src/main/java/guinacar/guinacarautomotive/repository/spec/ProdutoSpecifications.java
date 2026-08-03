package guinacar.guinacarautomotive.repository.spec;

import guinacar.guinacarautomotive.model.Compatibilidade;
import guinacar.guinacarautomotive.model.ModeloVeiculo;
import guinacar.guinacarautomotive.model.Montadora;
import guinacar.guinacarautomotive.model.Produto;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

/**
 * Blocos de filtro combináveis para a listagem de produtos
 * (GET /api/produtos?busca=&categoriaId=&montadora=&ordenar=).
 * Cada filtro é opcional; o service só encadeia os que vierem preenchidos.
 */
public final class ProdutoSpecifications {

    private ProdutoSpecifications() {
    }

    public static Specification<Produto> ativos() {
        return (root, query, cb) -> cb.isTrue(root.get("active"));
    }

    public static Specification<Produto> comBusca(String termo) {
        String like = "%" + termo.toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("name")), like),
                cb.like(cb.lower(root.get("manufacturer")), like)
        );
    }

    public static Specification<Produto> comCategoria(Long categoriaId) {
        return (root, query, cb) -> cb.equal(root.get("category").get("id"), categoriaId);
    }

    /** Filtra produtos com ao menos uma ficha de compatibilidade para a montadora informada. */
    public static Specification<Produto> comMontadora(String montadoraSlug) {
        return (root, query, cb) -> {
            query.distinct(true);
            Join<Produto, Compatibilidade> compat = root.join("compatibilidades");
            Join<Compatibilidade, ModeloVeiculo> modelo = compat.join("modelo");
            Join<ModeloVeiculo, Montadora> montadora = modelo.join("montadora");
            return cb.equal(montadora.get("slug"), montadoraSlug);
        };
    }
}
