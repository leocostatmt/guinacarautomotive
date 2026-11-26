package guinacar.guinacarautomotive.dto.admin;

import guinacar.guinacarautomotive.dto.pedido.EntregaResponse;
import guinacar.guinacarautomotive.dto.pedido.ItemPedidoResponse;
import guinacar.guinacarautomotive.dto.pedido.PagamentoResponse;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record AdminPedidoResponse(
        Long id,
        Long clienteId,
        String clienteNome,
        String clienteEmail,
        String clienteTelefone,
        String status,
        BigDecimal subtotal,
        BigDecimal frete,
        BigDecimal desconto,
        BigDecimal total,
        String codigoRastreio,
        String transportadora,
        LocalDateTime enviadoEm,
        LocalDateTime entregueEm,
        LocalDateTime criadoEm,
        EntregaResponse entrega,
        PagamentoResponse pagamento,
        List<ItemPedidoResponse> itens
) {
}
