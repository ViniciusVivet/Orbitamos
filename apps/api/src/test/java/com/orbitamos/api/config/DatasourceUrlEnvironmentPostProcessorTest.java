package com.orbitamos.api.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.StandardEnvironment;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class DatasourceUrlEnvironmentPostProcessorTest {

    private final DatasourceUrlEnvironmentPostProcessor processor = new DatasourceUrlEnvironmentPostProcessor();

    @Test
    void deveAcrescentarTimeoutsQuandoUrlPostgresSemQueryString() {
        StandardEnvironment env = new StandardEnvironment();
        env.getPropertySources().addFirst(new MapPropertySource("test",
                Map.of("spring.datasource.url", "jdbc:postgresql://localhost:5432/orbitamos")));

        processor.postProcessEnvironment(env, new SpringApplication());

        String url = env.getProperty("spring.datasource.url");
        assertThat(url).isEqualTo("jdbc:postgresql://localhost:5432/orbitamos?connectTimeout=60000&socketTimeout=60000");
    }

    @Test
    void deveAcrescentarTimeoutsQuandoUrlPostgresComQueryString() {
        StandardEnvironment env = new StandardEnvironment();
        env.getPropertySources().addFirst(new MapPropertySource("test",
                Map.of("spring.datasource.url", "jdbc:postgresql://db.xxx.supabase.co:5432/postgres?sslmode=require")));

        processor.postProcessEnvironment(env, new SpringApplication());

        String url = env.getProperty("spring.datasource.url");
        assertThat(url).contains("sslmode=require");
        assertThat(url).contains("connectTimeout=60000");
        assertThat(url).contains("socketTimeout=60000");
    }

    @Test
    void naoDeveAlterarQuandoUrlJaTemConnectTimeout() {
        String original = "jdbc:postgresql://host:5432/db?connectTimeout=5000&socketTimeout=5000";
        StandardEnvironment env = new StandardEnvironment();
        env.getPropertySources().addFirst(new MapPropertySource("test", Map.of("spring.datasource.url", original)));

        processor.postProcessEnvironment(env, new SpringApplication());

        assertThat(env.getProperty("spring.datasource.url")).isEqualTo(original);
    }

    @Test
    void naoDeveAlterarQuandoUrlNaoEhPostgres() {
        StandardEnvironment env = new StandardEnvironment();
        env.getPropertySources().addFirst(new MapPropertySource("test",
                Map.of("spring.datasource.url", "jdbc:h2:mem:test")));

        processor.postProcessEnvironment(env, new SpringApplication());

        assertThat(env.getProperty("spring.datasource.url")).isEqualTo("jdbc:h2:mem:test");
    }

    @Test
    void naoDeveFalharQuandoUrlNaoExiste() {
        StandardEnvironment env = new StandardEnvironment();

        processor.postProcessEnvironment(env, new SpringApplication());

        assertThat(env.getProperty("spring.datasource.url")).isNull();
    }
}
