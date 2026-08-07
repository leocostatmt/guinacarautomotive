package guinacar.guinacarautomotive.dto.pedido;

import java.math.BigDecimal;

public class ItemPedidoRequest {
    private String id; // O ID do produto que vem do front-end
    private String name;
    private Integer quantity;
    private BigDecimal price;

    // Gere os Getters e Setters!
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
}