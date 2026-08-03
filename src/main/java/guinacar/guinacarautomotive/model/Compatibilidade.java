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

/**
 * "Ficha de aplicação" de uma peça: para qual modelo de veículo ela serve,
 * e em qual faixa de anos (ex.: Onix, 2019 a 2023). anoFim nulo significa
 * "ainda em produção / compatível com o ano atual em diante".
 *
 * Um Produto pode ter várias Compatibilidades (ex.: a mesma pastilha de
 * freio serve para Onix 2019-2023 E para Prisma 2013-2020).
 */
@Entity
@Table(name = "compatibilidades")
public class Compatibilidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "modelo_id", nullable = false)
    private ModeloVeiculo modelo;

    @Column(name = "ano_inicio", nullable = false)
    private Integer anoInicio;

    // Nulo = compatível também com anos futuros (modelo ainda em produção)
    @Column(name = "ano_fim")
    private Integer anoFim;

    public Compatibilidade() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Produto getProduto() {
        return produto;
    }

    public void setProduto(Produto produto) {
        this.produto = produto;
    }

    public ModeloVeiculo getModelo() {
        return modelo;
    }

    public void setModelo(ModeloVeiculo modelo) {
        this.modelo = modelo;
    }

    public Integer getAnoInicio() {
        return anoInicio;
    }

    public void setAnoInicio(Integer anoInicio) {
        this.anoInicio = anoInicio;
    }

    public Integer getAnoFim() {
        return anoFim;
    }

    public void setAnoFim(Integer anoFim) {
        this.anoFim = anoFim;
    }
}
