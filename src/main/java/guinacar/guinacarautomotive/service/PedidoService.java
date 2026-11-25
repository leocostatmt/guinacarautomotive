package guinacar.guinacarautomotive.service;

import guinacar.guinacarautomotive.dto.pedido.EntregaRequest;
import guinacar.guinacarautomotive.dto.pedido.EntregaResponse;
import guinacar.guinacarautomotive.dto.pedido.ItemPedidoRequest;
import guinacar.guinacarautomotive.dto.pedido.ItemPedidoResponse;
import guinacar.guinacarautomotive.dto.pedido.PagamentoRequest;
import guinacar.guinacarautomotive.dto.pedido.PagamentoResponse;
import guinacar.guinacarautomotive.dto.pedido.PedidoRequest;
import guinacar.guinacarautomotive.dto.pedido.PedidoResponse;
import guinacar.guinacarautomotive.exception.RecursoNaoEncontradoException;
import guinacar.guinacarautomotive.exception.RegraNegocioException;
import guinacar.guinacarautomotive.model.FormaPagamento;
import guinacar.guinacarautomotive.model.ItemPedido;
import guinacar.guinacarautomotive.model.Pedido;
import guinacar.guinacarautomotive.model.StatusPagamento;
import guinacar.guinacarautomotive.model.StatusPedido;
import guinacar.guinacarautomotive.model.TipoEntrega;
import guinacar.guinacarautomotive.model.Usuario;
import guinacar.guinacarautomotive.repository.PedidoRepository;
import guinacar.guinacarautomotive.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

@Service
public class PedidoService {

    private static final BigDecimal FRETE_GRATIS_LIMITE = new BigDecimal("300.00");
    private static final BigDecimal FRETE_PADRAO = new BigDecimal("24.90");
    private static final BigDecimal FRETE_EXPRESSA = new BigDecimal("44.90");
    private static final BigDecimal DESCONTO_PIX_PERCENTUAL = new BigDecimal("0.05");

    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EnderecoService enderecoService;

    public PedidoService(PedidoRepository pedidoRepository,
                         UsuarioRepository usuarioRepository,
                         EnderecoService enderecoService) {
        this.pedidoRepository = pedidoRepository;
        this.usuarioRepository = usuarioRepository;
        this.enderecoService = enderecoService;
    }

