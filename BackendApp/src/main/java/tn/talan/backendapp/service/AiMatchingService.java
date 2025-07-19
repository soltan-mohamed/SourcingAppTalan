package tn.talan.backendapp.service;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import tn.talan.backendapp.configuration.AiServiceConfig;
import tn.talan.backendapp.entity.Candidate;

import java.util.List;
import java.util.Map;

@Service
public class AiMatchingService {
    private final RestTemplate restTemplate;
    private final AiServiceConfig.AiMatchingProperties properties;

    public AiMatchingService(RestTemplate restTemplate,
                             AiServiceConfig.AiMatchingProperties properties) {
        this.restTemplate = restTemplate;
        this.properties = properties;
    }

    public List<Map<String, Object>> findMatches(String requirements, List<Candidate> candidates) {
        if (!properties.isEnabled()) {
            throw new IllegalStateException("AI matching service is disabled");
        }

        String url = properties.getUrl() + "/match";

        // Prepare request payload
        Map<String, Object> request = Map.of(
                "requirements", requirements,
                "candidates", candidates.stream().map(c -> Map.of(
                        "id", c.getId(),
                        "prenom", c.getPrenom(),
                        "nom", c.getNom(),
                        "skills", c.getSkills()
                )).toList()
        );

        // Make the request to Flask service
        Map<String, Object> response = restTemplate.postForObject(
                url,
                request,
                Map.class
        );

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> matches = (List<Map<String, Object>>) response.get("matches");
        return matches;
    }
}