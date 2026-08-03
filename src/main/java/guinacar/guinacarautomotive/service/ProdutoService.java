package guinacar.guinacarautomotive.service;

import guinacar.guinacarautomotive.dto.common.PageResponse;
import guinacar.guinacarautomotive.dto.produto.CategoriaResumoDTO;
import guinacar.guinacarautomotive.dto.produto.CompatibilidadeDTO;
import guinacar.guinacarautomotive.dto.produto.CompatibilidadeRequest;
import guinacar.guinacarautomotive.dto.produto.ProdutoDTO;
import guinacar.guinacarautomotive.dto.produto.ProdutoRequest;
import guinacar.guinacarautomotive.dto.produto.ProdutoSpecDTO;
import guinacar.guinacarautomotive.exception.RecursoNaoEncontradoException;
import guinacar.guinacarautomotive.exception.RegraNegocioException;
import guinacar.guinacarautomotive.model.Categoria;
import guinacar.guinacarautomotive.model.Compatibilidade;
import guinacar.guinacarautomotive.model.ModeloVeiculo;
import guinacar.guinacarautomotive.model.Produto;
import guinacar.guinacarautomotive.model.ProdutoSpec;
import guinacar.guinacarautomotive.repository.CategoriaRepository;
import guinacar.guinacarautomotive.repository.ModeloVeiculoRepository;
import guinacar.guinacarautomotive.repository.ProdutoRepository;
import guinacar.guinacarautomotive.repository.spec.ProdutoSpecifications;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final CategoriaRepository categoriaRepository;
    private final ModeloVeiculoRepository modeloVeiculoRepository;

    public ProdutoService(ProdutoRepository produtoRepository,
                           CategoriaRepository categoriaRepository,
                           ModeloVeiculoRepository modeloVeiculoRepository) {
        this.produtoRepository = produtoRepository;
        this.categoriaRepository = categoriaRepository;
        this.modeloVeiculoRepository = modeloVeiculoRepository;
    }

    /** Cria um novo anúncio de produto. Uso restrito a ADMIN (ver ProdutoController). */
    @Transactional
    public ProdutoDTO criar(ProdutoRequest request) {
        if (produtoRepository.existsBySlug(request.slug())) {
            throw new RegraNegocioException("Já existe um produto com o slug '" + request.slug() + "'");
        }

        Categoria categoria = categoriaRepository.findById(request.categoryId())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Categoria não encontrada: id " + request.categoryId()));

        Produto produto = new Produto();
        produto.setSlug(request.slug());
        produto.setName(request.name());
        produto.setManufacturer(request.manufacturer());
        produto.setDescription(request.description());
        produto.setPrice(request.price());
        produto.setStock(request.stock());
        produto.setActive(request.active() == null || request.active());
        produto.setImage(request.image());
        produto.setCategory(categoria);

        if (request.specs() != null) {
            produto.setSpecs(request.specs().stream()
                    .map(s -> new ProdutoSpec(s.label(), s.value()))
                    .toList());
        }

        if (request.compatibilidades() != null) {
            for (CompatibilidadeRequest c : request.compatibilidades()) {
                ModeloVeiculo modelo = modeloVeiculoRepository.findById(c.modeloId())
                        .orElseThrow(() -> new RecursoNaoEncontradoException(
                                "Modelo de veículo não encontrado: id " + c.modeloId()));

                Compatibilidade compatibilidade = new Compatibilidade();
                compatibilidade.setModelo(modelo);
                compatibilidade.setAnoInicio(c.anoInicio());
                compatibilidade.setAnoFim(c.anoFim());
                produto.adicionarCompatibilidade(compatibilidade);
            }
        }

        return toDTO(produtoRepository.save(produto));
    }

    /** Lista produtos ativos, com busca textual, filtro por categoria/montadora, ordenação e paginação opcionais. */
    @Transactional(readOnly = true)
    public PageResponse<ProdutoDTO> listar(String busca, Long categoriaId, String montadora,
                                            int page, int size, String ordenar) {
        Specification<Produto> spec = Specification.where(ProdutoSpecifications.ativos());

        if (busca != null && !busca.isBlank()) {
            spec = spec.and(ProdutoSpecifications.comBusca(busca));
        }
        if (categoriaId != null) {
            spec = spec.and(ProdutoSpecifications.comCategoria(categoriaId));
        }
        if (montadora != null && !montadora.isBlank()) {
            spec = spec.and(ProdutoSpecifications.comMontadora(montadora));
        }

        Sort sort = switch (ordenar == null ? "" : ordenar) {
            case "menor-preco" -> Sort.by("price").ascending();
            case "maior-preco" -> Sort.by("price").descending();
            default -> Sort.by("criadoEm").descending();
        };

        int paginaSegura = Math.max(page, 0);
        int tamanhoSeguro = Math.min(Math.max(size, 1), 100);
        Pageable pageable = PageRequest.of(paginaSegura, tamanhoSeguro, sort);

        Page<Produto> resultado = produtoRepository.findAll(spec, pageable);
        List<ProdutoDTO> conteudo = resultado.getContent().stream().map(this::toDTO).toList();

        return new PageResponse<>(conteudo, resultado.getNumber(), resultado.getSize(),
                resultado.getTotalElements(), resultado.getTotalPages());
    }

    private ProdutoDTO toDTO(Produto p) {
        CategoriaResumoDTO categoriaDTO = new CategoriaResumoDTO(
                p.getCategory().getId(), p.getCategory().getSlug(), p.getCategory().getName());

        List<ProdutoSpecDTO> specsDTO = p.getSpecs().stream()
                .map(s -> new ProdutoSpecDTO(s.getLabel(), s.getValue()))
                .toList();

        List<CompatibilidadeDTO> compatDTO = p.getCompatibilidades().stream()
                .map(c -> new CompatibilidadeDTO(
                        c.getModelo().getId(),
                        c.getModelo().getMontadora().getName(),
                        c.getModelo().getNome(),
                        c.getAnoInicio(),
                        c.getAnoFim()))
                .toList();

        return new ProdutoDTO(
                p.getId(), p.getSlug(), p.getName(), p.getManufacturer(), p.getDescription(),
                p.getPrice(), p.getStock(), p.isActive(), p.getImage(),
                categoriaDTO, specsDTO, compatDTO, p.getCriadoEm());
    }
}
