package guinacar.guinacarautomotive.controller;

import guinacar.guinacarautomotive.dto.admin.AdminPedidoResponse;
import guinacar.guinacarautomotive.dto.admin.AtualizarStatusPedidoRequest;
import guinacar.guinacarautomotive.dto.admin.DespacharPedidoRequest;
import guinacar.guinacarautomotive.dto.common.PageResponse;
import guinacar.guinacarautomotive.service.AdminPedidoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/pedidos")
@PreAuthorize("hasAnyRole('ADMIN', 'FUNCIONARIO')")
public class AdminPedidoController {

    private final AdminPedidoService adminPedidoService;

    public AdminPedidoController(AdminPedidoService adminPedidoService) {
        this.adminPedidoService = adminPedidoService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<AdminPedidoResponse>> listar(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "false") boolean somenteEnvios,
            @RequestParam(required = false) String busca,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        return ResponseEntity.ok(adminPedidoService.listar(status, somenteEnvios, busca, page, size));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AdminPedidoResponse> atualizarStatus(
            @PathVariable("id") Long pedidoId,
            @Valid @RequestBody AtualizarStatusPedidoRequest request
    ) {
        return ResponseEntity.ok(adminPedidoService.atualizarStatus(pedidoId, request));
    }

    @PostMapping("/{id}/despachar")
    public ResponseEntity<AdminPedidoResponse> despachar(
            @PathVariable("id") Long pedidoId,
            @RequestBody(required = false) DespacharPedidoRequest request
    ) {
        return ResponseEntity.ok(adminPedidoService.despachar(pedidoId, request));
    }
}
