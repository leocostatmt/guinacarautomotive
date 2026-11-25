package guinacar.guinacarautomotive.repository;

import guinacar.guinacarautomotive.model.ItemCarrinho;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItemCarrinhoRepository extends JpaRepository<ItemCarrinho, Long> {

    List<ItemCarrinho> findByUsuarioIdOrderByIdAsc(Long usuarioId);

    void deleteByUsuarioId(Long usuarioId);
}
