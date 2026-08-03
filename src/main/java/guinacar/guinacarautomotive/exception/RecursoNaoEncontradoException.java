package guinacar.guinacarautomotive.exception;

/** Lançada quando um recurso buscado por id/slug não existe. Mapeada para HTTP 404. */
public class RecursoNaoEncontradoException extends RuntimeException {

    public RecursoNaoEncontradoException(String mensagem) {
        super(mensagem);
    }
}
