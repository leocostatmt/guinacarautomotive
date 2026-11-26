package guinacar.guinacarautomotive.dto.admin;

import jakarta.validation.constraints.NotBlank;

public record AtualizarStatusPedidoRequest(
        @NotBlank(message = "Informe o novo status")
        String status,
        String codigoRastreio,
        String transportadora
) {
}
