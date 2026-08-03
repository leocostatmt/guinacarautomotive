package guinacar.guinacarautomotive.config;

import guinacar.guinacarautomotive.model.Categoria;
import guinacar.guinacarautomotive.model.ModeloVeiculo;
import guinacar.guinacarautomotive.model.Montadora;
import guinacar.guinacarautomotive.repository.CategoriaRepository;
import guinacar.guinacarautomotive.repository.ModeloVeiculoRepository;
import guinacar.guinacarautomotive.repository.MontadoraRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final CategoriaRepository categoriaRepository;
    private final MontadoraRepository montadoraRepository;
    private final ModeloVeiculoRepository modeloVeiculoRepository;

    public DataSeeder(CategoriaRepository categoriaRepository,
                       MontadoraRepository montadoraRepository,
                       ModeloVeiculoRepository modeloVeiculoRepository) {
        this.categoriaRepository = categoriaRepository;
        this.montadoraRepository = montadoraRepository;
        this.modeloVeiculoRepository = modeloVeiculoRepository;
    }

    @Override
    public void run(String... args) {
        if (categoriaRepository.count() == 0) {
            seedCategorias();
            seedMontadorasEModelos();
            log.info("Seed de categorias e montadoras executado com sucesso.");
        }
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