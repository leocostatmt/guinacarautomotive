package guinacar.guinacarautomotive.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminCriarUsuarioRequest(
        @NotBlank(message = "Informe o nome completo")
        @Size(min = 3, max = 150)
        String nome,

        @NotBlank(message = "Informe o e-mail")
        @Email(message = "E-mail inválido")
        String email,

        @NotBlank(message = "Informe o CPF")
        String cpf,

        @NotBlank(message = "Informe o telefone")
        String telefone,

        @NotBlank(message = "Informe a senha inicial")
        String senha,

        @NotBlank(message = "Informe o perfil de acesso")
        String role,

        String cargo,
        String departamento,
        Boolean ativo
) {
}
