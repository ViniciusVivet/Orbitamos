package com.orbitamos.api.service;

import com.orbitamos.api.dto.AuthResponse;
import com.orbitamos.api.dto.LoginRequest;
import com.orbitamos.api.dto.RegisterRequest;
import com.orbitamos.api.entity.User;
import com.orbitamos.api.entity.UserRole;
import com.orbitamos.api.repository.UserRepository;
import com.orbitamos.api.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private User userSalvo;

    @BeforeEach
    void setUp() {
        userSalvo = new User();
        userSalvo.setId(1L);
        userSalvo.setEmail("user@orbitamos.com");
        userSalvo.setName("User Test");
        userSalvo.setPassword("encoded");
        userSalvo.setRole(UserRole.STUDENT);
    }

    @Test
    void deveRegistrarUsuarioComSucesso() {
        RegisterRequest request = new RegisterRequest("User Test", "user@orbitamos.com", "senha123");
        when(userRepository.existsByEmail("user@orbitamos.com")).thenReturn(false);
        when(passwordEncoder.encode("senha123")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenReturn(userSalvo);
        when(jwtUtil.generateToken("user@orbitamos.com", 1L)).thenReturn("token-jwt");

        AuthResponse response = authService.register(request);

        assertThat(response.getEmail()).isEqualTo("user@orbitamos.com");
        assertThat(response.getName()).isEqualTo("User Test");
        assertThat(response.getToken()).isEqualTo("token-jwt");
        assertThat(response.getMessage()).contains("Cadastro");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void deveLancarQuandoEmailVazioNoRegistro() {
        RegisterRequest request = new RegisterRequest("Nome", "", "senha123");

        assertThatThrownBy(() -> authService.register(request))
                .hasMessageContaining("E-mail é obrigatório");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void deveLancarQuandoSenhaCurtaNoRegistro() {
        RegisterRequest request = new RegisterRequest("Nome", "a@b.com", "12345");

        assertThatThrownBy(() -> authService.register(request))
                .hasMessageContaining("mínimo 6 caracteres");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void deveLancarQuandoEmailJaCadastradoNoRegistro() {
        RegisterRequest request = new RegisterRequest("User", "user@orbitamos.com", "senha123");
        when(userRepository.existsByEmail("user@orbitamos.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .hasMessageContaining("já está cadastrado");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void deveFazerLoginComSucesso() {
        LoginRequest request = new LoginRequest("user@orbitamos.com", "senha123");
        when(userRepository.findByEmail("user@orbitamos.com")).thenReturn(Optional.of(userSalvo));
        when(passwordEncoder.matches("senha123", "encoded")).thenReturn(true);
        when(jwtUtil.generateToken("user@orbitamos.com", 1L)).thenReturn("token-jwt");

        AuthResponse response = authService.login(request);

        assertThat(response.getEmail()).isEqualTo("user@orbitamos.com");
        assertThat(response.getToken()).isEqualTo("token-jwt");
        assertThat(response.getMessage()).contains("Login");
    }

    @Test
    void deveLancarQuandoEmailOuSenhaIncorretosNoLogin() {
        LoginRequest request = new LoginRequest("user@orbitamos.com", "senhaErrada");
        when(userRepository.findByEmail("user@orbitamos.com")).thenReturn(Optional.of(userSalvo));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .hasMessageContaining("E-mail ou senha incorretos");
    }

    @Test
    void deveLancarQuandoEmailVazioNoLogin() {
        LoginRequest request = new LoginRequest("", "senha");

        assertThatThrownBy(() -> authService.login(request))
                .hasMessageContaining("E-mail é obrigatório");
    }
}
