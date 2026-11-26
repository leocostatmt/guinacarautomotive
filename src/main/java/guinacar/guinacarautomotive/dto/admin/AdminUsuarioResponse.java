package guinacar.guinacarautomotive.dto.admin;

import java.time.LocalDateTime;

public record AdminUsuarioResponse(
        Long id,
        String nome,
        String email,
        String cpf,
        String telefone,
        String role,
        String cargo,
        String departamento,
        boolean ativo,
        LocalDateTime criadoEm
) {
}
