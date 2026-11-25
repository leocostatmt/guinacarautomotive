package guinacar.guinacarautomotive.dto.conta;

public record EnderecoResponse(
        Long id,
        String apelido,
        String destinatario,
        String cep,
        String logradouro,
        String numero,
        String complemento,
        String bairro,
        String cidade,
        String estado,
        boolean principal
) {
}
