package guinacar.guinacarautomotive.dto.produto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

/** Corpo enviado pelo Admin ao criar ou editar um anúncio de produto. */
public record ProdutoRequest(
        @NotBlank(message = "O slug é obrigatório") String slug,
        @NotBlank(message = "O nome é obrigatório") String name,
        @NotBlank(message = "O fabricante é obrigatório") String manufacturer,
        String description,

        @NotNull(message = "O preço é obrigatório")
        @DecimalMin(value = "0.01", message = "O preço deve ser maior que zero")
        BigDecimal price,

        @NotNull(message = "O estoque é obrigatório")
        @Min(value = 0, message = "O estoque não pode ser negativo")
        Integer stock,

        Boolean active,
        String image,

        @NotNull(message = "A categoria é obrigatória") Long categoryId,

        @Valid List<ProdutoSpecDTO> specs,
        @Valid List<CompatibilidadeRequest> compatibilidades
) {
}
