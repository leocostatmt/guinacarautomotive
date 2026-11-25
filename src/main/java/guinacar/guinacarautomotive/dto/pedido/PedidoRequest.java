package guinacar.guinacarautomotive.dto.pedido;

import java.math.BigDecimal;
import java.util.List;

public class PedidoRequest {
    private List<ItemPedidoRequest> itens;
    private BigDecimal subtotal;
    private BigDecimal frete;
    private BigDecimal desconto;
    private BigDecimal total;
    private EntregaRequest entrega;
    private PagamentoRequest pagamento;

    public List<ItemPedidoRequest> getItens() { return itens; }
    public void setItens(List<ItemPedidoRequest> itens) { this.itens = itens; }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    public BigDecimal getFrete() { return frete; }
    public void setFrete(BigDecimal frete) { this.frete = frete; }
    public BigDecimal getDesconto() { return desconto; }
    public void setDesconto(BigDecimal desconto) { this.desconto = desconto; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public EntregaRequest getEntrega() { return entrega; }
    public void setEntrega(EntregaRequest entrega) { this.entrega = entrega; }
    public PagamentoRequest getPagamento() { return pagamento; }
    public void setPagamento(PagamentoRequest pagamento) { this.pagamento = pagamento; }
}
