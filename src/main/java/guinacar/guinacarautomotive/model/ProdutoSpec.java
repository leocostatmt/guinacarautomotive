package guinacar.guinacarautomotive.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

/**
 * Par label/value de especificação técnica de um produto
 * (ex.: {"label": "Material", "value": "Cerâmica"}).
 * Equivale exatamente ao array `specs` usado em src/data/products.js.
 */
@Embeddable
public class ProdutoSpec {

    @Column(name = "spec_label", length = 100)
    private String label;

    @Column(name = "spec_value", length = 255)
    private String value;

    public ProdutoSpec() {
    }

    public ProdutoSpec(String label, String value) {
        this.label = label;
        this.value = value;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
