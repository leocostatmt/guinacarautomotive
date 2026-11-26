package guinacar.guinacarautomotive.service;

import guinacar.guinacarautomotive.dto.admin.AdminPedidoResponse;
import guinacar.guinacarautomotive.dto.admin.DashboardResponse;
import guinacar.guinacarautomotive.dto.admin.DashboardResponse.ResumoPagamentoDTO;
import guinacar.guinacarautomotive.dto.admin.DashboardResponse.TopProdutoDTO;
import guinacar.guinacarautomotive.dto.admin.DashboardResponse.VendaDiariaDTO;
import guinacar.guinacarautomotive.dto.admin.RelatorioVendasResponse;
import guinacar.guinacarautomotive.model.ItemPedido;
import guinacar.guinacarautomotive.model.Pedido;
import guinacar.guinacarautomotive.model.Role;
import guinacar.guinacarautomotive.model.StatusPedido;
import guinacar.guinacarautomotive.repository.PedidoRepository;
import guinacar.guinacarautomotive.repository.ProdutoRepository;
import guinacar.guinacarautomotive.repository.UsuarioRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminDashboardService {

    private static final DateTimeFormatter DIA_FMT = DateTimeFormatter.ofPattern("dd/MM");

    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProdutoRepository produtoRepository;
    private final AdminPedidoService adminPedidoService;

    public AdminDashboardService(PedidoRepository pedidoRepository,
                                 UsuarioRepository usuarioRepository,
                                 ProdutoRepository produtoRepository,
                                 AdminPedidoService adminPedidoService) {
        this.pedidoRepository = pedidoRepository;
        this.usuarioRepository = usuarioRepository;
        this.produtoRepository = produtoRepository;
        this.adminPedidoService = adminPedidoService;
    }

    @Transactional(readOnly = true)
    public DashboardResponse obterDashboard() {
        LocalDate hoje = LocalDate.now();
        LocalDateTime inicioHoje = hoje.atStartOfDay();
        LocalDateTime fimHoje = hoje.atTime(LocalTime.MAX);
        LocalDateTime inicioMes = hoje.withDayOfMonth(1).atStartOfDay();

        BigDecimal faturamentoTotal = safeBigDecimal(pedidoRepository.somarFaturamentoTotal());
        BigDecimal faturamentoHoje = safeBigDecimal(pedidoRepository.somarFaturamentoPeriodo(inicioHoje, fimHoje));
        BigDecimal faturamentoMes = safeBigDecimal(pedidoRepository.somarFaturamentoPeriodo(inicioMes, fimHoje));

        long totalPedidos = pedidoRepository.count();
        long pedidosHoje = pedidoRepository.countByCriadoEmBetween(inicioHoje, fimHoje);
        long enviosPendentes = pedidoRepository.countByStatusIn(
                List.of(StatusPedido.CONFIRMADO, StatusPedido.EM_SEPARACAO));

        Map<String, Long> porStatus = new LinkedHashMap<>();
        for (StatusPedido s : StatusPedido.values()) {
            porStatus.put(s.name(), 0L);
        }
        long cancelados = 0L;
        for (Object[] row : pedidoRepository.contarPorStatus()) {
            StatusPedido st = (StatusPedido) row[0];
            long count = ((Number) row[1]).longValue();
            porStatus.put(st.name(), count);
            if (st == StatusPedido.CANCELADO) {
                cancelados = count;
            }
        }

        long pedidosValidos = Math.max(0, totalPedidos - cancelados);
        BigDecimal ticketMedio = pedidosValidos > 0
                ? faturamentoTotal.divide(BigDecimal.valueOf(pedidosValidos), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        long totalClientes = usuarioRepository.countByRole(Role.USER);
        long totalFuncionarios = usuarioRepository.countByRoleIn(List.of(Role.FUNCIONARIO, Role.ADMIN));
        long produtosAtivos = produtoRepository.countByActiveTrue();
        long produtosEstoqueBaixo = produtoRepository.countByActiveTrueAndStockLessThanEqual(5);

        // Série diária dos últimos 7 dias
        LocalDate inicio7Dias = hoje.minusDays(6);
        List<Pedido> pedidos7Dias = pedidoRepository.findByCriadoEmBetweenOrderByCriadoEmAsc(
                inicio7Dias.atStartOfDay(), fimHoje);
        List<VendaDiariaDTO> serie7Dias = construirSerieDiaria(inicio7Dias, hoje, pedidos7Dias);

        // Resumo por forma de pagamento
        List<ResumoPagamentoDTO> vendasPorPagamento = pedidoRepository.resumirPorFormaPagamento()
                .stream()
                .map(row -> new ResumoPagamentoDTO(
                        row[0].toString(),
                        ((Number) row[1]).longValue(),
                        safeBigDecimal((BigDecimal) row[2])
                ))
                .toList();

        // Top 5 produtos
        List<TopProdutoDTO> topProdutos = pedidoRepository.listarTopProdutos(PageRequest.of(0, 5))
                .stream()
                .map(row -> new TopProdutoDTO(
                        (String) row[0],
                        (String) row[1],
                        ((Number) row[2]).longValue(),
                        safeBigDecimal((BigDecimal) row[3])
                ))
                .toList();

        List<AdminPedidoResponse> recentes = pedidoRepository.findTop6ByOrderByCriadoEmDesc()
                .stream()
                .map(adminPedidoService::toResponse)
                .toList();

        return new DashboardResponse(
                faturamentoTotal,
                faturamentoHoje,
                faturamentoMes,
                ticketMedio,
                totalPedidos,
                pedidosHoje,
                enviosPendentes,
                totalClientes,
                totalFuncionarios,
                produtosAtivos,
                produtosEstoqueBaixo,
                serie7Dias,
                porStatus,
                vendasPorPagamento,
                topProdutos,
                recentes
        );
    }

    @Transactional(readOnly = true)
    public RelatorioVendasResponse gerarRelatorioVendas(LocalDate inicio, LocalDate fim) {
        LocalDate dataFim = fim != null ? fim : LocalDate.now();
        LocalDate dataInicio = inicio != null ? inicio : dataFim.minusDays(29);
        if (dataInicio.isAfter(dataFim)) {
            LocalDate tmp = dataInicio;
            dataInicio = dataFim;
            dataFim = tmp;
        }

        List<Pedido> pedidos = pedidoRepository.findByCriadoEmBetweenOrderByCriadoEmAsc(
                dataInicio.atStartOfDay(), dataFim.atTime(LocalTime.MAX));

        long totalPedidos = pedidos.size();
        long cancelados = 0;
        BigDecimal receitaBruta = BigDecimal.ZERO;
        BigDecimal totalDescontos = BigDecimal.ZERO;
        BigDecimal totalFretes = BigDecimal.ZERO;
        BigDecimal receitaLiquida = BigDecimal.ZERO;

        Map<String, long[]> pagCount = new LinkedHashMap<>();
        Map<String, BigDecimal> pagTotal = new LinkedHashMap<>();
        Map<String, ProdutoAcumulado> prodMap = new LinkedHashMap<>();

        for (Pedido p : pedidos) {
            if (p.getStatus() == StatusPedido.CANCELADO) {
                cancelados++;
                continue;
            }
            receitaBruta = receitaBruta.add(safeBigDecimal(p.getSubtotal()));
            totalDescontos = totalDescontos.add(safeBigDecimal(p.getDesconto()));
            totalFretes = totalFretes.add(safeBigDecimal(p.getFrete()));
            receitaLiquida = receitaLiquida.add(safeBigDecimal(p.getTotal()));

            String forma = p.getFormaPagamento() != null ? p.getFormaPagamento().name() : "OUTROS";
            pagCount.computeIfAbsent(forma, k -> new long[]{0})[0]++;
            pagTotal.merge(forma, safeBigDecimal(p.getTotal()), BigDecimal::add);

            for (ItemPedido item : p.getItens()) {
                ProdutoAcumulado ac = prodMap.computeIfAbsent(
                        item.getProdutoSlug(),
                        k -> new ProdutoAcumulado(item.getProdutoSlug(), item.getNome()));
                ac.qtd += item.getQuantidade();
                ac.receita = ac.receita.add(
                        safeBigDecimal(item.getPrecoUnitario()).multiply(BigDecimal.valueOf(item.getQuantidade())));
            }
        }

        long validos = totalPedidos - cancelados;
        BigDecimal ticketMedio = validos > 0
                ? receitaLiquida.divide(BigDecimal.valueOf(validos), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        List<VendaDiariaDTO> serieDiaria = construirSerieDiaria(dataInicio, dataFim, pedidos);

        List<ResumoPagamentoDTO> porPagamento = pagCount.entrySet().stream()
                .map(e -> new ResumoPagamentoDTO(
                        e.getKey(),
                        e.getValue()[0],
                        pagTotal.getOrDefault(e.getKey(), BigDecimal.ZERO)))
                .toList();

        List<TopProdutoDTO> topProdutos = prodMap.values().stream()
                .sorted(Comparator.comparingLong((ProdutoAcumulado a) -> a.qtd).reversed())
                .limit(10)
                .map(a -> new TopProdutoDTO(a.slug, a.nome, a.qtd, a.receita))
                .toList();

        return new RelatorioVendasResponse(
                dataInicio.toString(),
                dataFim.toString(),
                totalPedidos,
                validos,
                cancelados,
                receitaBruta.setScale(2, RoundingMode.HALF_UP),
                totalDescontos.setScale(2, RoundingMode.HALF_UP),
                totalFretes.setScale(2, RoundingMode.HALF_UP),
                receitaLiquida.setScale(2, RoundingMode.HALF_UP),
                ticketMedio,
                serieDiaria,
                porPagamento,
                topProdutos
        );
    }

    private List<VendaDiariaDTO> construirSerieDiaria(LocalDate inicio, LocalDate fim, List<Pedido> pedidos) {
        Map<LocalDate, DiaAcumulado> mapa = new LinkedHashMap<>();
        for (LocalDate d = inicio; !d.isAfter(fim); d = d.plusDays(1)) {
            mapa.put(d, new DiaAcumulado());
        }

        for (Pedido p : pedidos) {
            if (p.getStatus() == StatusPedido.CANCELADO) continue;
            LocalDate dia = p.getCriadoEm().toLocalDate();
            DiaAcumulado ac = mapa.get(dia);
            if (ac != null) {
                ac.pedidos++;
                ac.total = ac.total.add(safeBigDecimal(p.getTotal()));
            }
        }

        return mapa.entrySet().stream()
                .map(e -> new VendaDiariaDTO(
                        e.getKey().format(DIA_FMT),
                        e.getValue().pedidos,
                        e.getValue().total.setScale(2, RoundingMode.HALF_UP)))
                .toList();
    }

    private BigDecimal safeBigDecimal(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private static class DiaAcumulado {
        long pedidos = 0;
        BigDecimal total = BigDecimal.ZERO;
    }

    private static class ProdutoAcumulado {
        final String slug;
        final String nome;
        long qtd = 0;
        BigDecimal receita = BigDecimal.ZERO;

        ProdutoAcumulado(String slug, String nome) {
            this.slug = slug;
            this.nome = nome;
        }
    }
}
