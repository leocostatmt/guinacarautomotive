package guinacar.guinacarautomotive.service;

import guinacar.guinacarautomotive.dto.common.PageResponse;
import guinacar.guinacarautomotive.dto.produto.CategoriaResumoDTO;
import guinacar.guinacarautomotive.dto.produto.CompatibilidadeDTO;
import guinacar.guinacarautomotive.dto.produto.CompatibilidadeRequest;
import guinacar.guinacarautomotive.dto.produto.MontadoraComModelosDTO;
import guinacar.guinacarautomotive.dto.produto.ProdutoDTO;
import guinacar.guinacarautomotive.dto.produto.ProdutoRequest;
import guinacar.guinacarautomotive.dto.produto.ProdutoSpecDTO;
import guinacar.guinacarautomotive.exception.RecursoNaoEncontradoException;
import guinacar.guinacarautomotive.exception.RegraNegocioException;
import guinacar.guinacarautomotive.model.Categoria;
import guinacar.guinacarautomotive.model.Compatibilidade;
import guinacar.guinacarautomotive.model.ModeloVeiculo;
import guinacar.guinacarautomotive.model.Montadora;
import guinacar.guinacarautomotive.model.Produto;
import guinacar.guinacarautomotive.model.ProdutoSpec;
import guinacar.guinacarautomotive.repository.CategoriaRepository;
import guinacar.guinacarautomotive.repository.ModeloVeiculoRepository;
import guinacar.guinacarautomotive.repository.MontadoraRepository;
import guinacar.guinacarautomotive.repository.ProdutoRepository;
import guinacar.guinacarautomotive.repository.spec.ProdutoSpecifications;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final CategoriaRepository categoriaRepository;
    private final ModeloVeiculoRepository modeloVeiculoRepository;
    private final MontadoraRepository montadoraRepository;

    public ProdutoService(ProdutoRepository produtoRepository,
                          CategoriaRepository categoriaRepository,
                          ModeloVeiculoRepository modeloVeiculoRepository,
                          MontadoraRepository montadoraRepository) {
        this.produtoRepository = produtoRepository;
        this.categoriaRepository = categoriaRepository;
        this.modeloVeiculoRepository = modeloVeiculoRepository;
        this.montadoraRepository = montadoraRepository;
    }

    @Transactional
    public ProdutoDTO criar(ProdutoRequest request) {
        String slug = normalizarSlug(request.slug(), request.name());
        if (produtoRepository.existsBySlug(slug)) {
            throw new RegraNegocioException("Já existe um produto com o slug '" + slug + "'");
        }

        Categoria categoria = categoriaRepository.findById(request.categoryId())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Categoria não encontrada: id " + request.categoryId()));

        Produto produto = new Produto();
        aplicarDados(produto, request, slug, categoria);

        return toDTO(produtoRepository.save(produto));
    }

    @Transactional
    public ProdutoDTO atualizar(Long id, ProdutoRequest request) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto não encontrado: id " + id));

        String slug = normalizarSlug(request.slug(), request.name());
        if (produtoRepository.existsBySlugAndIdNot(slug, id)) {
            throw new RegraNegocioException("Já existe outro produto com o slug '" + slug + "'");
        }

        Categoria categoria = categoriaRepository.findById(request.categoryId())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Categoria não encontrada: id " + request.categoryId()));

        aplicarDados(produto, request, slug, categoria);
        return toDTO(produtoRepository.save(produto));
    }

    @Transactional
    public ProdutoDTO alterarStatus(Long id, boolean ativo) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto não encontrado: id " + id));
        produto.setActive(ativo);
        return toDTO(produtoRepository.save(produto));
    }

    @Transactional
    public ProdutoDTO atualizarEstoque(Long id, int estoque) {
        if (estoque < 0) {
            throw new RegraNegocioException("O estoque não pode ser negativo");
        }
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto não encontrado: id " + id));
        produto.setStock(estoque);
        return toDTO(produtoRepository.save(produto));
    }

    @Transactional
    public void remover(Long id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto não encontrado: id " + id));
        produtoRepository.delete(produto);
    }

    @Transactional(readOnly = true)
    public ProdutoDTO buscarPorSlug(String slug) {
        Produto produto = produtoRepository.findBySlug(slug)
                .filter(Produto::isActive)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto não encontrado: " + slug));
        return toDTO(produto);
    }

    /** Lista produtos ativos para a vitrine pública. */
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

    /** Lista todos os produtos (ativos e inativos) para a Central do Administrador. */
    @Transactional(readOnly = true)
    public PageResponse<ProdutoDTO> listarAdmin(String busca, Long categoriaId, Boolean ativo,
                                                Boolean estoqueBaixo, int page, int size) {
        Specification<Produto> spec = (root, query, cb) -> cb.conjunction();

        if (busca != null && !busca.isBlank()) {
            spec = spec.and(ProdutoSpecifications.comBusca(busca));
        }
        if (categoriaId != null) {
            spec = spec.and(ProdutoSpecifications.comCategoria(categoriaId));
        }
        if (ativo != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("active"), ativo));
        }
        if (Boolean.TRUE.equals(estoqueBaixo)) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("stock"), 5));
        }

        int paginaSegura = Math.max(page, 0);
        int tamanhoSeguro = Math.min(Math.max(size, 1), 100);
        Pageable pageable = PageRequest.of(paginaSegura, tamanhoSeguro, Sort.by("criadoEm").descending());

        Page<Produto> resultado = produtoRepository.findAll(spec, pageable);
        List<ProdutoDTO> conteudo = resultado.getContent().stream().map(this::toDTO).toList();

        return new PageResponse<>(conteudo, resultado.getNumber(), resultado.getSize(),
                resultado.getTotalElements(), resultado.getTotalPages());
    }

    @Transactional(readOnly = true)
    public List<CategoriaResumoDTO> listarCategorias() {
        return categoriaRepository.findAll(Sort.by("name").ascending())
                .stream()
                .map(c -> new CategoriaResumoDTO(c.getId(), c.getSlug(), c.getName()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MontadoraComModelosDTO> listarMontadorasComModelos() {
        return montadoraRepository.findAll(Sort.by("name").ascending())
                .stream()
                .map(m -> new MontadoraComModelosDTO(
                        m.getId(),
                        m.getSlug(),
                        m.getName(),
                        modeloVeiculoRepository.findByMontadoraId(m.getId())
                                .stream()
                                .sorted((a, b) -> a.getNome().compareToIgnoreCase(b.getNome()))
                                .map(mod -> new MontadoraComModelosDTO.ModeloResumoDTO(mod.getId(), mod.getNome()))
                                .toList()
                ))
                .toList();
    }

    @Transactional
    public MontadoraComModelosDTO.ModeloResumoDTO criarModeloVeiculo(Long montadoraId, String nomeModelo) {
        if (nomeModelo == null || nomeModelo.trim().length() < 2) {
            throw new RegraNegocioException("Informe o nome do modelo do veículo");
        }
        Montadora montadora = montadoraRepository.findById(montadoraId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Montadora não encontrada"));
        String limpo = nomeModelo.trim();
        boolean jaExiste = modeloVeiculoRepository.findByMontadoraId(montadoraId)
                .stream()
                .anyMatch(m -> m.getNome().equalsIgnoreCase(limpo));
        if (jaExiste) {
            throw new RegraNegocioException("Este modelo já está cadastrado para " + montadora.getName());
        }
        ModeloVeiculo novo = new ModeloVeiculo();
        novo.setMontadora(montadora);
        novo.setNome(limpo);
        ModeloVeiculo salvo = modeloVeiculoRepository.save(novo);
        return new MontadoraComModelosDTO.ModeloResumoDTO(salvo.getId(), salvo.getNome());
    }

    private void aplicarDados(Produto produto, ProdutoRequest request, String slug, Categoria categoria) {
        produto.setSlug(slug);
        produto.setName(request.name().trim());
        produto.setManufacturer(request.manufacturer().trim());
        produto.setDescription(request.description());
        produto.setPrice(request.price());
        produto.setStock(request.stock());
        produto.setActive(request.active() == null || request.active());

        List<String> galeria = new ArrayList<>();
        if (request.images() != null) {
            for (String url : request.images()) {
                if (url != null && !url.isBlank() && !galeria.contains(url.trim())) {
                    galeria.add(url.trim());
                }
            }
        }
        String capa = request.image() != null && !request.image().isBlank() ? request.image().trim() : null;
        if (capa != null && !galeria.contains(capa)) {
            galeria.add(0, capa);
        } else if (capa == null && !galeria.isEmpty()) {
            capa = galeria.get(0);
        }
        produto.setImage(capa);
        produto.setImages(galeria);
        produto.setCategory(categoria);

        List<ProdutoSpec> novasSpecs = new ArrayList<>();
        if (request.specs() != null) {
            for (ProdutoSpecDTO s : request.specs()) {
                if (s != null && s.label() != null && !s.label().isBlank()
                        && s.value() != null && !s.value().isBlank()) {
                    novasSpecs.add(new ProdutoSpec(s.label().trim(), s.value().trim()));
                }
            }
        }
        produto.setSpecs(novasSpecs);

        if (request.compatibilidades() != null) {
            produto.limparCompatibilidades();
            for (CompatibilidadeRequest c : request.compatibilidades()) {
                if (c == null || c.modeloId() == null || c.anoInicio() == null) continue;
                if (c.anoFim() != null && c.anoFim() < c.anoInicio()) {
                    throw new RegraNegocioException("O ano final não pode ser menor que o ano inicial na aplicação");
                }
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
    }

    private String normalizarSlug(String slugInformado, String nome) {
        String base = (slugInformado != null && !slugInformado.isBlank()) ? slugInformado : nome;
        String semAcento = Normalizer.normalize(base.trim().toLowerCase(), Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return semAcento.replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
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

        List<String> imagensDTO = (p.getImages() != null && !p.getImages().isEmpty())
                ? List.copyOf(p.getImages())
                : (p.getImage() != null && !p.getImage().isBlank() ? List.of(p.getImage()) : List.of());

        return new ProdutoDTO(
                p.getId(), p.getSlug(), p.getName(), p.getManufacturer(), p.getDescription(),
                p.getPrice(), p.getStock(), p.isActive(), p.getImage(), imagensDTO,
                categoriaDTO, specsDTO, compatDTO, p.getCriadoEm());
    }
}
