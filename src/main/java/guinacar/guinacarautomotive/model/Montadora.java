package guinacar.guinacarautomotive.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Montadora do veículo (ex.: Chevrolet, Volkswagen, Fiat).
 * Equivale ao conceito de "marca" em src/data/brands.js no front-end,
 * mas aqui recebe o nome "Montadora" para não colidir com a marca
 * FABRICANTE da peça (ex.: Bosch), que é um campo livre em Produto.
 */
@Entity
@Table(name = "montadoras")
public class Montadora {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String slug;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    public Montadora() {
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
}