    @Transactional
    public PedidoResponse criarPedido(Long usuarioId, PedidoRequest request) {
        if (request.getItens() == null || request.getItens().isEmpty()) {
            throw new RegraNegocioException("O pedido deve conter ao menos um item");
        }

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));

        BigDecimal subtotalCalculado = BigDecimal.ZERO;
        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);

        for (ItemPedidoRequest itemReq : request.getItens()) {
            int qtd = itemReq.getQuantity() != null && itemReq.getQuantity() > 0 ? itemReq.getQuantity() : 1;
            BigDecimal preco = itemReq.getPrice() != null ? itemReq.getPrice() : BigDecimal.ZERO;
            subtotalCalculado = subtotalCalculado.add(preco.multiply(BigDecimal.valueOf(qtd)));

            ItemPedido item = new ItemPedido();
            item.setProdutoSlug(itemReq.getId() != null ? itemReq.getId() : "produto");
            item.setNome(itemReq.getName() != null ? itemReq.getName() : "Produto");
            item.setImagem(itemReq.getImage());
            item.setQuantidade(qtd);
            item.setPrecoUnitario(preco);
            pedido.adicionarItem(item);
        }

        // 1. Validação e preenchimento da entrega
        EntregaRequest entrega = request.getEntrega();
        TipoEntrega tipoEntrega = parseTipoEntrega(entrega != null ? entrega.getTipoEntrega() : null);
        BigDecimal frete = calcularFrete(tipoEntrega, subtotalCalculado);

        pedido.setTipoEntrega(tipoEntrega);
        pedido.setPrazoEntrega(obterPrazoEntrega(tipoEntrega));
        if (entrega != null) {
            validarEntrega(entrega, tipoEntrega);
            pedido.setDestinatario(
                    entrega.getDestinatario() != null ? entrega.getDestinatario().trim() : usuario.getNome());
            pedido.setCep(entrega.getCep() != null ? entrega.getCep().replaceAll("\\D", "") : null);
            pedido.setLogradouro(entrega.getLogradouro());
            pedido.setNumero(entrega.getNumero());
            pedido.setComplemento(entrega.getComplemento());
            pedido.setBairro(entrega.getBairro());
            pedido.setCidade(entrega.getCidade());
            pedido.setEstado(entrega.getEstado() != null ? entrega.getEstado().trim().toUpperCase() : null);
        } else {
            pedido.setDestinatario(usuario.getNome());
        }

        // 2. Validação e processamento do pagamento
        PagamentoRequest pagamento = request.getPagamento();
        FormaPagamento formaPagamento = parseFormaPagamento(pagamento != null ? pagamento.getFormaPagamento() : null);
        BigDecimal desconto = formaPagamento == FormaPagamento.PIX
                ? subtotalCalculado.multiply(DESCONTO_PIX_PERCENTUAL).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        BigDecimal totalFinal = subtotalCalculado.add(frete).subtract(desconto).max(BigDecimal.ZERO);

        pedido.setSubtotal(subtotalCalculado.setScale(2, RoundingMode.HALF_UP));
        pedido.setFrete(frete.setScale(2, RoundingMode.HALF_UP));
        pedido.setDesconto(desconto.setScale(2, RoundingMode.HALF_UP));
        pedido.setTotal(totalFinal.setScale(2, RoundingMode.HALF_UP));
        pedido.setFormaPagamento(formaPagamento);

        String codigoTransacao = "GC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        pedido.setCodigoTransacao(codigoTransacao);

        processarPagamento(pedido, pagamento, formaPagamento, totalFinal, codigoTransacao);

        Pedido salvo = pedidoRepository.save(pedido);

        // Salva automaticamente o endereço na conta do usuário (ex.: primeira compra ou endereço novo)
        if (tipoEntrega != TipoEntrega.RETIRADA && entrega != null) {
            enderecoService.salvarAutomaticoSeNovo(usuario, entrega);
        }

        return toResponse(salvo);
    }

    @Transactional(readOnly = true)
    public List<PedidoResponse> listarPorUsuario(Long usuarioId) {
        return pedidoRepository.findByUsuarioIdOrderByCriadoEmDesc(usuarioId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public PedidoResponse confirmarPagamento(Long usuarioId, Long pedidoId) {
        Pedido pedido = pedidoRepository.findByIdAndUsuarioId(pedidoId, usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Pedido não encontrado"));

        if (pedido.getStatus() == StatusPedido.CANCELADO) {
            throw new RegraNegocioException("Não é possível confirmar o pagamento de um pedido cancelado");
        }
        if (pedido.getStatusPagamento() == StatusPagamento.APROVADO) {
            return toResponse(pedido);
        }

        pedido.setStatusPagamento(StatusPagamento.APROVADO);
        pedido.setStatus(StatusPedido.CONFIRMADO);
        pedido.setPagoEm(LocalDateTime.now());

        return toResponse(pedidoRepository.save(pedido));
    }

    @Transactional
    public PedidoResponse cancelarPedido(Long usuarioId, Long pedidoId) {
        Pedido pedido = pedidoRepository.findByIdAndUsuarioId(pedidoId, usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Pedido não encontrado"));

        if (pedido.getStatus() == StatusPedido.CANCELADO) {
            throw new RegraNegocioException("Este pedido já está cancelado");
        }
        if (pedido.getStatus() == StatusPedido.ENVIADO || pedido.getStatus() == StatusPedido.ENTREGUE) {
            throw new RegraNegocioException("Não é possível cancelar um pedido já enviado ou entregue");
        }

        pedido.setStatus(StatusPedido.CANCELADO);
        if (pedido.getStatusPagamento() == StatusPagamento.APROVADO) {
            pedido.setStatusPagamento(StatusPagamento.ESTORNADO);
        }
        return toResponse(pedidoRepository.save(pedido));
    }

    private void validarEntrega(EntregaRequest entrega, TipoEntrega tipoEntrega) {
        if (entrega.getDestinatario() == null || entrega.getDestinatario().trim().length() < 3) {
            throw new RegraNegocioException("Informe o nome do destinatário para a entrega");
        }
        if (tipoEntrega == TipoEntrega.RETIRADA) {
            return;
        }
        String cepDigits = entrega.getCep() != null ? entrega.getCep().replaceAll("\\D", "") : "";
        if (cepDigits.length() != 8) {
            throw new RegraNegocioException("Informe um CEP válido com 8 dígitos");
        }
        if (isBlank(entrega.getLogradouro()) || isBlank(entrega.getNumero())
                || isBlank(entrega.getBairro()) || isBlank(entrega.getCidade())
                || isBlank(entrega.getEstado()) || entrega.getEstado().trim().length() != 2) {
            throw new RegraNegocioException("Preencha o endereço completo de entrega");
        }
    }

    private void processarPagamento(Pedido pedido,
            PagamentoRequest pagamento,
            FormaPagamento forma,
            BigDecimal totalFinal,
            String codigoTransacao) {
        switch (forma) {
            case CARTAO_CREDITO -> {
                if (pagamento == null) {
                    throw new RegraNegocioException("Informe os dados do cartão de crédito");
                }
                String numeroLimpo = pagamento.getNumeroCartao() != null
                        ? pagamento.getNumeroCartao().replaceAll("\\D", "")
                        : "";
                if (numeroLimpo.length() < 13 || numeroLimpo.length() > 19 || !validarLuhn(numeroLimpo)) {
                    throw new RegraNegocioException("Número do cartão de crédito inválido");
                }
                if (isBlank(pagamento.getNomeTitular()) || pagamento.getNomeTitular().trim().length() < 3) {
                    throw new RegraNegocioException("Informe o nome impresso no cartão");
                }
                validarValidadeCartao(pagamento.getValidade());

                String cvv = pagamento.getCvv() != null ? pagamento.getCvv().replaceAll("\\D", "") : "";
                if (cvv.length() < 3 || cvv.length() > 4) {
                    throw new RegraNegocioException("Código de segurança (CVV) inválido");
                }

                int parcelas = pagamento.getParcelas() != null ? pagamento.getParcelas() : 1;
                if (parcelas < 1 || parcelas > 12) {
                    throw new RegraNegocioException("Número de parcelas inválido (1 a 12x)");
                }

                // Simulação realista: cartões terminados em 0000 são recusados pela operadora
                if (numeroLimpo.endsWith("0000")) {
                    throw new RegraNegocioException(
                            "Pagamento recusado pela operadora do cartão. Verifique o limite ou tente outro cartão.");
                }

                pedido.setParcelas(parcelas);
                pedido.setUltimosDigitosCartao(numeroLimpo.substring(numeroLimpo.length() - 4));
                pedido.setBandeiraCartao(detectarBandeira(numeroLimpo));
                pedido.setStatusPagamento(StatusPagamento.APROVADO);
                pedido.setStatus(StatusPedido.CONFIRMADO);
                pedido.setPagoEm(LocalDateTime.now());
            }
            case PIX -> {
                pedido.setParcelas(1);
                pedido.setStatusPagamento(StatusPagamento.PENDENTE);
                pedido.setStatus(StatusPedido.AGUARDANDO_PAGAMENTO);
                pedido.setCodigoPix(gerarPayloadPix(codigoTransacao, totalFinal));
            }
            case BOLETO -> {
                pedido.setParcelas(1);
                pedido.setStatusPagamento(StatusPagamento.PENDENTE);
                pedido.setStatus(StatusPedido.AGUARDANDO_PAGAMENTO);
                pedido.setLinhaDigitavelBoleto(gerarLinhaDigitavel(totalFinal));
            }
        }
    }

    private TipoEntrega parseTipoEntrega(String raw) {
        if (isBlank(raw))
            return TipoEntrega.PADRAO;
        try {
            return TipoEntrega.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return TipoEntrega.PADRAO;
        }
    }

    private FormaPagamento parseFormaPagamento(String raw) {
        if (isBlank(raw))
            return FormaPagamento.PIX;
        try {
            return FormaPagamento.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RegraNegocioException("Forma de pagamento inválida");
        }
    }

    private BigDecimal calcularFrete(TipoEntrega tipo, BigDecimal subtotal) {
        return switch (tipo) {
            case RETIRADA -> BigDecimal.ZERO;
            case EXPRESSA -> FRETE_EXPRESSA;
            case PADRAO -> subtotal.compareTo(FRETE_GRATIS_LIMITE) >= 0 ? BigDecimal.ZERO : FRETE_PADRAO;
        };
    }

    private String obterPrazoEntrega(TipoEntrega tipo) {
        return switch (tipo) {
            case RETIRADA -> "Pronto para retirada em até 2 horas úteis";
            case EXPRESSA -> "1 a 2 dias úteis";
            case PADRAO -> "5 a 7 dias úteis";
        };
    }

    private boolean validarLuhn(String digits) {
        int sum = 0;
        boolean alternate = false;
        for (int i = digits.length() - 1; i >= 0; i--) {
            int n = digits.charAt(i) - '0';
            if (alternate) {
                n *= 2;
                if (n > 9)
                    n -= 9;
            }
            sum += n;
            alternate = !alternate;
        }
        return sum % 10 == 0;
    }

    private void validarValidadeCartao(String validade) {
        if (isBlank(validade) || !validade.matches("^(0[1-9]|1[0-2])/\\d{2}$")) {
            throw new RegraNegocioException("Validade do cartão deve estar no formato MM/AA");
        }
        String[] parts = validade.split("/");
        int mes = Integer.parseInt(parts[0]);
        int ano = 2000 + Integer.parseInt(parts[1]);
        YearMonth expiracao = YearMonth.of(ano, mes);
        if (expiracao.isBefore(YearMonth.now())) {
            throw new RegraNegocioException("O cartão informado está vencido");
        }
    }

    private String detectarBandeira(String digits) {
        if (digits.startsWith("4"))
            return "Visa";
        if (digits.matches("^(5[1-5]|2[2-7]).*"))
            return "Mastercard";
        if (digits.matches("^(34|37).*"))
            return "Amex";
        if (digits.matches("^(4011|4312|4389|4514|4576|5041|5066|509|6277|6362|6363|650|6516|6550).*"))
            return "Elo";
        if (digits.startsWith("6062"))
            return "Hipercard";
        return "Cartão de Crédito";
    }

    private String gerarPayloadPix(String txId, BigDecimal valor) {
        String valorStr = valor.setScale(2, RoundingMode.HALF_UP).toPlainString();
        return "00020126580014BR.GOV.BCB.PIX0136guinacar-autopecas@pix.guinacar.com.br"
                + "52040000530398654" + String.format("%02d", valorStr.length()) + valorStr
                + "5802BR5918GUINACAR AUTOPECAS6009SAO PAULO62150511" + txId + "6304A1B2";
    }

    private String gerarLinhaDigitavel(BigDecimal valor) {
        long centavos = valor.multiply(BigDecimal.valueOf(100)).longValue();
        String valorCampo = String.format("%010d", Math.min(centavos, 9999999999L));
        int rand = (int) (Math.random() * 90000) + 10000;
        return "34191.79001 01043.510047 91020." + rand + "0 8 9876" + valorCampo;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private PedidoResponse toResponse(Pedido pedido) {
        List<ItemPedidoResponse> itens = pedido.getItens().stream()
                .map(item -> new ItemPedidoResponse(
                        item.getId(),
                        item.getProdutoSlug(),
                        item.getNome(),
                        item.getImagem(),
                        item.getQuantidade(),
                        item.getPrecoUnitario()))
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
                pedido.getPrazoEntrega());

        PagamentoResponse pagamentoResp = new PagamentoResponse(
                pedido.getFormaPagamento() != null ? pedido.getFormaPagamento().name() : null,
                pedido.getStatusPagamento() != null ? pedido.getStatusPagamento().name() : null,
                pedido.getParcelas(),
                pedido.getUltimosDigitosCartao(),
                pedido.getBandeiraCartao(),
                pedido.getCodigoTransacao(),
                pedido.getCodigoPix(),
                pedido.getLinhaDigitavelBoleto(),
                pedido.getPagoEm());

        return new PedidoResponse(
                pedido.getId(),
                pedido.getStatus().name(),
                pedido.getSubtotal(),
                pedido.getFrete(),
                pedido.getDesconto() != null ? pedido.getDesconto() : BigDecimal.ZERO,
                pedido.getTotal(),
                pedido.getCriadoEm(),
                entregaResp,
                pagamentoResp,
                itens);
    }
}
