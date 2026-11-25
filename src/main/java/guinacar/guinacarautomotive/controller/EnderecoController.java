package guinacar.guinacarautomotive.controller;

import guinacar.guinacarautomotive.dto.conta.EnderecoRequest;
import guinacar.guinacarautomotive.dto.conta.EnderecoResponse;
import guinacar.guinacarautomotive.security.UserDetailsImpl;
import guinacar.guinacarautomotive.service.EnderecoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/conta/enderecos")
public class EnderecoController {

    private final EnderecoService enderecoService;

    public EnderecoController(EnderecoService enderecoService) {
        this.enderecoService = enderecoService;
    }

    @GetMapping
    public ResponseEntity<List<EnderecoResponse>> listar(
            @AuthenticationPrincipal UserDetailsImpl usuarioAutenticado
    ) {
        return ResponseEntity.ok(enderecoService.listarPorUsuario(usuarioAutenticado.getId()));
    }

    @PostMapping
    public ResponseEntity<EnderecoResponse> criar(
            @Valid @RequestBody EnderecoRequest request,
            @AuthenticationPrincipal UserDetailsImpl usuarioAutenticado
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(enderecoService.criar(usuarioAutenticado.getId(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EnderecoResponse> atualizar(
            @PathVariable("id") Long enderecoId,
            @Valid @RequestBody EnderecoRequest request,
            @AuthenticationPrincipal UserDetailsImpl usuarioAutenticado
    ) {
        return ResponseEntity.ok(enderecoService.atualizar(usuarioAutenticado.getId(), enderecoId, request));
    }

    @PatchMapping("/{id}/principal")
    public ResponseEntity<List<EnderecoResponse>> definirPrincipal(
            @PathVariable("id") Long enderecoId,
            @AuthenticationPrincipal UserDetailsImpl usuarioAutenticado
    ) {
        return ResponseEntity.ok(enderecoService.definirPrincipal(usuarioAutenticado.getId(), enderecoId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(
            @PathVariable("id") Long enderecoId,
            @AuthenticationPrincipal UserDetailsImpl usuarioAutenticado
    ) {
        enderecoService.remover(usuarioAutenticado.getId(), enderecoId);
        return ResponseEntity.noContent().build();
    }
}
