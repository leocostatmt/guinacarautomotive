package guinacar.guinacarautomotive.dto.admin;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record DashboardResponse(
        BigDecimal faturamentoTotal,
        BigDecimal faturamentoHoje,
        BigDecimal faturamentoMes,
        BigDecimal ticketMedio,
        long totalPedidos,
        long pedidosHoje,
        long enviosPendentes,
        long totalClientes,
        long totalFuncionarios,
        long produtosAtivos,
        long produtosEstoqueBaixo,
        List<VendaDiariaDTO> vendasUltimos7Dias,
        Map<String, Long> pedidosPorStatus,
        List<ResumoPagamentoDTO> vendasPorPagamento,
        List<TopProdutoDTO> topProdutos,
        List<AdminPedidoResponse> pedidosRecentes
) {
    public record VendaDiariaDTO(String data, long pedidos, BigDecimal total) {}
    public record ResumoPagamentoDTO(String formaPagamento, long quantidade, BigDecimal total) {}
    public record TopProdutoDTO(String produtoSlug, String nome, long quantidadeVendida, BigDecimal receita) {}
}
