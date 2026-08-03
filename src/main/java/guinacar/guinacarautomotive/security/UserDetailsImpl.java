package guinacar.guinacarautomotive.security;

import guinacar.guinacarautomotive.model.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;

/**
 * Adapta Usuario para o contrato UserDetails do Spring Security.
 * O papel vira "ROLE_USER"/"ROLE_ADMIN" porque hasRole("ADMIN") no
 * SecurityConfig espera esse prefixo por convenção.
 */
public class UserDetailsImpl implements UserDetails {

    private final Long id;
    private final String email;
    private final String senha;
    private final boolean ativo;
    private final List<GrantedAuthority> authorities;

    public UserDetailsImpl(Usuario usuario) {
        this.id = usuario.getId();
        this.email = usuario.getEmail();
        this.senha = usuario.getSenha();
        this.ativo = usuario.isAtivo();
        this.authorities = List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getRole().name()));
    }

    public Long getId() {
        return id;
    }

    @Override
    public List<GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return senha;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return ativo;
    }
}
