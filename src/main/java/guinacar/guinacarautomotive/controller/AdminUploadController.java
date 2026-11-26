package guinacar.guinacarautomotive.controller;

import guinacar.guinacarautomotive.exception.RegraNegocioException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/uploads")
@PreAuthorize("hasAnyRole('ADMIN', 'FUNCIONARIO')")
public class AdminUploadController {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"
    );

    private static final Map<String, String> EXT_BY_MIME = Map.of(
            "image/jpeg", ".jpg",
            "image/jpg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp",
            "image/gif", ".gif"
    );

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @PostMapping("/produtos")
    public ResponseEntity<Map<String, Object>> uploadFotosProduto(
            @RequestParam("files") MultipartFile[] files,
            HttpServletRequest request
    ) {
        if (files == null || files.length == 0) {
            throw new RegraNegocioException("Selecione ao menos uma imagem para enviar");
        }

        Path pastaDestino = Paths.get(uploadDir, "produtos").toAbsolutePath().normalize();
        try {
            Files.createDirectories(pastaDestino);
        } catch (IOException e) {
            throw new RegraNegocioException("Não foi possível preparar o diretório de uploads");
        }

        String baseUrl = request.getScheme() + "://" + request.getServerName()
                + ((request.getServerPort() == 80 || request.getServerPort() == 443)
                ? "" : ":" + request.getServerPort());

        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) continue;

            String contentType = file.getContentType() != null ? file.getContentType().toLowerCase() : "";
            if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
                throw new RegraNegocioException("Formato de imagem não suportado. Use JPG, PNG, WEBP ou GIF.");
            }
            if (file.getSize() > 10L * 1024 * 1024) {
                throw new RegraNegocioException("Cada imagem deve ter no máximo 10 MB.");
            }

            String ext = EXT_BY_MIME.getOrDefault(contentType, ".jpg");
            String nomeArquivo = UUID.randomUUID() + ext;
            Path destino = pastaDestino.resolve(nomeArquivo).normalize();

            try {
                Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException e) {
                throw new RegraNegocioException("Falha ao salvar a imagem enviada");
            }

            urls.add(baseUrl + "/uploads/produtos/" + nomeArquivo);
        }

        if (urls.isEmpty()) {
            throw new RegraNegocioException("Nenhuma imagem válida foi enviada");
        }

        return ResponseEntity.ok(Map.of(
                "urls", urls,
                "url", urls.get(0)
        ));
    }
}
