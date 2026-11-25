package guinacar.guinacarautomotive.dto.pedido;

import java.math.BigDecimal;

public record ItemPedidoResponse(
        Long id,
        String produtoSlug,
        String nome,
        String imagem,
        Integer quantidade,
        BigDecimal precoUnitario
) {
}
