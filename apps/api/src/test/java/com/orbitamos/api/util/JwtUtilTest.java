package com.orbitamos.api.util;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Testes unitários do JwtUtil (geração e validação de token).
 */
class JwtUtilTest {

    private static final String SECRET_32 = "test-secret-com-pelo-menos-32-chars!!";
    private static final Long EXPIRATION_MS = 86400000L;

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", SECRET_32);
        ReflectionTestUtils.setField(jwtUtil, "expiration", EXPIRATION_MS);
    }

    @Test
    void deveGerarTokenEExtrairEmailEUserId() {
        String email = "user@orbitamos.com";
        Long userId = 1L;

        String token = jwtUtil.generateToken(email, userId);

        assertThat(token).isNotBlank();
        assertThat(jwtUtil.extractEmail(token)).isEqualTo(email);
        assertThat(jwtUtil.extractUserId(token)).isEqualTo(userId);
        assertThat(jwtUtil.isTokenExpired(token)).isFalse();
        assertThat(jwtUtil.validateToken(token, email)).isTrue();
    }

    @Test
    void validateTokenDeveRetornarFalsoQuandoEmailDiferente() {
        String token = jwtUtil.generateToken("a@b.com", 1L);

        assertThat(jwtUtil.validateToken(token, "outro@b.com")).isFalse();
    }

    @Test
    void deveAceitarSecretComMenosDe32CharsPreenchendoComA() {
        ReflectionTestUtils.setField(jwtUtil, "secret", "short");
        String token = jwtUtil.generateToken("x@y.com", 2L);

        assertThat(token).isNotBlank();
        assertThat(jwtUtil.extractEmail(token)).isEqualTo("x@y.com");
    }
}
