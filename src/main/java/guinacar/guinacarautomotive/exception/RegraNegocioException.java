package guinacar.guinacarautomotive.exception;

/** Lançada quando uma requisição viola uma regra de negócio (ex.: slug duplicado). Mapeada para HTTP 400. */
public class RegraNegocioException extends RuntimeException {

    public RegraNegocioException(String mensagem) {
        super(mensagem);
    }
}
