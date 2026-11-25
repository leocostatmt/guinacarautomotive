package guinacar.guinacarautomotive.service;

import guinacar.guinacarautomotive.dto.conta.EnderecoRequest;
import guinacar.guinacarautomotive.dto.conta.EnderecoResponse;
import guinacar.guinacarautomotive.dto.pedido.EntregaRequest;
import guinacar.guinacarautomotive.exception.RecursoNaoEncontradoException;
import guinacar.guinacarautomotive.exception.RegraNegocioException;
import guinacar.guinacarautomotive.model.Endereco;
import guinacar.guinacarautomotive.model.Usuario;
import guinacar.guinacarautomotive.repository.EnderecoRepository;
import guinacar.guinacarautomotive.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EnderecoService {

    private final EnderecoRepository enderecoRepository;
    private final UsuarioRepository usuarioRepository;

    public EnderecoService(EnderecoRepository enderecoRepository, UsuarioRepository usuarioRepository) {
        this.enderecoRepository = enderecoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<EnderecoResponse> listarPorUsuario(Long usuarioId) {
        return enderecoRepository.findByUsuarioIdOrderByPrincipalDescCriadoEmDesc(usuarioId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public EnderecoResponse criar(Long usuarioId, EnderecoRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));

        String cepLimpo = normalizarCep(request.cep());
        boolean primeiroEndereco = enderecoRepository.countByUsuarioId(usuarioId) == 0;
        boolean definirComoPrincipal = primeiroEndereco || request.principal();

        if (definirComoPrincipal) {
            desmarcarPrincipais(usuarioId);
        }

        Endereco endereco = new Endereco();
        endereco.setUsuario(usuario);
        preencherCampos(endereco, request, cepLimpo);
        endereco.setPrincipal(definirComoPrincipal);

        return toResponse(enderecoRepository.save(endereco));
    }

    @Transactional
    public EnderecoResponse atualizar(Long usuarioId, Long enderecoId, EnderecoRequest request) {
        Endereco endereco = enderecoRepository.findByIdAndUsuarioId(enderecoId, usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Endereço não encontrado"));

        String cepLimpo = normalizarCep(request.cep());
        if (request.principal() && !endereco.isPrincipal()) {
            desmarcarPrincipais(usuarioId);
            endereco.setPrincipal(true);
        }

        preencherCampos(endereco, request, cepLimpo);
        return toResponse(enderecoRepository.save(endereco));
    }

    @Transactional
    public List<EnderecoResponse> definirPrincipal(Long usuarioId, Long enderecoId) {
        Endereco alvo = enderecoRepository.findByIdAndUsuarioId(enderecoId, usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Endereço não encontrado"));

        desmarcarPrincipais(usuarioId);
        alvo.setPrincipal(true);
        enderecoRepository.save(alvo);

        return listarPorUsuario(usuarioId);
    }

    @Transactional
    public void remover(Long usuarioId, Long enderecoId) {
        Endereco endereco = enderecoRepository.findByIdAndUsuarioId(enderecoId, usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Endereço não encontrado"));

        boolean eraPrincipal = endereco.isPrincipal();
        enderecoRepository.delete(endereco);

        if (eraPrincipal) {
            List<Endereco> restantes = enderecoRepository.findByUsuarioIdOrderByPrincipalDescCriadoEmDesc(usuarioId);
            if (!restantes.isEmpty()) {
                restantes.get(0).setPrincipal(true);
                enderecoRepository.save(restantes.get(0));
            }
        }
    }

    /**
     * Chamado automaticamente ao finalizar um pedido: se o usuário ainda não
     * possui esse endereço cadastrado (ex.: primeira compra ou endereço novo),
     * salva-o na conta para aparecer em Minha Conta e nos próximos checkouts.
     */
    @Transactional
    public void salvarAutomaticoSeNovo(Usuario usuario, EntregaRequest entrega) {
        if (entrega == null || entrega.getCep() == null) return;
        String cepLimpo = entrega.getCep().replaceAll("\\D", "");
        if (cepLimpo.length() != 8) return;

        List<Endereco> existentes = enderecoRepository.findByUsuarioIdOrderByPrincipalDescCriadoEmDesc(usuario.getId());
        String logradouroNorm = safeTrim(entrega.getLogradouro()).toLowerCase();
        String numeroNorm = safeTrim(entrega.getNumero()).toLowerCase();

        boolean jaExiste = existentes.stream().anyMatch(e ->
                e.getCep().equals(cepLimpo)
                        && safeTrim(e.getLogradouro()).toLowerCase().equals(logradouroNorm)
                        && safeTrim(e.getNumero()).toLowerCase().equals(numeroNorm)
        );
        if (jaExiste) return;

        Endereco novo = new Endereco();
        novo.setUsuario(usuario);
        novo.setApelido(existentes.isEmpty() ? "Principal" : "Entrega #" + (existentes.size() + 1));
        novo.setDestinatario(safeTrim(entrega.getDestinatario()).isEmpty()
                ? usuario.getNome()
                : safeTrim(entrega.getDestinatario()));
        novo.setCep(cepLimpo);
        novo.setLogradouro(safeTrim(entrega.getLogradouro()));
        novo.setNumero(safeTrim(entrega.getNumero()));
        novo.setComplemento(entrega.getComplemento() != null ? entrega.getComplemento().trim() : null);
        novo.setBairro(safeTrim(entrega.getBairro()));
        novo.setCidade(safeTrim(entrega.getCidade()));
        novo.setEstado(safeTrim(entrega.getEstado()).toUpperCase());
        novo.setPrincipal(existentes.isEmpty());

        enderecoRepository.save(novo);
    }

    private void desmarcarPrincipais(Long usuarioId) {
        List<Endereco> atuais = enderecoRepository.findByUsuarioIdOrderByPrincipalDescCriadoEmDesc(usuarioId);
        for (Endereco e : atuais) {
            if (e.isPrincipal()) {
                e.setPrincipal(false);
                enderecoRepository.save(e);
            }
        }
    }

    private void preencherCampos(Endereco endereco, EnderecoRequest request, String cepLimpo) {
        String apelido = request.apelido() != null && !request.apelido().trim().isEmpty()
                ? request.apelido().trim()
                : "Principal";
        endereco.setApelido(apelido);
        endereco.setDestinatario(request.destinatario().trim());
        endereco.setCep(cepLimpo);
        endereco.setLogradouro(request.logradouro().trim());
        endereco.setNumero(request.numero().trim());
        endereco.setComplemento(request.complemento() != null ? request.complemento().trim() : null);
        endereco.setBairro(request.bairro().trim());
        endereco.setCidade(request.cidade().trim());
        endereco.setEstado(request.estado().trim().toUpperCase());
    }

    private String normalizarCep(String cep) {
        String digits = cep != null ? cep.replaceAll("\\D", "") : "";
        if (digits.length() != 8) {
            throw new RegraNegocioException("Informe um CEP válido com 8 dígitos");
        }
        return digits;
    }

    private String safeTrim(String value) {
        return value == null ? "" : value.trim();
    }

    private EnderecoResponse toResponse(Endereco e) {
        return new EnderecoResponse(
                e.getId(),
                e.getApelido(),
                e.getDestinatario(),
                e.getCep(),
                e.getLogradouro(),
                e.getNumero(),
                e.getComplemento(),
                e.getBairro(),
                e.getCidade(),
                e.getEstado(),
                e.isPrincipal()
        );
    }
}
