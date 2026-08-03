package guinacar.guinacarautomotive.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RecuperarSenhaRequest(
        @NotBlank(message = "O e-mail é obrigatório") @Email(message = "E-mail inválido") String email
) {
}
