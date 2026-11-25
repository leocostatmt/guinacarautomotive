package guinacar.guinacarautomotive.service;

import guinacar.guinacarautomotive.dto.auth.UsuarioResponse;
import guinacar.guinacarautomotive.dto.conta.AlterarSenhaRequest;
import guinacar.guinacarautomotive.dto.conta.AtualizarPerfilRequest;
import guinacar.guinacarautomotive.exception.RecursoNaoEncontradoException;
import guinacar.guinacarautomotive.exception.RegraNegocioException;
import guinacar.guinacarautomotive.model.Usuario;
import guinacar.guinacarautomotive.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ContaService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordPolicyValidator passwordPolicyValidator;

    public ContaService(UsuarioRepository usuarioRepository,
                        PasswordEncoder passwordEncoder,
                        PasswordPolicyValidator passwordPolicyValidator) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordPolicyValidator = passwordPolicyValidator;
    }

    @Transactional
    public UsuarioResponse atualizarPerfil(Long usuarioId, AtualizarPerfilRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));

        String nomeLimpo = request.nome().trim();
        if (nomeLimpo.split("\\s+").length < 2) {
            throw new RegraNegocioException("Informe seu nome completo");
        }

        String telefoneNormalizado = request.telefone().replaceAll("\\D", "");
        if (telefoneNormalizado.length() < 10 || telefoneNormalizado.length() > 11) {
            throw new RegraNegocioException("Informe um telefone válido com DDD");
        }

        usuario.setNome(nomeLimpo);
        usuario.setTelefone(telefoneNormalizado);
        Usuario salvo = usuarioRepository.save(usuario);

        return new UsuarioResponse(
                salvo.getId(),
                salvo.getNome(),
                salvo.getEmail(),
                salvo.getCpf(),
                salvo.getTelefone(),
                salvo.getRole().name()
        );
    }

    @Transactional
    public void alterarSenha(Long usuarioId, AlterarSenhaRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));

        if (!passwordEncoder.matches(request.senhaAtual(), usuario.getSenha())) {
            throw new RegraNegocioException("A senha atual está incorreta");
        }

        if (!request.novaSenha().equals(request.confirmarNovaSenha())) {
            throw new RegraNegocioException("A nova senha e a confirmação não coincidem");
        }

        if (passwordEncoder.matches(request.novaSenha(), usuario.getSenha())) {
            throw new RegraNegocioException("A nova senha deve ser diferente da senha atual");
        }

        passwordPolicyValidator.validar(request.novaSenha());

        usuario.setSenha(passwordEncoder.encode(request.novaSenha()));
        usuarioRepository.save(usuario);
    }
}
