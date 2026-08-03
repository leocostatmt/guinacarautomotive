package guinacar.guinacarautomotive.dto.auth;

public record AuthResponse(
        String token,
        String tipo,
        UsuarioResponse usuario
) {
}
