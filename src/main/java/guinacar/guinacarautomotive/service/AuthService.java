package guinacar.guinacarautomotive.service;

import guinacar.guinacarautomotive.dto.auth.AuthResponse;
import guinacar.guinacarautomotive.dto.auth.CadastroRequest;
import guinacar.guinacarautomotive.dto.auth.LoginRequest;
import guinacar.guinacarautomotive.dto.auth.RecuperarSenhaRequest;
import guinacar.guinacarautomotive.dto.auth.RedefinirSenhaRequest;
import guinacar.guinacarautomotive.dto.auth.UsuarioResponse;
import guinacar.guinacarautomotive.exception.CredenciaisInvalidasException;
import guinacar.guinacarautomotive.exception.RecursoNaoEncontradoException;
import guinacar.guinacarautomotive.exception.RegraNegocioException;
import guinacar.guinacarautomotive.model.Role;
import guinacar.guinacarautomotive.model.Usuario;
import guinacar.guinacarautomotive.repository.UsuarioRepository;
import guinacar.guinacarautomotive.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private static final int TOKEN_RECUPERACAO_VALIDADE_MINUTOS = 30;

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordPolicyValidator passwordPolicyValidator;
    private final JwtService jwtService;
    private final EmailService emailService;

    public AuthService(UsuarioRepository usuarioRepository,
                        PasswordEncoder passwordEncoder,
                        PasswordPolicyValidator passwordPolicyValidator,
                        JwtService jwtService,
                        EmailService emailService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordPolicyValidator = passwordPolicyValidator;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    @Transactional
    public UsuarioResponse cadastrar(CadastroRequest request) {
        if (!request.senha().equals(request.confirmarSenha())) {
            throw new RegraNegocioException("As senhas não coincidem");
        }

        String cpfNormalizado = request.cpf().replaceAll("\\D", "");
        String telefoneNormalizado = request.telefone().replaceAll("\\D", "");

        if (usuarioRepository.existsByEmail(request.email())) {
            throw new RegraNegocioException("Este e-mail já está cadastrado");
        }
        if (usuarioRepository.existsByCpf(cpfNormalizado)) {
            throw new RegraNegocioException("Este CPF já está cadastrado");
        }
        passwordPolicyValidator.validar(request.senha());

        Usuario usuario = new Usuario();
        usuario.setNome(request.nome());
        usuario.setEmail(request.email());
        usuario.setSenha(passwordEncoder.encode(request.senha()));
        usuario.setCpf(cpfNormalizado);
        usuario.setTelefone(telefoneNormalizado);
        usuario.setRole(Role.USER);
        usuario.setAtivo(true);

        return toUsuarioResponse(usuarioRepository.save(usuario));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.email())
                .orElseThrow(CredenciaisInvalidasException::new);

        if (!usuario.isAtivo() || !passwordEncoder.matches(request.senha(), usuario.getSenha())) {
            throw new CredenciaisInvalidasException();
        }

        String token = jwtService.gerarToken(usuario.getId(), usuario.getEmail(), usuario.getRole().name());
        return new AuthResponse(token, "Bearer", toUsuarioResponse(usuario));
    }

    @Transactional
    public void recuperarSenha(RecuperarSenhaRequest request) {
        // Sempre "sucede" silenciosamente mesmo se o e-mail não existir,
        // pra não revelar quais e-mails estão cadastrados. O front-end
        // (ForgotPassword.jsx) já assume essa resposta genérica.
        usuarioRepository.findByEmail(request.email()).ifPresent(usuario -> {
            String token = UUID.randomUUID().toString();
            usuario.setTokenRecuperacaoSenha(token);
            usuario.setTokenRecuperacaoExpiracao(LocalDateTime.now().plusMinutes(TOKEN_RECUPERACAO_VALIDADE_MINUTOS));
            usuarioRepository.save(usuario);
            emailService.enviarEmailRecuperacaoSenha(usuario, token);
        });
    }

    @Transactional
    public void redefinirSenha(RedefinirSenhaRequest request) {
        Usuario usuario = usuarioRepository.findByTokenRecuperacaoSenha(request.token())
                .orElseThrow(() -> new RegraNegocioException("Token de recuperação inválido"));

        if (usuario.getTokenRecuperacaoExpiracao() == null
                || usuario.getTokenRecuperacaoExpiracao().isBefore(LocalDateTime.now())) {
            throw new RegraNegocioException("Token de recuperação expirado. Solicite um novo.");
        }

        passwordPolicyValidator.validar(request.novaSenha());

        usuario.setSenha(passwordEncoder.encode(request.novaSenha()));
        usuario.setTokenRecuperacaoSenha(null);
        usuario.setTokenRecuperacaoExpiracao(null);
        usuarioRepository.save(usuario);
    }

    @Transactional(readOnly = true)
    public UsuarioResponse buscarPorEmail(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));
        return toUsuarioResponse(usuario);
    }

    private UsuarioResponse toUsuarioResponse(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(), usuario.getNome(), usuario.getEmail(),
                usuario.getCpf(), usuario.getTelefone(), usuario.getRole().name());
    }
}
