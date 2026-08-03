package guinacar.guinacarautomotive.controller;

import guinacar.guinacarautomotive.dto.common.PageResponse;
import guinacar.guinacarautomotive.dto.produto.ProdutoDTO;
import guinacar.guinacarautomotive.dto.produto.ProdutoRequest;
import guinacar.guinacarautomotive.service.ProdutoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    private final ProdutoService produtoService;

    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    /**
     * Listagem pública do catálogo. Os parâmetros espelham os filtros já
     * usados em src/pages/Catalog.jsx no front-end (busca, categoria,
     * marca, ordenar), para que o front possa apontar para esta rota
     * trocando apenas a origem dos dados.
     */
    @GetMapping
    public ResponseEntity<PageResponse<ProdutoDTO>> listar(
            @RequestParam(required = false) String busca,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) String montadora,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String ordenar) {
        return ResponseEntity.ok(produtoService.listar(busca, categoriaId, montadora, page, size, ordenar));
    }

    /**
     * Cria um novo anúncio de produto (o fluxo de "criar anúncio" do Admin).
     * Dupla proteção: SecurityConfig já exige ROLE_ADMIN para POST em
     * /api/produtos/**, e o @PreAuthorize abaixo reforça no nível do
     * método — se algum dia a regra de URL mudar/for removida por engano,
     * o endpoint continua protegido.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProdutoDTO> criar(@Valid @RequestBody ProdutoRequest request) {
        ProdutoDTO criado = produtoService.criar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }
}
