package guinacar.guinacarautomotive.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.math.BigDecimal;

@Entity
@Table(
        name = "itens_carrinho",
        uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "produto_slug"})
)
public class ItemCarrinho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "produto_slug", nullable = false, length = 160)
    private String produtoSlug;

    @Column(nullable = false, length = 200)
    private String nome;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal preco;

    @Column(length = 500)
    private String imagem;

    @Column(nullable = false)
    private Integer quantidade;

    public ItemCarrinho() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public String getProdutoSlug() { return produtoSlug; }
    public void setProdutoSlug(String produtoSlug) { this.produtoSlug = produtoSlug; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public BigDecimal getPreco() { return preco; }
    public void setPreco(BigDecimal preco) { this.preco = preco; }
    public String getImagem() { return imagem; }
    public void setImagem(String imagem) { this.imagem = imagem; }
    public Integer getQuantidade() { return quantidade; }
    public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }
}
