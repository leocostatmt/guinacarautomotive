package guinacar.guinacarautomotive.controller;

import guinacar.guinacarautomotive.dto.auth.UsuarioResponse;
import guinacar.guinacarautomotive.dto.conta.AlterarSenhaRequest;
import guinacar.guinacarautomotive.dto.conta.AtualizarPerfilRequest;
import guinacar.guinacarautomotive.security.UserDetailsImpl;
import guinacar.guinacarautomotive.service.ContaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/conta")
public class ContaController {

    private final ContaService contaService;

    public ContaController(ContaService contaService) {
        this.contaService = contaService;
    }

    @PutMapping("/perfil")
    public ResponseEntity<UsuarioResponse> atualizarPerfil(
            @Valid @RequestBody AtualizarPerfilRequest request,
            @AuthenticationPrincipal UserDetailsImpl usuarioAutenticado
    ) {
        return ResponseEntity.ok(contaService.atualizarPerfil(usuarioAutenticado.getId(), request));
    }

    @PutMapping("/senha")
    public ResponseEntity<Void> alterarSenha(
            @Valid @RequestBody AlterarSenhaRequest request,
            @AuthenticationPrincipal UserDetailsImpl usuarioAutenticado
    ) {
        contaService.alterarSenha(usuarioAutenticado.getId(), request);
        return ResponseEntity.noContent().build();
    }
}
