package guinacar.guinacarautomotive.controller;

import guinacar.guinacarautomotive.dto.admin.AdminAtualizarUsuarioRequest;
import guinacar.guinacarautomotive.dto.admin.AdminCriarUsuarioRequest;
import guinacar.guinacarautomotive.dto.admin.AdminUsuarioResponse;
import guinacar.guinacarautomotive.dto.common.PageResponse;
import guinacar.guinacarautomotive.security.UserDetailsImpl;
import guinacar.guinacarautomotive.service.AdminUsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/usuarios")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUsuarioController {

    private final AdminUsuarioService adminUsuarioService;

    public AdminUsuarioController(AdminUsuarioService adminUsuarioService) {
        this.adminUsuarioService = adminUsuarioService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<AdminUsuarioResponse>> listar(
            @RequestParam(defaultValue = "TODOS") String tipo,
            @RequestParam(required = false) String busca,
            @RequestParam(required = false) Boolean ativo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        return ResponseEntity.ok(adminUsuarioService.listar(tipo, busca, ativo, page, size));
    }

    @PostMapping
    public ResponseEntity<AdminUsuarioResponse> criar(@Valid @RequestBody AdminCriarUsuarioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminUsuarioService.criar(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminUsuarioResponse> atualizar(
            @PathVariable("id") Long usuarioId,
            @Valid @RequestBody AdminAtualizarUsuarioRequest request,
            @AuthenticationPrincipal UserDetailsImpl adminAutenticado
    ) {
        return ResponseEntity.ok(adminUsuarioService.atualizar(adminAutenticado.getId(), usuarioId, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AdminUsuarioResponse> alterarStatus(
            @PathVariable("id") Long usuarioId,
            @RequestBody Map<String, Boolean> body,
            @AuthenticationPrincipal UserDetailsImpl adminAutenticado
    ) {
        boolean ativo = Boolean.TRUE.equals(body.get("ativo"));
        return ResponseEntity.ok(adminUsuarioService.alterarStatus(adminAutenticado.getId(), usuarioId, ativo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable("id") Long usuarioId,
            @AuthenticationPrincipal UserDetailsImpl adminAutenticado
    ) {
        adminUsuarioService.excluir(adminAutenticado.getId(), usuarioId);
        return ResponseEntity.noContent().build();
    }
}
