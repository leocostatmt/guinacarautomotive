package guinacar.guinacarautomotive.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Categoria de autopeças (ex.: Motor, Suspensão, Freios).
 * Os campos usam os mesmos nomes já adotados em src/data/categories.js
 * no front-end (slug, name, icon), para que o front possa futuramente
 * consumir esta API sem precisar remapear as propriedades.
 */
@Entity
@Table(name = "categorias")
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String slug;

    @Column(nullable = false, length = 100)
    private String name;

    // Nome do ícone react-icons usado no front-end (ex.: "FaCogs")
    @Column(length = 60)
    private String icon;

    public Categoria() {
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

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }
}
