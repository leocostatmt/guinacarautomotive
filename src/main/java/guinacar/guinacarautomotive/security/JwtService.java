package guinacar.guinacarautomotive.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Geração e leitura de tokens JWT assinados com HMAC-SHA256.
 * O segredo (app.jwt.secret) precisa ter pelo menos 256 bits; o valor de
 * desenvolvimento em application.properties já atende isso, mas troque-o
 * em produção via variável de ambiente JWT_SECRET.
 */
@Component
public class JwtService {

    private final SecretKey chave;
    private final long expiracaoMs;

    public JwtService(@Value("${app.jwt.secret}") String segredo,
                       @Value("${app.jwt.expiration-ms}") long expiracaoMs) {
        this.chave = Keys.hmacShaKeyFor(segredo.getBytes(StandardCharsets.UTF_8));
        this.expiracaoMs = expiracaoMs;
    }

    public String gerarToken(Long usuarioId, String email, String role) {
        Date agora = new Date();
        Date expiracao = new Date(agora.getTime() + expiracaoMs);

        return Jwts.builder()
                .subject(email)
                .claim("userId", usuarioId)
                .claim("role", role)
                .issuedAt(agora)
                .expiration(expiracao)
                .signWith(chave)
                .compact();
    }

    public String extrairEmail(String token) {
        return extrairTodosClaims(token).getSubject();
    }

    public Long extrairUsuarioId(String token) {
        Object valor = extrairTodosClaims(token).get("userId");
        return valor instanceof Number numero ? numero.longValue() : null;
    }

    public boolean tokenValido(String token, String email) {
        try {
            Claims claims = extrairTodosClaims(token);
            boolean mesmoUsuario = email.equals(claims.getSubject());
            boolean naoExpirado = claims.getExpiration().after(new Date());
            return mesmoUsuario && naoExpirado;
        } catch (Exception e) {
            return false;
        }
    }

    private Claims extrairTodosClaims(String token) {
        return Jwts.parser()
                .verifyWith(chave)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
