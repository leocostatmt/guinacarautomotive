package guinacar.guinacarautomotive.dto.pedido;

public record EntregaResponse(
        String destinatario,
        String cep,
        String logradouro,
        String numero,
        String complemento,
        String bairro,
        String cidade,
        String estado,
        String tipoEntrega,
        String prazoEntrega
) {
}
