package guinacar.guinacarautomotive.dto.produto;

import java.util.List;

public record MontadoraComModelosDTO(
        Long id,
        String slug,
        String name,
        List<ModeloResumoDTO> modelos
) {
    public record ModeloResumoDTO(Long id, String nome) {}
}
