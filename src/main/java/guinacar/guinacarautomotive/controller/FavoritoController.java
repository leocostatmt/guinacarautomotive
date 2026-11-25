package guinacar.guinacarautomotive.controller;

import guinacar.guinacarautomotive.security.UserDetailsImpl;
import guinacar.guinacarautomotive.service.FavoritoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/favoritos")
public class FavoritoController {

    private final FavoritoService favoritoService;

    public FavoritoController(FavoritoService favoritoService) {
        this.favoritoService = favoritoService;
    }

    @GetMapping
    public ResponseEntity<List<String>> listar(
            @AuthenticationPrincipal UserDetailsImpl usuarioAutenticado
    ) {
        return ResponseEntity.ok(favoritoService.listarSlugs(usuarioAutenticado.getId()));
    }

    @PostMapping("/{produtoSlug}")
    public ResponseEntity<List<String>> adicionar(
            @PathVariable String produtoSlug,
            @AuthenticationPrincipal UserDetailsImpl usuarioAutenticado
    ) {
        return ResponseEntity.ok(favoritoService.adicionar(usuarioAutenticado.getId(), produtoSlug));
    }

    @DeleteMapping("/{produtoSlug}")
    public ResponseEntity<List<String>> remover(
            @PathVariable String produtoSlug,
            @AuthenticationPrincipal UserDetailsImpl usuarioAutenticado
    ) {
        return ResponseEntity.ok(favoritoService.remover(usuarioAutenticado.getId(), produtoSlug));
    }
}
