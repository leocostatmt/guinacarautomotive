package guinacar.guinacarautomotive.config;

import guinacar.guinacarautomotive.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.io.IOException;
import java.time.Instant;
import java.util.List;

/**
 * Configuração de segurança com JWT.
 * <p>
 * Rotas GET de catálogo (produtos/categorias/marcas) e /api/auth/** são
 * públicas; escrita em catálogo exige ROLE_ADMIN (reforçado também via
 * @PreAuthorize nos controllers, ver ProdutoController); qualquer outra
 * rota exige apenas estar autenticado.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/produtos/**", "/api/categorias/**", "/api/marcas/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/produtos/**", "/api/categorias/**", "/api/marcas/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/produtos/**", "/api/categorias/**", "/api/marcas/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/produtos/**", "/api/categorias/**", "/api/marcas/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(this::responderNaoAutenticado)
                        .accessDeniedHandler((request, response, deniedException) ->
                                escreverErro(response, HttpServletResponse.SC_FORBIDDEN, "Acesso negado", request.getRequestURI()))
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    private void responderNaoAutenticado(HttpServletRequest request,
                                          HttpServletResponse response,
                                          AuthenticationException authException) throws IOException {
        escreverErro(response, HttpServletResponse.SC_UNAUTHORIZED, "Autenticação necessária", request.getRequestURI());
    }

    private void escreverErro(HttpServletResponse response, int status, String mensagem, String path) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        String corpo = String.format(
                "{\"timestamp\":\"%s\",\"status\":%d,\"message\":\"%s\",\"path\":\"%s\"}",
                Instant.now().toString(),
                status,
                escapeJson(mensagem),
                escapeJson(path)
        );
        response.getWriter().write(corpo);
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(allowedOrigins.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
