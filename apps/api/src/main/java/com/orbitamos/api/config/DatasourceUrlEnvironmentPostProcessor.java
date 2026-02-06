package com.orbitamos.api.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * Ajusta a URL JDBC do PostgreSQL antes da conexão (evita quebrar deploy no Render sem mexer na infra):
 * <ul>
 *   <li><b>Pooler Supabase:</b> se a URL tiver {@code pooler.supabase.com} e {@code :5432}, troca para {@code :6543}
 *       (o pooler só aceita 6543; 5432 dá "Connection refused").</li>
 *   <li><b>Timeouts:</b> só acrescenta connectTimeout/socketTimeout na URL se
 *       {@code APP_DATASOURCE_APPEND_TIMEOUT_PARAMS=true}; padrão é não alterar.</li>
 * </ul>
 * Documentação completa: {@code docs/RENDER_SUPABASE_SETUP.md} seção "O que o código faz pela URL do banco".
 */
public class DatasourceUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String PARAMS = "connectTimeout=60000&socketTimeout=60000";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String url = environment.getProperty("spring.datasource.url");
        if (url == null || !url.startsWith("jdbc:postgresql:")) {
            return;
        }
        String current = url;
        // Pooler Supabase: porta 5432 não aceita conexões; usar 6543
        if (current.contains("pooler.supabase.com") && current.contains(":5432")) {
            current = current.replace(":5432", ":6543");
        }
        // Timeouts só se ativar (padrão: não altera)
        String enable = environment.getProperty("app.datasource.append-timeout-params",
                environment.getProperty("APP_DATASOURCE_APPEND_TIMEOUT_PARAMS", "false"));
        if ("true".equalsIgnoreCase(enable) && !current.contains("connectTimeout=")) {
            String separator = current.contains("?") ? "&" : "?";
            current = current + separator + PARAMS;
        }
        if (current.equals(url)) {
            return;
        }
        Map<String, Object> override = new HashMap<>();
        override.put("spring.datasource.url", current);
        environment.getPropertySources().addFirst(new MapPropertySource("datasourceUrlOverride", override));
    }
}
