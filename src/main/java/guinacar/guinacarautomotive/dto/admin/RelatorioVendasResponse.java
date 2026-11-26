package guinacar.guinacarautomotive.dto.admin;

import java.math.BigDecimal;
import java.util.List;

public record RelatorioVendasResponse(
        String dataInicio,
        String dataFim,
        long totalPedidos,
        long pedidosValidos,
        long pedidosCancelados,
        BigDecimal receitaBruta,
        BigDecimal totalDescontos,
        BigDecimal totalFretes,
        BigDecimal receitaLiquida,
        BigDecimal ticketMedio,
        List<DashboardResponse.VendaDiariaDTO> serieDiaria,
        List<DashboardResponse.ResumoPagamentoDTO> porPagamento,
        List<DashboardResponse.TopProdutoDTO> produtosMaisVendidos
) {
}
