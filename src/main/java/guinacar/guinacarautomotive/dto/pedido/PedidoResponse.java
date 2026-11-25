package guinacar.guinacarautomotive.dto.pedido;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PedidoResponse(
        Long id,
        String status,
        BigDecimal subtotal,
        BigDecimal frete,
        BigDecimal desconto,
        BigDecimal total,
        LocalDateTime criadoEm,
        EntregaResponse entrega,
        PagamentoResponse pagamento,
        List<ItemPedidoResponse> itens
) {
}
