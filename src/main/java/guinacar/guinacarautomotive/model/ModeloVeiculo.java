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

/**
 * Modelo de veículo de uma montadora (ex.: Chevrolet Onix, VW Gol).
 * Junto com {@link Compatibilidade}, permite modelar compatibilidade de
 * peças por montadora + modelo + ano, como pedido nos requisitos de negócio.
 */
@Entity
@Table(name = "modelos_veiculo", uniqueConstraints = @UniqueConstraint(columnNames = {"montadora_id", "nome"}))
public class ModeloVeiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "montadora_id", nullable = false)
    private Montadora montadora;

    @Column(name = "nome", nullable = false, length = 100)
    private String nome;

    public ModeloVeiculo() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Montadora getMontadora() {
        return montadora;
    }

    public void setMontadora(Montadora montadora) {
        this.montadora = montadora;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }
}
