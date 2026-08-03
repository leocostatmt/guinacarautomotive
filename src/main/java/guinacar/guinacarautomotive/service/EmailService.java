package guinacar.guinacarautomotive.service;

import guinacar.guinacarautomotive.model.Usuario;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String frontendUrl;

    public EmailService(JavaMailSender mailSender, @Value("${app.frontend-url}") String frontendUrl) {
        this.mailSender = mailSender;
        this.frontendUrl = frontendUrl;
    }

    /**
     * Envia o e-mail com o link de redefinição. Falha de envio só é logada
     * (não propagada), porque o AuthService sempre responde com sucesso
     * genérico nesse fluxo, para não revelar quais e-mails existem.
     */
    public void enviarEmailRecuperacaoSenha(Usuario usuario, String token) {
        String link = frontendUrl + "/redefinir-senha?token=" + token;

        SimpleMailMessage mensagem = new SimpleMailMessage();
        mensagem.setTo(usuario.getEmail());
        mensagem.setSubject("Recuperação de senha - Guinacar Automotive");
        mensagem.setText("""
                Olá, %s!

                Recebemos uma solicitação para redefinir sua senha na Guinacar Automotive.

                Clique no link abaixo para criar uma nova senha (válido por 30 minutos):
                %s

                Se você não solicitou isso, pode ignorar este e-mail.
                """.formatted(usuario.getNome(), link));

        try {
            mailSender.send(mensagem);
        } catch (Exception e) {
            log.error("Falha ao enviar e-mail de recuperação de senha para {}", usuario.getEmail(), e);
        }
    }
}
