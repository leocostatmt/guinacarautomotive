package guinacar.guinacarautomotive.service;

import guinacar.guinacarautomotive.dto.carrinho.ItemCarrinhoDTO;
import guinacar.guinacarautomotive.exception.RecursoNaoEncontradoException;
import guinacar.guinacarautomotive.model.ItemCarrinho;
import guinacar.guinacarautomotive.model.Usuario;
import guinacar.guinacarautomotive.repository.ItemCarrinhoRepository;
import guinacar.guinacarautomotive.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class CarrinhoService {

    private final ItemCarrinhoRepository itemCarrinhoRepository;
    private final UsuarioRepository usuarioRepository;

    public CarrinhoService(ItemCarrinhoRepository itemCarrinhoRepository,
                           UsuarioRepository usuarioRepository) {
        this.itemCarrinhoRepository = itemCarrinhoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<ItemCarrinhoDTO> listar(Long usuarioId) {
        return itemCarrinhoRepository.findByUsuarioIdOrderByIdAsc(usuarioId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional
    public List<ItemCarrinhoDTO> sincronizar(Long usuarioId, List<ItemCarrinhoDTO> itens) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));

        // Consolida itens recebidos por slug
        Map<String, ItemCarrinhoDTO> desejados = new LinkedHashMap<>();
        if (itens != null) {
            for (ItemCarrinhoDTO dto : itens) {
                if (dto == null || dto.id() == null || dto.id().isBlank()) continue;
                int qtd = dto.quantity() != null && dto.quantity() > 0 ? dto.quantity() : 1;
                ItemCarrinhoDTO existente = desejados.get(dto.id());
                if (existente != null) {
                    desejados.put(dto.id(), new ItemCarrinhoDTO(
                            dto.id(),
                            dto.name() != null ? dto.name() : existente.name(),
                            dto.price() != null ? dto.price() : existente.price(),
                            dto.image() != null ? dto.image() : existente.image(),
                            existente.quantity() + qtd
                    ));
                } else {
                    desejados.put(dto.id(), new ItemCarrinhoDTO(
                            dto.id(),
                            dto.name() != null ? dto.name() : "Produto",
                            dto.price() != null ? dto.price() : BigDecimal.ZERO,
                            dto.image(),
                            qtd
                    ));
                }
            }
        }

        List<ItemCarrinho> atuais = itemCarrinhoRepository.findByUsuarioIdOrderByIdAsc(usuarioId);
        Map<String, ItemCarrinho> atuaisPorSlug = new LinkedHashMap<>();
        for (ItemCarrinho item : atuais) {
            atuaisPorSlug.put(item.getProdutoSlug(), item);
        }

        // Remove itens que não estão mais no carrinho
        for (ItemCarrinho atual : atuais) {
            if (!desejados.containsKey(atual.getProdutoSlug())) {
                itemCarrinhoRepository.delete(atual);
            }
        }

        // Atualiza existentes ou insere novos
        for (ItemCarrinhoDTO dto : desejados.values()) {
            ItemCarrinho entity = atuaisPorSlug.get(dto.id());
            if (entity == null) {
                entity = new ItemCarrinho();
                entity.setUsuario(usuario);
                entity.setProdutoSlug(dto.id());
            }
            entity.setNome(dto.name());
            entity.setPreco(dto.price());
            entity.setImagem(dto.image());
            entity.setQuantidade(dto.quantity());
            itemCarrinhoRepository.save(entity);
        }

        itemCarrinhoRepository.flush();
        return listar(usuarioId);
    }

    @Transactional
    public void limpar(Long usuarioId) {
        itemCarrinhoRepository.deleteByUsuarioId(usuarioId);
    }

    private ItemCarrinhoDTO toDTO(ItemCarrinho item) {
        return new ItemCarrinhoDTO(
                item.getProdutoSlug(),
                item.getNome(),
                item.getPreco(),
                item.getImagem(),
                item.getQuantidade()
        );
    }
}
