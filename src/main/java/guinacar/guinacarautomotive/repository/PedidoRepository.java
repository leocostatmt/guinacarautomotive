package guinacar.guinacarautomotive.repository;

import guinacar.guinacarautomotive.model.Pedido;
import guinacar.guinacarautomotive.model.StatusPedido;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    @EntityGraph(attributePaths = "itens")
    List<Pedido> findByUsuarioIdOrderByCriadoEmDesc(Long usuarioId);

    @EntityGraph(attributePaths = "itens")
    Optional<Pedido> findByIdAndUsuarioId(Long id, Long usuarioId);

    @EntityGraph(attributePaths = {"itens", "usuario"})
    Optional<Pedido> findWithDetailsById(Long id);

    @EntityGraph(attributePaths = {"itens", "usuario"})
    List<Pedido> findTop6ByOrderByCriadoEmDesc();

    @EntityGraph(attributePaths = {"itens", "usuario"})
    @Query("""
            SELECT p FROM Pedido p
            JOIN p.usuario u
            WHERE (:status IS NULL OR p.status = :status)
              AND (:apenasEnvios IS FALSE OR p.status IN (guinacar.guinacarautomotive.model.StatusPedido.CONFIRMADO, guinacar.guinacarautomotive.model.StatusPedido.EM_SEPARACAO))
              AND (
                  :busca IS NULL OR :busca = ''
                  OR CAST(p.id AS string) LIKE CONCAT('%', :busca, '%')
                  OR LOWER(u.nome) LIKE LOWER(CONCAT('%', :busca, '%'))
                  OR LOWER(u.email) LIKE LOWER(CONCAT('%', :busca, '%'))
                  OR LOWER(COALESCE(p.destinatario, '')) LIKE LOWER(CONCAT('%', :busca, '%'))
                  OR LOWER(COALESCE(p.codigoRastreio, '')) LIKE LOWER(CONCAT('%', :busca, '%'))
              )
            """)
    Page<Pedido> buscarAdmin(
            @Param("status") StatusPedido status,
            @Param("apenasEnvios") boolean apenasEnvios,
            @Param("busca") String busca,
            Pageable pageable
    );

    @Query("SELECT COALESCE(SUM(p.total), 0) FROM Pedido p WHERE p.status <> guinacar.guinacarautomotive.model.StatusPedido.CANCELADO")
    BigDecimal somarFaturamentoTotal();

    @Query("""
            SELECT COALESCE(SUM(p.total), 0) FROM Pedido p
            WHERE p.status <> guinacar.guinacarautomotive.model.StatusPedido.CANCELADO
              AND p.criadoEm >= :inicio AND p.criadoEm <= :fim
            """)
    BigDecimal somarFaturamentoPeriodo(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    long countByCriadoEmBetween(LocalDateTime inicio, LocalDateTime fim);

    long countByStatusIn(Collection<StatusPedido> statuses);

    @EntityGraph(attributePaths = {"itens", "usuario"})
    List<Pedido> findByCriadoEmBetweenOrderByCriadoEmAsc(LocalDateTime inicio, LocalDateTime fim);

    @Query("SELECT p.status, COUNT(p) FROM Pedido p GROUP BY p.status")
    List<Object[]> contarPorStatus();

    @Query("""
            SELECT p.formaPagamento, COUNT(p), COALESCE(SUM(p.total), 0)
            FROM Pedido p
            WHERE p.status <> guinacar.guinacarautomotive.model.StatusPedido.CANCELADO
              AND p.formaPagamento IS NOT NULL
            GROUP BY p.formaPagamento
            """)
    List<Object[]> resumirPorFormaPagamento();

    @Query("""
            SELECT i.produtoSlug, i.nome, SUM(i.quantidade), SUM(i.precoUnitario * i.quantidade)
            FROM ItemPedido i
            JOIN i.pedido p
            WHERE p.status <> guinacar.guinacarautomotive.model.StatusPedido.CANCELADO
            GROUP BY i.produtoSlug, i.nome
            ORDER BY SUM(i.quantidade) DESC
            """)
    List<Object[]> listarTopProdutos(Pageable pageable);
}
