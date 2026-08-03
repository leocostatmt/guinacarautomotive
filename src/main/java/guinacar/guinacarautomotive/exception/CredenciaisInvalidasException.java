package guinacar.guinacarautomotive.exception;

/** Lançada quando e-mail/senha não conferem no login. Mapeada para HTTP 401. */
public class CredenciaisInvalidasException extends RuntimeException {

    public CredenciaisInvalidasException() {
        super("E-mail ou senha inválidos");
    }
}
