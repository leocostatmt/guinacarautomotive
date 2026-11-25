package guinacar.guinacarautomotive.dto.carrinho;

import java.math.BigDecimal;

public record ItemCarrinhoDTO(
        String id,
        String name,
        BigDecimal price,
        String image,
        Integer quantity
) {
}
