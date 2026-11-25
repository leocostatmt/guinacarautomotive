package guinacar.guinacarautomotive.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "favoritos",
        uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "produto_slug"})
)
public class Favorito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "produto_slug", nullable = false, length = 160)
    private String produtoSlug;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    public Favorito() {
    }

    public Favorito(Usuario usuario, String produtoSlug) {
        this.usuario = usuario;
        this.produtoSlug = produtoSlug;
    }

    @PrePersist
    protected void aoCriar() {
        this.criadoEm = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getProdutoSlug() {
        return produtoSlug;
    }

    public void setProdutoSlug(String produtoSlug) {
        this.produtoSlug = produtoSlug;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }
}
