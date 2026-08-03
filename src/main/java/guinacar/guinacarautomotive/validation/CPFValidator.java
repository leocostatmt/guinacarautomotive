package guinacar.guinacarautomotive.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Valida CPF pelo algoritmo oficial de dígitos verificadores (módulo 11),
 * não só pela quantidade de dígitos. Aceita o valor com ou sem pontuação
 * (000.000.000-00 ou 00000000000) — os separadores são descartados antes
 * de validar.
 */
public class CPFValidator implements ConstraintValidator<ValidCPF, String> {

    @Override
    public boolean isValid(String valor, ConstraintValidatorContext context) {
        if (valor == null || valor.isBlank()) {
            return false;
        }

        String cpf = valor.replaceAll("\\D", "");

        if (cpf.length() != 11) {
            return false;
        }
        // Sequências como 00000000000 ou 11111111111 passam no cálculo do
        // dígito verificador mas são convencionalmente inválidas.
        if (cpf.chars().distinct().count() == 1) {
            return false;
        }

        int[] digitos = cpf.chars().map(c -> c - '0').toArray();

        int primeiroDigito = calcularDigitoVerificador(digitos, 9, 10);
        if (primeiroDigito != digitos[9]) {
            return false;
        }

        int segundoDigito = calcularDigitoVerificador(digitos, 10, 11);
        return segundoDigito == digitos[10];
    }

    private int calcularDigitoVerificador(int[] digitos, int quantidade, int pesoInicial) {
        int soma = 0;
        for (int i = 0; i < quantidade; i++) {
            soma += digitos[i] * (pesoInicial - i);
        }
        int resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }
}
