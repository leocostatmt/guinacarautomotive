package guinacar.guinacarautomotive.controller;

import guinacar.guinacarautomotive.dto.pedido.PedidoRequest;
import guinacar.guinacarautomotive.security.UserDetailsImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    // Em um cenário real, você injetaria o seu PedidoService aqui no construtor
    // private final PedidoService pedidoService;

    @PostMapping
    public ResponseEntity<?> criarPedido(
            @RequestBody PedidoRequest pedidoRequest, 
            @AuthenticationPrincipal UserDetailsImpl usuarioAutenticado 
    ) {
        
        // 1. Identificando quem está comprando
        String emailComprador = usuarioAutenticado.getUsername();
        
        // 2. Imprimindo os dados recebidos para termos certeza que a conexão funcionou
        System.out.println("=========================================");
        System.out.println("NOVO PEDIDO RECEBIDO!");
        System.out.println("Cliente: " + emailComprador);
        System.out.println("Total a pagar: R$ " + pedidoRequest.getTotal());
        System.out.println("Itens no carrinho:");
        
        pedidoRequest.getItens().forEach(item -> {
            System.out.println(" - " + item.getQuantity() + "x " + item.getName() + " (R$ " + item.getPrice() + ")");
        });
        System.out.println("=========================================");

        // 3. Onde a mágica do banco de dados acontecerá:
        // pedidoService.salvar(pedidoRequest, emailComprador);

        // 4. Retornando sucesso para o React
        return ResponseEntity.ok("Pedido salvo com sucesso!");
    }
}