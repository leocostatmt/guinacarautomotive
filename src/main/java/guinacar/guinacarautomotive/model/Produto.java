package guinacar.guinacarautomotive.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Produto (peça) à venda no catálogo.
 * <p>
 * Os campos de "vitrine" (name, manufacturer, price, image, description)
 * usam os mesmos nomes já usados em src/data/products.js no front-end.
 * <p>
 * {@code version} habilita bloqueio otimista do JPA: em alta concorrência
 * (dois pedidos baixando o mesmo estoque ao mesmo tempo), a segunda escrita
 * que tentar salvar uma versão desatualizada falha com
 * {@link jakarta.persistence.OptimisticLockException} em vez de
 * silenciosamente sobrescrever o estoque — a base para o controle de
 * estoque em tempo real do módulo de Pedidos (próxima etapa).
 */
@Entity
@Table(name = "produtos")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 160)
    private String slug;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 100)
    private String manufacturer;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(nullable = false)
    private boolean active = true;

    @Column(length = 500)
    private String image;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria category;

    @ElementCollection
    @CollectionTable(name = "produto_specs", joinColumns = @JoinColumn(name = "produto_id"))
    @OrderColumn(name = "posicao")
    private List<ProdutoSpec> specs = new ArrayList<>();

    @OneToMany(mappedBy = "produto", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    private List<Compatibilidade> compatibilidades = new ArrayList<>();

    @Version
    private Long version;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm;

    public Produto() {
    }

    @PrePersist
    protected void aoCriar() {
        LocalDateTime agora = LocalDateTime.now();
        this.criadoEm = agora;
        this.atualizadoEm = agora;
    }

    @PreUpdate
    protected void aoAtualizar() {
        this.atualizadoEm = LocalDateTime.now();
    }

    /** Mantém os dois lados da relação Produto <-> Compatibilidade sincronizados. */
    public void adicionarCompatibilidade(Compatibilidade compatibilidade) {
        compatibilidade.setProduto(this);
        this.compatibilidades.add(compatibilidade);
    }

    public void limparCompatibilidades() {
        this.compatibilidades.clear();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public Categoria getCategory() {
        return category;
    }

    public void setCategory(Categoria category) {
        this.category = category;
    }

    public List<ProdutoSpec> getSpecs() {
        return specs;
    }

    public void setSpecs(List<ProdutoSpec> specs) {
        this.specs = specs;
    }

    public List<Compatibilidade> getCompatibilidades() {
        return compatibilidades;
    }

    public void setCompatibilidades(List<Compatibilidade> compatibilidades) {
        this.compatibilidades = compatibilidades;
    }

    public Long getVersion() {
        return version;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public LocalDateTime getAtualizadoEm() {
        return atualizadoEm;
    }
}
