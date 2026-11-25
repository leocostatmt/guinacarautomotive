package guinacar.guinacarautomotive.controller;

import guinacar.guinacarautomotive.dto.pedido.PedidoRequest;
import guinacar.guinacarautomotive.dto.pedido.PedidoResponse;
import guinacar.guinacarautomotive.security.UserDetailsImpl;
import guinacar.guinacarautomotive.service.PedidoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostMapping
    public ResponseEntity<PedidoResponse> criarPedido(
            @RequestBody PedidoRequest pedidoRequest,
            @AuthenticationPrincipal UserDetailsImpl usuarioAutenticado
    ) {
        PedidoResponse criado = pedidoService.criarPedido(usuarioAutenticado.getId(), pedidoRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @GetMapping
    public ResponseEntity<List<PedidoResponse>> listarMeusPedidos(
            @AuthenticationPrincipal UserDetailsImpl usuarioAutenticado
    ) {
        return ResponseEntity.ok(pedidoService.listarPorUsuario(usuarioAutenticado.getId()));
    }

    @PostMapping("/{id}/confirmar-pagamento")
    public ResponseEntity<PedidoResponse> confirmarPagamento(
            @PathVariable("id") Long pedidoId,
            @AuthenticationPrincipal UserDetailsImpl usuarioAutenticado
    ) {
        return ResponseEntity.ok(pedidoService.confirmarPagamento(usuarioAutenticado.getId(), pedidoId));
    }

    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<PedidoResponse> cancelarPedido(
            @PathVariable("id") Long pedidoId,
            @AuthenticationPrincipal UserDetailsImpl usuarioAutenticado
    ) {
        return ResponseEntity.ok(pedidoService.cancelarPedido(usuarioAutenticado.getId(), pedidoId));
    }
}
