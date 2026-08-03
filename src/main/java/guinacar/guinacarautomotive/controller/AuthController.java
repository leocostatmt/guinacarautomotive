package guinacar.guinacarautomotive.controller;

import guinacar.guinacarautomotive.dto.auth.AuthResponse;
import guinacar.guinacarautomotive.dto.auth.CadastroRequest;
import guinacar.guinacarautomotive.dto.auth.LoginRequest;
import guinacar.guinacarautomotive.dto.auth.RecuperarSenhaRequest;
import guinacar.guinacarautomotive.dto.auth.RedefinirSenhaRequest;
import guinacar.guinacarautomotive.dto.auth.UsuarioResponse;
import guinacar.guinacarautomotive.security.UserDetailsImpl;
import guinacar.guinacarautomotive.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/cadastro")
    public ResponseEntity<UsuarioResponse> cadastrar(@Valid @RequestBody CadastroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.cadastrar(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/recuperar-senha")
    public ResponseEntity<Void> recuperarSenha(@Valid @RequestBody RecuperarSenhaRequest request) {
        authService.recuperarSenha(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/redefinir-senha")
    public ResponseEntity<Void> redefinirSenha(@Valid @RequestBody RedefinirSenhaRequest request) {
        authService.redefinirSenha(request);
        return ResponseEntity.ok().build();
    }

    /** Retorna os dados do usuário do token JWT enviado no header Authorization. */
    @GetMapping("/me")
    public ResponseEntity<UsuarioResponse> me(@AuthenticationPrincipal UserDetailsImpl usuarioAutenticado) {
        return ResponseEntity.ok(authService.buscarPorEmail(usuarioAutenticado.getUsername()));
    }
}
