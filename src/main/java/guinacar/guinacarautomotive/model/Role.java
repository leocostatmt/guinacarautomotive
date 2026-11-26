package guinacar.guinacarautomotive.model;

/**
 * Papéis de acesso do sistema (RBAC):
 * - USER: cliente final da loja
 * - FUNCIONARIO: colaborador com acesso operacional (pedidos, envios e produtos)
 * - ADMIN: dono da loja com controle total (dashboard, relatórios, produtos, pedidos, clientes e funcionários)
 */
public enum Role {
    USER,
    FUNCIONARIO,
    ADMIN
}
