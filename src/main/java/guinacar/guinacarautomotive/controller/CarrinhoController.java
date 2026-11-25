package guinacar.guinacarautomotive.controller;

import guinacar.guinacarautomotive.dto.carrinho.ItemCarrinhoDTO;
import guinacar.guinacarautomotive.security.UserDetailsImpl;
import guinacar.guinacarautomotive.service.CarrinhoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/carrinho")
public class CarrinhoController {

    private final CarrinhoService carrinhoService;

    public CarrinhoController(CarrinhoService carrinhoService) {
        this.carrinhoService = carrinhoService;
    }

    @GetMapping
    public ResponseEntity<List<ItemCarrinhoDTO>> listar(
            @AuthenticationPrincipal UserDetailsImpl usuarioAutenticado
    ) {
        return ResponseEntity.ok(carrinhoService.listar(usuarioAutenticado.getId()));
    }

    @PutMapping
    public ResponseEntity<List<ItemCarrinhoDTO>> sincronizar(
            @RequestBody List<ItemCarrinhoDTO> itens,
            @AuthenticationPrincipal UserDetailsImpl usuarioAutenticado
    ) {
        return ResponseEntity.ok(carrinhoService.sincronizar(usuarioAutenticado.getId(), itens));
    }

    @DeleteMapping
    public ResponseEntity<Void> limpar(
            @AuthenticationPrincipal UserDetailsImpl usuarioAutenticado
    ) {
        carrinhoService.limpar(usuarioAutenticado.getId());
        return ResponseEntity.noContent().build();
    }
}
