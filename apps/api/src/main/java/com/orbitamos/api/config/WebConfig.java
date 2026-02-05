package com.orbitamos.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

/**
 * Expõe arquivos de avatar enviados pela plataforma em /api/uploads/avatars/**
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload-dir:./uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path base = Path.of(uploadDir).toAbsolutePath().normalize();
        String location = "file:" + base + "/avatars/";
        registry.addResourceHandler("/api/uploads/avatars/**")
                .addResourceLocations(location);
    }
}
