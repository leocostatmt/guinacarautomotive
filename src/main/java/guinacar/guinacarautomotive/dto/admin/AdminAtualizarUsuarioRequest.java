package guinacar.guinacarautomotive.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminAtualizarUsuarioRequest(
        @NotBlank(message = "Informe o nome completo")
        @Size(min = 3, max = 150)
        String nome,

        @NotBlank(message = "Informe o e-mail")
        @Email(message = "E-mail inválido")
        String email,

        @NotBlank(message = "Informe o telefone")
        String telefone,

        @NotBlank(message = "Informe o perfil de acesso")
        String role,

        String cargo,
        String departamento,
        Boolean ativo,
        String novaSenha
) {
}
