package guinacar.guinacarautomotive.service;

import guinacar.guinacarautomotive.dto.admin.AdminPedidoResponse;
import guinacar.guinacarautomotive.dto.admin.AtualizarStatusPedidoRequest;
import guinacar.guinacarautomotive.dto.admin.DespacharPedidoRequest;
import guinacar.guinacarautomotive.dto.common.PageResponse;
import guinacar.guinacarautomotive.dto.pedido.EntregaResponse;
import guinacar.guinacarautomotive.dto.pedido.ItemPedidoResponse;
import guinacar.guinacarautomotive.dto.pedido.PagamentoResponse;
import guinacar.guinacarautomotive.exception.RecursoNaoEncontradoException;
import guinacar.guinacarautomotive.exception.RegraNegocioException;
import guinacar.guinacarautomotive.model.Pedido;
import guinacar.guinacarautomotive.model.StatusPagamento;
import guinacar.guinacarautomotive.model.StatusPedido;
import guinacar.guinacarautomotive.repository.PedidoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AdminPedidoService {

    private final PedidoRepository pedidoRepository;

    public AdminPedidoService(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminPedidoResponse> listar(String statusRaw, boolean apenasEnvios, String busca, int page, int size) {
        StatusPedido status = null;
        if (statusRaw != null && !statusRaw.isBlank() && !"TODOS".equalsIgnoreCase(statusRaw)) {
            try {
                status = StatusPedido.valueOf(statusRaw.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RegraNegocioException("Status de pedido inválido: " + statusRaw);
            }
        }

        int paginaSegura = Math.max(page, 0);
        int tamanhoSeguro = Math.min(Math.max(size, 1), 100);
        Pageable pageable = PageRequest.of(paginaSegura, tamanhoSeguro, Sort.by("criadoEm").descending());

        String termo = busca != null ? busca.trim() : null;
        Page<Pedido> resultado = pedidoRepository.buscarAdmin(status, apenasEnvios, termo, pageable);

        return new PageResponse<>(
                resultado.getContent().stream().map(this::toResponse).toList(),
                resultado.getNumber(),
                resultado.getSize(),
                resultado.getTotalElements(),
                resultado.getTotalPages()
        );
    }

    @Transactional
    public AdminPedidoResponse atualizarStatus(Long pedidoId, AtualizarStatusPedidoRequest request) {
        Pedido pedido = pedidoRepository.findWithDetailsById(pedidoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Pedido não encontrado"));

        StatusPedido novoStatus;
        try {
            novoStatus = StatusPedido.valueOf(request.status().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RegraNegocioException("Status inválido: " + request.status());
        }

        pedido.setStatus(novoStatus);

        if (request.codigoRastreio() != null && !request.codigoRastreio().isBlank()) {
            pedido.setCodigoRastreio(request.codigoRastreio().trim().toUpperCase());
        }
        if (request.transportadora() != null && !request.transportadora().isBlank()) {
            pedido.setTransportadora(request.transportadora().trim());
        }

        if (novoStatus == StatusPedido.CONFIRMADO && pedido.getStatusPagamento() == StatusPagamento.PENDENTE) {
            pedido.setStatusPagamento(StatusPagamento.APROVADO);
            pedido.setPagoEm(LocalDateTime.now());
        } else if (novoStatus == StatusPedido.ENVIADO) {
            if (pedido.getCodigoRastreio() == null || pedido.getCodigoRastreio().isBlank()) {
                pedido.setCodigoRastreio(gerarCodigoRastreio());
            }
            if (pedido.getTransportadora() == null || pedido.getTransportadora().isBlank()) {
                pedido.setTransportadora("GuinaCar Express");
            }
            if (pedido.getEnviadoEm() == null) {
                pedido.setEnviadoEm(LocalDateTime.now());
            }
        } else if (novoStatus == StatusPedido.ENTREGUE) {
            if (pedido.getEnviadoEm() == null) {
                pedido.setEnviadoEm(LocalDateTime.now());
            }
            pedido.setEntregueEm(LocalDateTime.now());
        } else if (novoStatus == StatusPedido.CANCELADO && pedido.getStatusPagamento() == StatusPagamento.APROVADO) {
            pedido.setStatusPagamento(StatusPagamento.ESTORNADO);
        }

        return toResponse(pedidoRepository.save(pedido));
    }

    @Transactional
    public AdminPedidoResponse despachar(Long pedidoId, DespacharPedidoRequest request) {
        Pedido pedido = pedidoRepository.findWithDetailsById(pedidoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Pedido não encontrado"));

        if (pedido.getStatus() == StatusPedido.CANCELADO) {
            throw new RegraNegocioException("Não é possível despachar um pedido cancelado");
        }
        if (pedido.getStatus() == StatusPedido.AGUARDANDO_PAGAMENTO) {
            throw new RegraNegocioException("O pagamento do pedido ainda está pendente");
        }

        String rastreio = (request != null && request.codigoRastreio() != null && !request.codigoRastreio().isBlank())
                ? request.codigoRastreio().trim().toUpperCase()
                : gerarCodigoRastreio();
        String transportadora = (request != null && request.transportadora() != null && !request.transportadora().isBlank())
                ? request.transportadora().trim()
                : "GuinaCar Full Logística";

        pedido.setCodigoRastreio(rastreio);
        pedido.setTransportadora(transportadora);
        pedido.setStatus(StatusPedido.ENVIADO);
        pedido.setEnviadoEm(LocalDateTime.now());

        return toResponse(pedidoRepository.save(pedido));
    }

    private String gerarCodigoRastreio() {
        return "GC" + UUID.randomUUID().toString().replace("-", "").substring(0, 9).toUpperCase() + "BR";
    }

    public AdminPedidoResponse toResponse(Pedido pedido) {
        List<ItemPedidoResponse> itens = pedido.getItens().stream()
                .map(item -> new ItemPedidoResponse(
                        item.getId(),
                        item.getProdutoSlug(),
                        item.getNome(),
                        item.getImagem(),
                        item.getQuantidade(),
                        item.getPrecoUnitario()
                ))
                .toList();

        EntregaResponse entregaResp = new EntregaResponse(
                pedido.getDestinatario(),
                pedido.getCep(),
                pedido.getLogradouro(),
                pedido.getNumero(),
                pedido.getComplemento(),
                pedido.getBairro(),
                pedido.getCidade(),
                pedido.getEstado(),
                pedido.getTipoEntrega() != null ? pedido.getTipoEntrega().name() : null,
                pedido.getPrazoEntrega()
        );

        PagamentoResponse pagamentoResp = new PagamentoResponse(
                pedido.getFormaPagamento() != null ? pedido.getFormaPagamento().name() : null,
                pedido.getStatusPagamento() != null ? pedido.getStatusPagamento().name() : null,
                pedido.getParcelas(),
                pedido.getUltimosDigitosCartao(),
                pedido.getBandeiraCartao(),
                pedido.getCodigoTransacao(),
                pedido.getCodigoPix(),
                pedido.getLinhaDigitavelBoleto(),
                pedido.getPagoEm()
        );

        return new AdminPedidoResponse(
                pedido.getId(),
                pedido.getUsuario().getId(),
                pedido.getUsuario().getNome(),
                pedido.getUsuario().getEmail(),
                pedido.getUsuario().getTelefone(),
                pedido.getStatus().name(),
                pedido.getSubtotal(),
                pedido.getFrete(),
                pedido.getDesconto() != null ? pedido.getDesconto() : BigDecimal.ZERO,
                pedido.getTotal(),
                pedido.getCodigoRastreio(),
                pedido.getTransportadora(),
                pedido.getEnviadoEm(),
                pedido.getEntregueEm(),
                pedido.getCriadoEm(),
                entregaResp,
                pagamentoResp,
                itens
        );
    }
}
