package com.orbitamos.api.controller;

import com.orbitamos.api.entity.*;
import com.orbitamos.api.repository.*;
import com.orbitamos.api.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ConversationRepository conversationRepository;
    @Autowired
    private ConversationParticipantRepository participantRepository;
    @Autowired
    private ChatMessageRepository messageRepository;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Value("${app.upload-dir:./uploads}")
    private String uploadDir;

    @Value("${app.api-base-url:http://localhost:8080}")
    private String apiBaseUrl;

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_DATE_TIME;
    private static final List<String> ALLOWED_IMAGE_TYPES = List.of(
        "image/jpeg", "image/png", "image/gif", "image/webp"
    );

    private User userFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        return userRepository.findByEmail(email).orElse(null);
    }

    private Map<String, Object> userToMap(User u) {
        if (u == null) return Map.of();
        Map<String, Object> m = new HashMap<>();
        m.put("id", u.getId());
        m.put("name", u.getName());
        m.put("email", u.getEmail());
        m.put("avatarUrl", u.getAvatarUrl() != null ? u.getAvatarUrl() : "");
        m.put("role", u.getRole().name());
        m.put("lastSeenAt", u.getUpdatedAt() != null ? u.getUpdatedAt().format(ISO) : null);
        return m;
    }

    /** Lista conversas do usuário (com preview da última mensagem e participantes). */
    @GetMapping("/conversations")
    public ResponseEntity<?> listConversations(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        User me = userFromToken(authHeader);
        if (me == null) return ResponseEntity.status(401).body(Map.of("success", false, "message", "Não autorizado"));

        List<Conversation> convs = conversationRepository.findByParticipantUserIdOrderByCreatedAtDesc(me.getId());
        List<Map<String, Object>> items = new ArrayList<>();
        for (Conversation c : convs) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", c.getId());
            item.put("type", c.getType().name());
            item.put("name", c.getName());
            item.put("avatarUrl", c.getAvatarUrl());
            item.put("createdByUserId", c.getCreatedByUserId());
            item.put("createdAt", c.getCreatedAt().format(ISO));

            List<ConversationParticipant> participants = participantRepository.findByConversationIdOrderByJoinedAtAsc(c.getId());
            List<Map<String, Object>> participantMaps = participants.stream()
                .map(p -> userToMap(p.getUser()))
                .collect(Collectors.toList());
            item.put("participants", participantMaps);

            // Título para exibição: grupo = nome; direto = nome do outro
            if (c.getType() == ConversationType.GROUP && c.getName() != null && !c.getName().isEmpty()) {
                item.put("displayName", c.getName());
            } else {
                String otherName = participants.stream()
                    .filter(p -> !p.getUser().getId().equals(me.getId()))
                    .map(p -> p.getUser().getName())
                    .findFirst()
                    .orElse("Conversa");
                item.put("displayName", otherName);
            }

            ChatMessage last = messageRepository.findTop1ByConversationIdOrderByCreatedAtDesc(c.getId());
            if (last != null) {
                item.put("lastMessage", Map.of(
                    "content", last.getContent().length() > 60 ? last.getContent().substring(0, 60) + "…" : last.getContent(),
                    "senderId", last.getSender().getId(),
                    "createdAt", last.getCreatedAt().format(ISO)
                ));
            } else {
                item.put("lastMessage", null);
            }
            items.add(item);
        }
        return ResponseEntity.ok(Map.of("success", true, "conversations", items));
    }

    /** Obtém uma conversa (com participantes). */
    @GetMapping("/conversations/{id}")
    public ResponseEntity<?> getConversation(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id) {
        User me = userFromToken(authHeader);
        if (me == null) return ResponseEntity.status(401).body(Map.of("success", false, "message", "Não autorizado"));

        Optional<Conversation> opt = conversationRepository.findByIdAndParticipantUserId(id, me.getId());
        if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("success", false, "message", "Conversa não encontrada"));

        Conversation c = opt.get();
        List<ConversationParticipant> participants = participantRepository.findByConversationIdOrderByJoinedAtAsc(c.getId());
        Map<String, Object> item = conversationToMap(c, me);
        return ResponseEntity.ok(Map.of("success", true, "conversation", item));
    }

    /** Lista mensagens da conversa. */
    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<?> getMessages(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id) {
        User me = userFromToken(authHeader);
        if (me == null) return ResponseEntity.status(401).body(Map.of("success", false, "message", "Não autorizado"));

        if (conversationRepository.findByIdAndParticipantUserId(id, me.getId()).isEmpty())
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "Conversa não encontrada"));

        List<ChatMessage> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(id);
        List<Map<String, Object>> payload = messages.stream().map(m -> Map.<String, Object>of(
            "id", m.getId(),
            "content", m.getContent(),
            "senderId", m.getSender().getId(),
            "senderName", m.getSender().getName(),
            "senderAvatarUrl", m.getSender().getAvatarUrl() != null ? m.getSender().getAvatarUrl() : "",
            "createdAt", m.getCreatedAt().format(ISO)
        )).collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("success", true, "messages", payload));
    }

    /** Envia mensagem. */
    @PostMapping("/conversations/{id}/messages")
    public ResponseEntity<?> sendMessage(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        User me = userFromToken(authHeader);
        if (me == null) return ResponseEntity.status(401).body(Map.of("success", false, "message", "Não autorizado"));

        Optional<Conversation> opt = conversationRepository.findByIdAndParticipantUserId(id, me.getId());
        if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("success", false, "message", "Conversa não encontrada"));

        String content = body != null ? body.get("content") : null;
        if (content == null || content.trim().isEmpty())
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Conteúdo obrigatório"));
        content = content.trim();
        if (content.length() > 4000) content = content.substring(0, 4000);

        ChatMessage msg = new ChatMessage();
        msg.setConversation(opt.get());
        msg.setSender(me);
        msg.setContent(content);
        msg.setCreatedAt(LocalDateTime.now());
        msg = messageRepository.save(msg);

        Long convId = opt.get().getId();
        Map<String, Object> messageMap = new HashMap<>();
        messageMap.put("conversationId", convId);
        messageMap.put("id", msg.getId());
        messageMap.put("content", msg.getContent());
        messageMap.put("senderId", msg.getSender().getId());
        messageMap.put("senderName", msg.getSender().getName());
        messageMap.put("senderAvatarUrl", msg.getSender().getAvatarUrl() != null ? msg.getSender().getAvatarUrl() : "");
        messageMap.put("createdAt", msg.getCreatedAt().format(ISO));

        messagingTemplate.convertAndSend("/topic/chat/" + convId, messageMap);
        return ResponseEntity.ok(Map.of("success", true, "message", messageMap));
    }

    /** Cria conversa direta ou grupo. Body: type=DIRECT&otherUserId=2  ou  type=GROUP&name=Nome&userIds=1,2,3 */
    @PostMapping("/conversations")
    public ResponseEntity<?> createConversation(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> body) {
        User me = userFromToken(authHeader);
        if (me == null) return ResponseEntity.status(401).body(Map.of("success", false, "message", "Não autorizado"));

        String typeStr = body != null && body.get("type") != null ? body.get("type").toString() : null;
        if (typeStr == null) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "type obrigatório (DIRECT ou GROUP)"));

        if ("DIRECT".equalsIgnoreCase(typeStr)) {
            Object other = body.get("otherUserId");
            Long otherUserId = other instanceof Number ? ((Number) other).longValue() : null;
            if (otherUserId == null || otherUserId.equals(me.getId()))
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "otherUserId inválido"));
            User otherUser = userRepository.findById(otherUserId).orElse(null);
            if (otherUser == null) return ResponseEntity.status(404).body(Map.of("success", false, "message", "Usuário não encontrado"));

            List<Conversation> myConvs = conversationRepository.findByParticipantUserIdOrderByCreatedAtDesc(me.getId());
            for (Conversation c : myConvs) {
                if (c.getType() != ConversationType.DIRECT) continue;
                List<ConversationParticipant> parts = participantRepository.findByConversationIdOrderByJoinedAtAsc(c.getId());
                if (parts.size() != 2) continue;
                boolean hasMe = parts.stream().anyMatch(p -> p.getUser().getId().equals(me.getId()));
                boolean hasOther = parts.stream().anyMatch(p -> p.getUser().getId().equals(otherUserId));
                if (hasMe && hasOther) {
                    Map<String, Object> convMap = conversationToMap(c, me);
                    return ResponseEntity.ok(Map.of("success", true, "conversation", convMap, "alreadyExists", true));
                }
            }

            Conversation conv = new Conversation();
            conv.setType(ConversationType.DIRECT);
            conv = conversationRepository.save(conv);
            ConversationParticipant p1 = new ConversationParticipant();
            p1.setConversation(conv);
            p1.setUser(me);
            participantRepository.save(p1);
            ConversationParticipant p2 = new ConversationParticipant();
            p2.setConversation(conv);
            p2.setUser(otherUser);
            participantRepository.save(p2);
            Map<String, Object> convMap = conversationToMap(conv, me);
            return ResponseEntity.ok(Map.of("success", true, "conversation", convMap));
        }

        if ("GROUP".equalsIgnoreCase(typeStr)) {
            String name = body != null && body.get("name") != null ? body.get("name").toString().trim() : null;
            if (name == null || name.isEmpty()) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "name obrigatório para grupo"));

            @SuppressWarnings("unchecked")
            List<Number> ids = body.get("userIds") instanceof List ? (List<Number>) body.get("userIds") : null;
            if (ids == null) ids = new ArrayList<>();
            Set<Long> userIds = new HashSet<>();
            userIds.add(me.getId());
            for (Number n : ids) userIds.add(n.longValue());

            String avatarUrl = body != null && body.get("avatarUrl") != null ? body.get("avatarUrl").toString().trim() : null;
            if (avatarUrl != null && avatarUrl.isEmpty()) avatarUrl = null;

            Conversation conv = new Conversation();
            conv.setType(ConversationType.GROUP);
            conv.setName(name);
            conv.setAvatarUrl(avatarUrl);
            conv.setCreatedByUserId(me.getId());
            conv = conversationRepository.save(conv);
            for (Long uid : userIds) {
                User u = userRepository.findById(uid).orElse(null);
                if (u == null) continue;
                ConversationParticipant p = new ConversationParticipant();
                p.setConversation(conv);
                p.setUser(u);
                participantRepository.save(p);
            }
            Map<String, Object> convMap = conversationToMap(conv, me);
            return ResponseEntity.ok(Map.of("success", true, "conversation", convMap));
        }

        return ResponseEntity.badRequest().body(Map.of("success", false, "message", "type deve ser DIRECT ou GROUP"));
    }

    /** Adiciona participante ao grupo. */
    @PostMapping("/conversations/{id}/participants")
    public ResponseEntity<?> addParticipant(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        User me = userFromToken(authHeader);
        if (me == null) return ResponseEntity.status(401).body(Map.of("success", false, "message", "Não autorizado"));

        Optional<Conversation> opt = conversationRepository.findByIdAndParticipantUserId(id, me.getId());
        if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("success", false, "message", "Conversa não encontrada"));
        Conversation c = opt.get();
        if (c.getType() != ConversationType.GROUP) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Só grupos aceitam novos participantes"));
        if (c.getCreatedByUserId() != null && !c.getCreatedByUserId().equals(me.getId()))
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Apenas quem criou o grupo pode adicionar participantes"));

        Object uidObj = body != null ? body.get("userId") : null;
        Long userId = uidObj instanceof Number ? ((Number) uidObj).longValue() : null;
        if (userId == null) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "userId obrigatório"));
        if (participantRepository.existsByConversationIdAndUserId(id, userId))
            return ResponseEntity.ok(Map.of("success", true, "message", "Já é participante"));

        User newUser = userRepository.findById(userId).orElse(null);
        if (newUser == null) return ResponseEntity.status(404).body(Map.of("success", false, "message", "Usuário não encontrado"));

        ConversationParticipant p = new ConversationParticipant();
        p.setConversation(c);
        p.setUser(newUser);
        participantRepository.save(p);
        return ResponseEntity.ok(Map.of("success", true));
    }

    /** Lista usuários para iniciar conversa (todos exceto eu). */
    @GetMapping("/users")
    public ResponseEntity<?> listUsers(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        User me = userFromToken(authHeader);
        if (me == null) return ResponseEntity.status(401).body(Map.of("success", false, "message", "Não autorizado"));

        List<User> users = userRepository.findAll().stream()
            .filter(u -> !u.getId().equals(me.getId()))
            .sorted(Comparator.comparing(User::getName))
            .collect(Collectors.toList());
        List<Map<String, Object>> payload = users.stream().map(this::userToMap).collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("success", true, "users", payload));
    }

    /** Atualiza grupo (nome e/ou avatar). Apenas o criador pode atualizar. */
    @PatchMapping("/conversations/{id}")
    public ResponseEntity<?> updateConversation(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        User me = userFromToken(authHeader);
        if (me == null) return ResponseEntity.status(401).body(Map.of("success", false, "message", "Não autorizado"));

        Optional<Conversation> opt = conversationRepository.findByIdAndParticipantUserId(id, me.getId());
        if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("success", false, "message", "Conversa não encontrada"));
        Conversation c = opt.get();
        if (c.getType() != ConversationType.GROUP) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Só grupos podem ser editados"));
        if (c.getCreatedByUserId() == null || !c.getCreatedByUserId().equals(me.getId()))
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Apenas quem criou o grupo pode editar"));

        if (body != null && body.containsKey("name")) {
            String name = body.get("name") != null ? body.get("name").toString().trim() : null;
            c.setName(name != null && !name.isEmpty() ? name : c.getName());
        }
        if (body != null && body.containsKey("avatarUrl")) {
            String avatarUrl = body.get("avatarUrl") != null ? body.get("avatarUrl").toString().trim() : null;
            c.setAvatarUrl(avatarUrl != null && !avatarUrl.isEmpty() ? avatarUrl : null);
        }
        conversationRepository.save(c);
        Map<String, Object> convMap = conversationToMap(c, me);
        return ResponseEntity.ok(Map.of("success", true, "conversation", convMap));
    }

    /** Remove participante do grupo. O criador pode remover qualquer um; qualquer participante pode sair (remover a si mesmo). */
    @DeleteMapping("/conversations/{id}/participants/{userId}")
    public ResponseEntity<?> removeParticipant(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id,
            @PathVariable Long userId) {
        User me = userFromToken(authHeader);
        if (me == null) return ResponseEntity.status(401).body(Map.of("success", false, "message", "Não autorizado"));

        Optional<Conversation> opt = conversationRepository.findByIdAndParticipantUserId(id, me.getId());
        if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("success", false, "message", "Conversa não encontrada"));
        Conversation c = opt.get();
        if (c.getType() != ConversationType.GROUP) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Só grupos têm participantes removíveis"));

        boolean isRemovingSelf = userId.equals(me.getId());
        boolean isCreator = c.getCreatedByUserId() != null && c.getCreatedByUserId().equals(me.getId());
        if (!isRemovingSelf && !isCreator)
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Apenas quem criou o grupo pode remover outros participantes"));

        Optional<ConversationParticipant> toRemove = participantRepository.findByConversationIdAndUserId(id, userId);
        if (toRemove.isEmpty()) return ResponseEntity.status(404).body(Map.of("success", false, "message", "Participante não encontrado"));

        participantRepository.delete(toRemove.get());
        return ResponseEntity.ok(Map.of("success", true));
    }

    /** Upload de foto do grupo. Apenas o criador pode enviar. Salva em uploads/avatars/groups/{id}/ */
    @PostMapping(value = "/conversations/{id}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadGroupAvatar(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {
        User me = userFromToken(authHeader);
        if (me == null) return ResponseEntity.status(401).body(Map.of("success", false, "message", "Não autorizado"));

        Optional<Conversation> opt = conversationRepository.findByIdAndParticipantUserId(id, me.getId());
        if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("success", false, "message", "Conversa não encontrada"));
        Conversation c = opt.get();
        if (c.getType() != ConversationType.GROUP) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Só grupos têm avatar"));
        if (c.getCreatedByUserId() == null || !c.getCreatedByUserId().equals(me.getId()))
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Apenas quem criou o grupo pode alterar a foto"));

        if (file == null || file.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Nenhum arquivo enviado"));
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType))
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Envie uma imagem (JPG, PNG, GIF ou WebP)"));

        try {
            String ext = contentType.split("/")[1];
            if ("jpeg".equals(ext)) ext = "jpg";
            String filename = System.currentTimeMillis() + "." + ext;
            Path dir = Path.of(uploadDir).toAbsolutePath().normalize().resolve("avatars").resolve("groups").resolve(String.valueOf(id));
            Files.createDirectories(dir);
            Path target = dir.resolve(filename);
            file.transferTo(target.toFile());
            String baseUrl = resolveApiBaseUrl(request);
            String avatarUrl = baseUrl + "/api/uploads/avatars/groups/" + id + "/" + filename;
            c.setAvatarUrl(avatarUrl);
            conversationRepository.save(c);
            Map<String, Object> convMap = conversationToMap(c, me);
            return ResponseEntity.ok(Map.of("success", true, "avatarUrl", avatarUrl, "conversation", convMap));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "Erro ao salvar a imagem"));
        }
    }

    private String resolveApiBaseUrl(HttpServletRequest request) {
        if (apiBaseUrl != null && !apiBaseUrl.contains("localhost"))
            return apiBaseUrl.endsWith("/") ? apiBaseUrl.substring(0, apiBaseUrl.length() - 1) : apiBaseUrl;
        if (request == null) return apiBaseUrl;
        String scheme = request.getHeader("X-Forwarded-Proto");
        if (scheme == null || scheme.isBlank()) scheme = request.getScheme();
        String host = request.getHeader("X-Forwarded-Host");
        if (host == null || host.isBlank()) host = request.getServerName();
        int port = request.getServerPort();
        boolean defaultPort = ("https".equals(scheme) && port == 443) || ("http".equals(scheme) && port == 80);
        if (defaultPort) return scheme + "://" + host;
        return scheme + "://" + host + ":" + port;
    }

    private Map<String, Object> conversationToMap(Conversation c, User me) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", c.getId());
        item.put("type", c.getType().name());
        item.put("name", c.getName());
        item.put("avatarUrl", c.getAvatarUrl());
        item.put("createdByUserId", c.getCreatedByUserId());
        item.put("createdAt", c.getCreatedAt().format(ISO));
        List<ConversationParticipant> participants = participantRepository.findByConversationIdOrderByJoinedAtAsc(c.getId());
        item.put("participants", participants.stream().map(p -> userToMap(p.getUser())).collect(Collectors.toList()));
        if (c.getType() == ConversationType.GROUP && c.getName() != null) item.put("displayName", c.getName());
        else {
            String other = participants.stream().filter(p -> !p.getUser().getId().equals(me.getId()))
                .map(p -> p.getUser().getName()).findFirst().orElse("Conversa");
            item.put("displayName", other);
        }
        return item;
    }
}
