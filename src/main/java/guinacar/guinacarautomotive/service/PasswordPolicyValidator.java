package guinacar.guinacarautomotive.service;

import guinacar.guinacarautomotive.exception.RegraNegocioException;
import org.springframework.stereotype.Component;

/**
 * Regras de senha aplicadas no cadastro e na redefinição.
 * <p>
 * ATENÇÃO: hoje o Register.jsx no front-end só exige 6+ caracteres no
 * cliente. Esta política é mais rígida (8+ com maiúscula/minúscula/número),
 * então uma senha que passa na validação do front pode ser rejeitada aqui
 * com uma mensagem de erro específica. Vale atualizar a validação do
 * front pra refletir a mesma regra e evitar essa surpresa pro usuário.
 */
@Component
public class PasswordPolicyValidator {

    private static final int TAMANHO_MINIMO = 8;

    public void validar(String senha) {
        if (senha == null || senha.length() < TAMANHO_MINIMO) {
            throw new RegraNegocioException("A senha deve ter no mínimo " + TAMANHO_MINIMO + " caracteres");
        }

        boolean temMaiuscula = senha.chars().anyMatch(Character::isUpperCase);
        boolean temMinuscula = senha.chars().anyMatch(Character::isLowerCase);
        boolean temNumero = senha.chars().anyMatch(Character::isDigit);

        if (!temMaiuscula || !temMinuscula || !temNumero) {
            throw new RegraNegocioException(
                    "A senha deve conter ao menos uma letra maiúscula, uma minúscula e um número");
        }
    }
}
