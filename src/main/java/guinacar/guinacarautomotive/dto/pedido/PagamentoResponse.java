package guinacar.guinacarautomotive.dto.pedido;

import java.time.LocalDateTime;

public record PagamentoResponse(
        String formaPagamento,
        String statusPagamento,
        Integer parcelas,
        String ultimosDigitosCartao,
        String bandeiraCartao,
        String codigoTransacao,
        String codigoPix,
        String linhaDigitavelBoleto,
        LocalDateTime pagoEm
) {
}
