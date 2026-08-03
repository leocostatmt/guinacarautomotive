package guinacar.guinacarautomotive.dto.produto;

public record CompatibilidadeDTO(
        Long modeloId,
        String montadora,
        String modelo,
        Integer anoInicio,
        Integer anoFim
) {
}
