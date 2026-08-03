package guinacar.guinacarautomotive.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record RedefinirSenhaRequest(
        @NotBlank(message = "O token é obrigatório") String token,
        @NotBlank(message = "A nova senha é obrigatória") String novaSenha
) {
}
