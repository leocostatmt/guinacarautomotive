package guinacar.guinacarautomotive.dto.conta;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AtualizarPerfilRequest(
        @NotBlank(message = "Informe seu nome completo")
        @Size(min = 3, max = 150, message = "Nome deve ter entre 3 e 150 caracteres")
        String nome,

        @NotBlank(message = "Informe seu telefone")
        @Size(min = 10, max = 20, message = "Informe um telefone válido com DDD")
        String telefone
) {
}
