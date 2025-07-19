package tn.talan.backendapp.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AiServiceConfig {

    @Bean
    @ConfigurationProperties(prefix = "ai.matching")
    public AiMatchingProperties aiMatchingProperties() {
        return new AiMatchingProperties();
    }

    @Bean
    public RestTemplate aiRestTemplate() {
        return new RestTemplate();
    }

    public static class AiMatchingProperties {
        private String url;
        private boolean enabled;
        private int timeout;

        // Getters and setters
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
        public int getTimeout() { return timeout; }
        public void setTimeout(int timeout) { this.timeout = timeout; }
    }
}