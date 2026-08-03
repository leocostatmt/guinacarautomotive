package guinacar.guinacarautomotive.dto.common;

import java.util.List;

/** Envelope de paginação genérico devolvido por qualquer listagem da API. */
public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}
