package guinacar.guinacarautomotive.dto.produto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/** Uma ficha de aplicação enviada ao criar/editar um produto: para qual modelo e faixa de anos ele serve. */
public record CompatibilidadeRequest(
        @NotNull(message = "O modelo do veículo é obrigatório") Long modeloId,

        @NotNull(message = "O ano inicial é obrigatório")
        @Min(value = 1950, message = "Ano inicial inválido")
        Integer anoInicio,

        // Nulo = compatível também com anos futuros (modelo ainda em produção)
        Integer anoFim
) {
}
