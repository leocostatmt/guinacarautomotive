package guinacar.guinacarautomotive.service;

import guinacar.guinacarautomotive.exception.RecursoNaoEncontradoException;
import guinacar.guinacarautomotive.model.Favorito;
import guinacar.guinacarautomotive.model.Usuario;
import guinacar.guinacarautomotive.repository.FavoritoRepository;
import guinacar.guinacarautomotive.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FavoritoService {

    private final FavoritoRepository favoritoRepository;
    private final UsuarioRepository usuarioRepository;

    public FavoritoService(FavoritoRepository favoritoRepository, UsuarioRepository usuarioRepository) {
        this.favoritoRepository = favoritoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<String> listarSlugs(Long usuarioId) {
        return favoritoRepository.findByUsuarioIdOrderByCriadoEmDesc(usuarioId)
                .stream()
                .map(Favorito::getProdutoSlug)
                .toList();
    }

    @Transactional
    public List<String> adicionar(Long usuarioId, String produtoSlug) {
        if (!favoritoRepository.existsByUsuarioIdAndProdutoSlug(usuarioId, produtoSlug)) {
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));
            favoritoRepository.save(new Favorito(usuario, produtoSlug));
        }
        return listarSlugs(usuarioId);
    }

    @Transactional
    public List<String> remover(Long usuarioId, String produtoSlug) {
        favoritoRepository.deleteByUsuarioIdAndProdutoSlug(usuarioId, produtoSlug);
        return listarSlugs(usuarioId);
    }
}
