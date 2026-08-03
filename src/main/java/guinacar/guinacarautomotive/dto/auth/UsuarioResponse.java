package guinacar.guinacarautomotive.dto.auth;

public record UsuarioResponse(
        Long id,
        String nome,
        String email,
        String cpf,
        String telefone,
        String role
) {
}
