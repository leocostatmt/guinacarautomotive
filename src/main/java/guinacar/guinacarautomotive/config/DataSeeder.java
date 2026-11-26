package guinacar.guinacarautomotive.config;

import guinacar.guinacarautomotive.model.Categoria;
import guinacar.guinacarautomotive.model.ModeloVeiculo;
import guinacar.guinacarautomotive.model.Montadora;
import guinacar.guinacarautomotive.model.Produto;
import guinacar.guinacarautomotive.model.ProdutoSpec;
import guinacar.guinacarautomotive.model.Role;
import guinacar.guinacarautomotive.model.Usuario;
import guinacar.guinacarautomotive.repository.CategoriaRepository;
import guinacar.guinacarautomotive.repository.ModeloVeiculoRepository;
import guinacar.guinacarautomotive.repository.MontadoraRepository;
import guinacar.guinacarautomotive.repository.ProdutoRepository;
import guinacar.guinacarautomotive.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.Statement;
import java.util.List;
import java.util.Map;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final CategoriaRepository categoriaRepository;
    private final MontadoraRepository montadoraRepository;
    private final ModeloVeiculoRepository modeloVeiculoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProdutoRepository produtoRepository;
    private final PasswordEncoder passwordEncoder;
    private final DataSource dataSource;

    public DataSeeder(CategoriaRepository categoriaRepository,
                      MontadoraRepository montadoraRepository,
                      ModeloVeiculoRepository modeloVeiculoRepository,
                      UsuarioRepository usuarioRepository,
                      ProdutoRepository produtoRepository,
                      PasswordEncoder passwordEncoder,
                      DataSource dataSource) {
        this.categoriaRepository = categoriaRepository;
        this.montadoraRepository = montadoraRepository;
        this.modeloVeiculoRepository = modeloVeiculoRepository;
        this.usuarioRepository = usuarioRepository;
        this.produtoRepository = produtoRepository;
        this.passwordEncoder = passwordEncoder;
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) {
        sincronizarConstraintsEnum();
        if (categoriaRepository.count() == 0) {
            seedCategorias();
            seedMontadorasEModelos();
            log.info("Seed de categorias e montadoras executado com sucesso.");
        }
        seedAdminPadrao();
        seedProdutosIniciais();
    }

    /**
     * Hibernate 6 cria CHECK constraints para enums (@Enumerated(STRING)) ao criar
     * a tabela, mas ddl-auto=update não atualiza essas constraints quando novos
     * valores são adicionados (ex.: FUNCIONARIO em Role ou AGUARDANDO_PAGAMENTO em StatusPedido).
     */
    private void sincronizarConstraintsEnum() {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute("ALTER TABLE IF EXISTS usuarios DROP CONSTRAINT IF EXISTS usuarios_role_check");
            stmt.execute(
                    "ALTER TABLE IF EXISTS usuarios ADD CONSTRAINT usuarios_role_check " +
                            "CHECK (role IN ('USER', 'FUNCIONARIO', 'ADMIN'))");

            stmt.execute("ALTER TABLE IF EXISTS pedidos DROP CONSTRAINT IF EXISTS pedidos_status_check");
            stmt.execute(
                    "ALTER TABLE IF EXISTS pedidos ADD CONSTRAINT pedidos_status_check " +
                            "CHECK (status IN ('AGUARDANDO_PAGAMENTO', 'CONFIRMADO', 'EM_SEPARACAO', 'ENVIADO', 'ENTREGUE', 'CANCELADO'))");

            log.info("Constraints de enum (usuarios_role_check / pedidos_status_check) sincronizadas.");
        } catch (Exception e) {
            log.warn("Não foi possível atualizar constraints de enum automaticamente: {}", e.getMessage());
        }
    }

    private void seedAdminPadrao() {
        if (usuarioRepository.existsByRole(Role.ADMIN)) {
            return;
        }
        String emailAdmin = "admin@guinacar.com.br";
        if (usuarioRepository.existsByEmail(emailAdmin)) {
            return;
        }
        Usuario admin = new Usuario();
        admin.setNome("Administrador GuinaCar");
        admin.setEmail(emailAdmin);
        admin.setSenha(passwordEncoder.encode("Admin@123"));
        admin.setCpf("52998224725");
        admin.setTelefone("11999990000");
        admin.setRole(Role.ADMIN);
        admin.setCargo("Proprietário");
        admin.setDepartamento("Diretoria");
        admin.setAtivo(true);
        usuarioRepository.save(admin);
        log.info("Conta ADMIN padrão criada -> email: {} | senha: {}", emailAdmin, "Admin@123");
    }

    private void seedProdutosIniciais() {
        if (produtoRepository.count() > 0) {
            return;
        }
        criarProdutoSeed("pastilha-freio-bosch", "Pastilha de Freio Bosch", "Bosch",
                "Pastilhas de freio dianteiras Bosch com composto cerâmico de baixo ruído e alta durabilidade.",
                new BigDecimal("189.90"), 34, "freios",
                "https://placehold.co/600x460/17171a/e0122a?font=oswald&text=Pastilha+Bosch",
                List.of(new ProdutoSpec("Posição", "Dianteira"), new ProdutoSpec("Material", "Cerâmico")));

        criarProdutoSeed("filtro-oleo-fram", "Filtro de Óleo Fram", "Fram",
                "Filtro de óleo Fram com elemento filtrante de alta retenção para proteção do motor.",
                new BigDecimal("39.90"), 62, "lubrificantes",
                "https://placehold.co/600x460/17171a/f4f4f3?font=oswald&text=Filtro+Fram",
                List.of(new ProdutoSpec("Tipo", "Rosca"), new ProdutoSpec("Vida útil", "Até 10.000 km")));

        criarProdutoSeed("amortecedor-cofap", "Amortecedor Cofap", "Cofap",
                "Amortecedor dianteiro Cofap a gás pressurizado para estabilidade e conforto.",
                new BigDecimal("279.00"), 18, "suspensao",
                "https://placehold.co/600x460/17171a/e0122a?font=oswald&text=Amortecedor+Cofap",
                List.of(new ProdutoSpec("Tecnologia", "Gás pressurizado"), new ProdutoSpec("Garantia", "12 meses")));

        criarProdutoSeed("farol-honda-civic", "Farol Honda Civic", "Original",
                "Farol principal de alta luminosidade com encaixe original de fábrica.",
                new BigDecimal("549.00"), 4, "iluminacao",
                "https://placehold.co/600x460/17171a/f4f4f3?font=oswald&text=Farol+Civic",
                List.of(new ProdutoSpec("Lado", "Direito"), new ProdutoSpec("Lente", "Policarbonato")));

        criarProdutoSeed("bateria-moura-60ah", "Bateria Moura 60Ah", "Moura",
                "Bateria automotiva selada Moura 60Ah com alta corrente de partida a frio.",
                new BigDecimal("489.90"), 11, "eletrica",
                "https://placehold.co/600x460/17171a/e0122a?font=oswald&text=Bateria+Moura+60Ah",
                List.of(new ProdutoSpec("Capacidade", "60Ah"), new ProdutoSpec("Garantia", "24 meses")));

        criarProdutoSeed("kit-correia-dentada-gates", "Kit Correia Dentada Gates", "Gates",
                "Kit completo com correia sincronizadora e tensor para manutenção preventiva do motor.",
                new BigDecimal("239.50"), 3, "motor",
                "https://placehold.co/600x460/17171a/f4f4f3?font=oswald&text=Kit+Gates",
                List.of(new ProdutoSpec("Aplicação", "Motores 1.0 / 1.4 / 1.6"), new ProdutoSpec("Troca", "60.000 km")));

        log.info("Seed de produtos iniciais executado com sucesso.");
    }

    private void criarProdutoSeed(String slug, String nome, String fabricante, String descricao,
                                  BigDecimal preco, int estoque, String categoriaSlug, String imagem,
                                  List<ProdutoSpec> specs) {
        categoriaRepository.findBySlug(categoriaSlug).ifPresent(cat -> {
            if (!produtoRepository.existsBySlug(slug)) {
                Produto p = new Produto();
                p.setSlug(slug);
                p.setName(nome);
                p.setManufacturer(fabricante);
                p.setDescription(descricao);
                p.setPrice(preco);
                p.setStock(estoque);
                p.setActive(true);
                p.setImage(imagem);
                p.setCategory(cat);
                p.setSpecs(specs);
                produtoRepository.save(p);
            }
        });
    }

    private void seedCategorias() {
        List<Categoria> categorias = List.of(
                novaCategoria("motor", "Motor", "FaCogs"),
                novaCategoria("suspensao", "Suspensão", "FaCompressArrowsAlt"),
                novaCategoria("freios", "Freios", "FaStopCircle"),
                novaCategoria("eletrica", "Elétrica", "FaBolt"),
                novaCategoria("iluminacao", "Iluminação", "FaLightbulb"),
                novaCategoria("arrefecimento", "Arrefecimento", "FaFan"),
                novaCategoria("direcao", "Direção", "FaCompass"),
                novaCategoria("escapamento", "Escapamento", "FaSmog"),
                novaCategoria("lubrificantes", "Lubrificantes", "FaOilCan"),
                novaCategoria("acessorios", "Acessórios", "FaShoppingBag")
        );
        categoriaRepository.saveAll(categorias);
    }

    private Categoria novaCategoria(String slug, String name, String icon) {
        Categoria c = new Categoria();
        c.setSlug(slug);
        c.setName(name);
        c.setIcon(icon);
        return c;
    }

    private void seedMontadorasEModelos() {
        Map<String, List<String>> montadorasEModelos = Map.ofEntries(
                Map.entry("Chevrolet", List.of("Onix", "Prisma", "Corsa")),
                Map.entry("Volkswagen", List.of("Gol", "Polo", "Voyage")),
                Map.entry("Fiat", List.of("Uno", "Palio", "Argo")),
                Map.entry("Ford", List.of("Ka", "Fiesta", "EcoSport")),
                Map.entry("Toyota", List.of("Corolla", "Etios")),
                Map.entry("Honda", List.of("Civic", "Fit")),
                Map.entry("Hyundai", List.of("HB20", "Creta")),
                Map.entry("Renault", List.of("Sandero", "Logan")),
                Map.entry("Nissan", List.of("March", "Versa")),
                Map.entry("Jeep", List.of("Renegade", "Compass")),
                Map.entry("Peugeot", List.of("208", "2008")),
                Map.entry("Citroën", List.of("C3", "C4")),
                Map.entry("BMW", List.of("Série 3", "X1")),
                Map.entry("Mercedes-Benz", List.of("Classe A", "Classe C")),
                Map.entry("Audi", List.of("A3", "A4"))
        );

        montadorasEModelos.forEach((nomeMontadora, modelos) -> {
            Montadora montadora = new Montadora();
            montadora.setSlug(slugify(nomeMontadora));
            montadora.setName(nomeMontadora);
            montadora = montadoraRepository.save(montadora);

            for (String nomeModelo : modelos) {
                ModeloVeiculo modelo = new ModeloVeiculo();
                modelo.setMontadora(montadora);
                modelo.setNome(nomeModelo);
                modeloVeiculoRepository.save(modelo);
            }
        });
    }

    private String slugify(String texto) {
        return texto.toLowerCase()
                .replace("ë", "e")
                .replace("é", "e")
                .replace(" ", "-");
    }
}
