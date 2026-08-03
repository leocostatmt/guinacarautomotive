package guinacar.guinacarautomotive.repository;

import guinacar.guinacarautomotive.model.ModeloVeiculo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ModeloVeiculoRepository extends JpaRepository<ModeloVeiculo, Long> {

    List<ModeloVeiculo> findByMontadoraId(Long montadoraId);
}
