package guinacar.guinacarautomotive.service;

import guinacar.guinacarautomotive.dto.admin.AdminAtualizarUsuarioRequest;
import guinacar.guinacarautomotive.dto.admin.AdminCriarUsuarioRequest;
import guinacar.guinacarautomotive.dto.admin.AdminUsuarioResponse;
import guinacar.guinacarautomotive.dto.common.PageResponse;
import guinacar.guinacarautomotive.exception.RecursoNaoEncontradoException;
import guinacar.guinacarautomotive.exception.RegraNegocioException;
import guinacar.guinacarautomotive.model.Pedido;
import guinacar.guinacarautomotive.model.Role;
import guinacar.guinacarautomotive.model.Usuario;
import guinacar.guinacarautomotive.repository.EnderecoRepository;
import guinacar.guinacarautomotive.repository.FavoritoRepository;
import guinacar.guinacarautomotive.repository.ItemCarrinhoRepository;
import guinacar.guinacarautomotive.repository.PedidoRepository;
import guinacar.guinacarautomotive.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminUsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final EnderecoRepository enderecoRepository;
    private final FavoritoRepository favoritoRepository;
    private final ItemCarrinhoRepository itemCarrinhoRepository;
    private final PedidoRepository pedidoRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordPolicyValidator passwordPolicyValidator;

    public AdminUsuarioService(UsuarioRepository usuarioRepository,
            EnderecoRepository enderecoRepository,
            FavoritoRepository favoritoRepository,
            ItemCarrinhoRepository itemCarrinhoRepository,
            PedidoRepository pedidoRepository,
            PasswordEncoder passwordEncoder,
            PasswordPolicyValidator passwordPolicyValidator) {
        this.usuarioRepository = usuarioRepository;
        this.enderecoRepository = enderecoRepository;
        this.favoritoRepository = favoritoRepository;
        this.itemCarrinhoRepository = itemCarrinhoRepository;
        this.pedidoRepository = pedidoRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordPolicyValidator = passwordPolicyValidator;
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminUsuarioResponse> listar(String tipo, String busca, Boolean ativo, int page, int size) {
        List<Role> roles = switch (tipo == null ? "TODOS" : tipo.trim().toUpperCase()) {
            case "CLIENTES", "USER" -> List.of(Role.USER);
            case "FUNCIONARIOS", "EQUIPE" -> List.of(Role.FUNCIONARIO, Role.ADMIN);
            default -> List.of(Role.USER, Role.FUNCIONARIO, Role.ADMIN);
        };

        int paginaSegura = Math.max(page, 0);
        int tamanhoSeguro = Math.min(Math.max(size, 1), 100);
        Pageable pageable = PageRequest.of(paginaSegura, tamanhoSeguro, Sort.by("criadoEm").descending());

        String termo = busca != null ? busca.trim() : null;
        Page<Usuario> resultado = usuarioRepository.buscarAdmin(roles, ativo, termo, pageable);

        return new PageResponse<>(
                resultado.getContent().stream().map(this::toResponse).toList(),
                resultado.getNumber(),
                resultado.getSize(),
                resultado.getTotalElements(),
                resultado.getTotalPages());
    }

    @Transactional
    public AdminUsuarioResponse criar(AdminCriarUsuarioRequest request) {
        String emailLimpo = request.email().trim().toLowerCase();
        String cpfLimpo = request.cpf().replaceAll("\\D", "");
        String telLimpo = request.telefone().replaceAll("\\D", "");

        if (cpfLimpo.length() != 11) {
            throw new RegraNegocioException("CPF deve conter 11 dígitos");
        }
        if (telLimpo.length() < 10 || telLimpo.length() > 11) {
            throw new RegraNegocioException("Informe um telefone válido com DDD");
        }
        if (usuarioRepository.existsByEmailIgnoreCase(emailLimpo)) {
            throw new RegraNegocioException("Este e-mail já está cadastrado");
        }
        if (usuarioRepository.existsByCpf(cpfLimpo)) {
            throw new RegraNegocioException("Este CPF já está cadastrado");
        }

        passwordPolicyValidator.validar(request.senha());
        Role role = parseRole(request.role());

        Usuario usuario = new Usuario();
        usuario.setNome(request.nome().trim());
        usuario.setEmail(emailLimpo);
        usuario.setCpf(cpfLimpo);
        usuario.setTelefone(telLimpo);
        usuario.setSenha(passwordEncoder.encode(request.senha()));
        usuario.setRole(role);
        usuario.setCargo(trimOrNull(request.cargo()));
        usuario.setDepartamento(trimOrNull(request.departamento()));
        usuario.setAtivo(request.ativo() == null || request.ativo());

        return toResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public AdminUsuarioResponse atualizar(Long adminId, Long usuarioId, AdminAtualizarUsuarioRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));

        String emailLimpo = request.email().trim().toLowerCase();
        String telLimpo = request.telefone().replaceAll("\\D", "");

        if (telLimpo.length() < 10 || telLimpo.length() > 11) {
            throw new RegraNegocioException("Informe um telefone válido com DDD");
        }
        if (!usuario.getEmail().equalsIgnoreCase(emailLimpo) && usuarioRepository.existsByEmailIgnoreCase(emailLimpo)) {
            throw new RegraNegocioException("Este e-mail já está em uso por outro usuário");
        }

        Role novoRole = parseRole(request.role());
        boolean novoAtivo = request.ativo() == null ? usuario.isAtivo() : request.ativo();

        if (usuario.getRole() == Role.ADMIN && !novoAtivo) {
            throw new RegraNegocioException("Não é permitido bloquear ou desativar um usuário Administrador");
        }

        if (usuario.getId().equals(adminId) && novoRole != Role.ADMIN) {
            throw new RegraNegocioException("Você não pode remover sua própria permissão de ADMIN");
        }

        usuario.setNome(request.nome().trim());
        usuario.setEmail(emailLimpo);
        usuario.setTelefone(telLimpo);
        usuario.setRole(novoRole);
        usuario.setCargo(trimOrNull(request.cargo()));
        usuario.setDepartamento(trimOrNull(request.departamento()));
        usuario.setAtivo(novoAtivo);

        if (request.novaSenha() != null && !request.novaSenha().isBlank()) {
            passwordPolicyValidator.validar(request.novaSenha());
            usuario.setSenha(passwordEncoder.encode(request.novaSenha()));
        }

        return toResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public AdminUsuarioResponse alterarStatus(Long adminId, Long usuarioId, boolean ativo) {
        if (adminId.equals(usuarioId) && !ativo) {
            throw new RegraNegocioException("Você não pode desativar sua própria conta");
        }
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));
        if (usuario.getRole() == Role.ADMIN && !ativo) {
            throw new RegraNegocioException("Não é permitido bloquear ou desativar um usuário Administrador");
        }
        usuario.setAtivo(ativo);
        return toResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public void excluir(Long adminId, Long usuarioId) {
        if (adminId.equals(usuarioId)) {
            throw new RegraNegocioException("Você não pode excluir sua própria conta de administrador");
        }

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));

        if (usuario.getRole() == Role.ADMIN) {
            throw new RegraNegocioException("Não é permitido excluir um usuário Administrador");
        }

        // Remove vínculos dependentes antes de excluir o usuário para manter
        // integridade referencial
        itemCarrinhoRepository.deleteByUsuarioId(usuarioId);
        favoritoRepository.deleteByUsuarioId(usuarioId);
        enderecoRepository.deleteByUsuarioId(usuarioId);

        List<Pedido> pedidos = pedidoRepository.findByUsuarioIdOrderByCriadoEmDesc(usuarioId);
        if (!pedidos.isEmpty()) {
            pedidoRepository.deleteAll(pedidos);
        }

        usuarioRepository.delete(usuario);
    }

    private Role parseRole(String raw) {
        try {
            return Role.valueOf(raw.trim().toUpperCase());
        } catch (Exception e) {
            throw new RegraNegocioException("Perfil de acesso inválido. Use USER, FUNCIONARIO ou ADMIN.");
        }
    }

    private String trimOrNull(String value) {
        if (value == null || value.trim().isEmpty())
            return null;
        return value.trim();
    }

    public AdminUsuarioResponse toResponse(Usuario u) {
        return new AdminUsuarioResponse(
                u.getId(),
                u.getNome(),
                u.getEmail(),
                u.getCpf(),
                u.getTelefone(),
                u.getRole().name(),
                u.getCargo(),
                u.getDepartamento(),
                u.isAtivo(),
                u.getCriadoEm());
    }
}
