package guinacar.guinacarautomotive.dto.pedido;

import java.math.BigDecimal;
import java.util.List;

public class PedidoRequest {
    private List<ItemPedidoRequest> itens;
    private BigDecimal subtotal;
    private BigDecimal frete;
    private BigDecimal total;

    // Gere os Getters e Setters!
    public List<ItemPedidoRequest> getItens() { return itens; }
    public void setItens(List<ItemPedidoRequest> itens) { this.itens = itens; }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    public BigDecimal getFrete() { return frete; }
    public void setFrete(BigDecimal frete) { this.frete = frete; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
}