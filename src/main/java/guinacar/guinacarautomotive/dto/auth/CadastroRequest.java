package guinacar.guinacarautomotive.dto.auth;

import guinacar.guinacarautomotive.validation.ValidCPF;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** Espelha exatamente os campos do formulário em src/pages/Register.jsx. */
public record CadastroRequest(
        @NotBlank(message = "O nome é obrigatório") String nome,
        @NotBlank(message = "O CPF é obrigatório") @ValidCPF String cpf,
        @NotBlank(message = "O telefone é obrigatório") String telefone,
        @NotBlank(message = "O e-mail é obrigatório") @Email(message = "E-mail inválido") String email,
        @NotBlank(message = "A senha é obrigatória") String senha,
        @NotBlank(message = "A confirmação de senha é obrigatória") String confirmarSenha
) {
}
