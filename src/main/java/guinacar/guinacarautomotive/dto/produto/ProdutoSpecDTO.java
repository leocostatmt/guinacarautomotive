package guinacar.guinacarautomotive.dto.produto;

import jakarta.validation.constraints.NotBlank;

/** Equivale a um item do array `specs` de src/data/products.js: {label, value}. */
public record ProdutoSpecDTO(
        @NotBlank(message = "O rótulo da especificação é obrigatório") String label,
        @NotBlank(message = "O valor da especificação é obrigatório") String value
) {
}
