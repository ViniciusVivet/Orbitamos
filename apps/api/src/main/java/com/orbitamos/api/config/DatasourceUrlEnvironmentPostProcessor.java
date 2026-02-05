package com.orbitamos.api.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * Acrescenta parâmetros de timeout na URL JDBC do PostgreSQL para evitar
 * "Connect timed out" em deploys (ex.: Render + Supabase em regiões diferentes).
 * Não exige alterar variáveis no Render — a URL configurada lá permanece a mesma.
 */
public class DatasourceUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String PARAMS = "connectTimeout=60000&socketTimeout=60000";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String url = environment.getProperty("spring.datasource.url");
        if (url == null || !url.startsWith("jdbc:postgresql:")) {
            return;
        }
        if (url.contains("connectTimeout=")) {
            return;
        }
        String separator = url.contains("?") ? "&" : "?";
        String newUrl = url + separator + PARAMS;
        Map<String, Object> override = new HashMap<>();
        override.put("spring.datasource.url", newUrl);
        environment.getPropertySources().addFirst(new MapPropertySource("datasourceUrlTimeoutOverride", override));
    }
}
