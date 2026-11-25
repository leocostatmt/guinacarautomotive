package guinacar.guinacarautomotive.dto.conta;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EnderecoRequest(
        @Size(max = 60, message = "Apelido deve ter no máximo 60 caracteres")
        String apelido,

        @NotBlank(message = "Informe o nome do destinatário")
        @Size(min = 3, max = 150, message = "Destinatário deve ter entre 3 e 150 caracteres")
        String destinatario,

        @NotBlank(message = "Informe o CEP")
        String cep,

        @NotBlank(message = "Informe o logradouro")
        @Size(max = 200)
        String logradouro,

        @NotBlank(message = "Informe o número")
        @Size(max = 20)
        String numero,

        @Size(max = 120)
        String complemento,

        @NotBlank(message = "Informe o bairro")
        @Size(max = 120)
        String bairro,

        @NotBlank(message = "Informe a cidade")
        @Size(max = 120)
        String cidade,

        @NotBlank(message = "Informe o estado (UF)")
        @Size(min = 2, max = 2, message = "UF deve ter 2 letras")
        String estado,

        boolean principal
) {
}
