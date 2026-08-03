package guinacar.guinacarautomotive.repository;

import guinacar.guinacarautomotive.model.Montadora;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MontadoraRepository extends JpaRepository<Montadora, Long> {

    Optional<Montadora> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
