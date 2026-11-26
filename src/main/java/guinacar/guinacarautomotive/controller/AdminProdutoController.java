package guinacar.guinacarautomotive.controller;

import guinacar.guinacarautomotive.dto.common.PageResponse;
import guinacar.guinacarautomotive.dto.produto.CategoriaResumoDTO;
import guinacar.guinacarautomotive.dto.produto.MontadoraComModelosDTO;
import guinacar.guinacarautomotive.dto.produto.ProdutoDTO;
import guinacar.guinacarautomotive.dto.produto.ProdutoRequest;
import guinacar.guinacarautomotive.service.ProdutoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyRole('ADMIN', 'FUNCIONARIO')")
public class AdminProdutoController {

    private final ProdutoService produtoService;

    public AdminProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    @GetMapping("/produtos")
    public ResponseEntity<PageResponse<ProdutoDTO>> listar(
            @RequestParam(required = false) String busca,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) Boolean ativo,
            @RequestParam(required = false) Boolean estoqueBaixo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return ResponseEntity.ok(produtoService.listarAdmin(busca, categoriaId, ativo, estoqueBaixo, page, size));
    }

    @GetMapping("/categorias")
    public ResponseEntity<List<CategoriaResumoDTO>> listarCategorias() {
        return ResponseEntity.ok(produtoService.listarCategorias());
    }

    @GetMapping("/montadoras")
    public ResponseEntity<List<MontadoraComModelosDTO>> listarMontadoras() {
        return ResponseEntity.ok(produtoService.listarMontadorasComModelos());
    }

    @PostMapping("/montadoras/{montadoraId}/modelos")
    public ResponseEntity<MontadoraComModelosDTO.ModeloResumoDTO> criarModelo(
            @PathVariable("montadoraId") Long montadoraId,
            @RequestBody Map<String, String> body
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(produtoService.criarModeloVeiculo(montadoraId, body.get("nome")));
    }

    @PostMapping("/produtos")
    public ResponseEntity<ProdutoDTO> criar(@Valid @RequestBody ProdutoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(produtoService.criar(request));
    }

    @PutMapping("/produtos/{id}")
    public ResponseEntity<ProdutoDTO> atualizar(
            @PathVariable("id") Long produtoId,
            @Valid @RequestBody ProdutoRequest request
    ) {
        return ResponseEntity.ok(produtoService.atualizar(produtoId, request));
    }

    @PatchMapping("/produtos/{id}/status")
    public ResponseEntity<ProdutoDTO> alterarStatus(
            @PathVariable("id") Long produtoId,
            @RequestBody Map<String, Boolean> body
    ) {
        boolean ativo = Boolean.TRUE.equals(body.get("ativo"));
        return ResponseEntity.ok(produtoService.alterarStatus(produtoId, ativo));
    }

    @PatchMapping("/produtos/{id}/estoque")
    public ResponseEntity<ProdutoDTO> atualizarEstoque(
            @PathVariable("id") Long produtoId,
            @RequestBody Map<String, Integer> body
    ) {
        int estoque = body.getOrDefault("stock", 0);
        return ResponseEntity.ok(produtoService.atualizarEstoque(produtoId, estoque));
    }

    @DeleteMapping("/produtos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> remover(@PathVariable("id") Long produtoId) {
        produtoService.remover(produtoId);
        return ResponseEntity.noContent().build();
    }
}
