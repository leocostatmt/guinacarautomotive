package guinacar.guinacarautomotive.dto.common;

import java.time.Instant;
import java.util.Map;

/** Corpo padrão de erro devolvido pela API. fieldErrors só é preenchido em erros de validação. */
public record ErrorResponse(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> fieldErrors
) {
}
