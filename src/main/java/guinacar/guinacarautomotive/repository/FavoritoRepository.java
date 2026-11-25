package guinacar.guinacarautomotive.repository;

import guinacar.guinacarautomotive.model.Favorito;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FavoritoRepository extends JpaRepository<Favorito, Long> {

    List<Favorito> findByUsuarioIdOrderByCriadoEmDesc(Long usuarioId);

    boolean existsByUsuarioIdAndProdutoSlug(Long usuarioId, String produtoSlug);

    void deleteByUsuarioIdAndProdutoSlug(Long usuarioId, String produtoSlug);
}
