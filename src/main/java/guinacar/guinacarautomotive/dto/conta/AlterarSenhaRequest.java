package guinacar.guinacarautomotive.dto.conta;

import jakarta.validation.constraints.NotBlank;

public record AlterarSenhaRequest(
        @NotBlank(message = "Informe sua senha atual")
        String senhaAtual,

        @NotBlank(message = "Informe a nova senha")
        String novaSenha,

        @NotBlank(message = "Confirme a nova senha")
        String confirmarNovaSenha
) {
}
