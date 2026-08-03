package guinacar.guinacarautomotive.dto.produto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ProdutoDTO(
        Long id,
        String slug,
        String name,
        String manufacturer,
        String description,
        BigDecimal price,
        Integer stock,
        boolean active,
        String image,
        CategoriaResumoDTO category,
        List<ProdutoSpecDTO> specs,
        List<CompatibilidadeDTO> compatibilidades,
        LocalDateTime createdAt
) {
}
