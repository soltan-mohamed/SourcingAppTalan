package tn.talan.backendapp.service;

import org.hibernate.Hibernate;
import tn.talan.backendapp.entity.Candidate;
import tn.talan.backendapp.enums.Statut;
import tn.talan.backendapp.exceptions.ResourceNotFoundException;
import tn.talan.backendapp.repository.CandidateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@Transactional
public class CandidateService {

    private final CandidateRepository repository;

    public CandidateService(CandidateRepository repository) {
        this.repository = repository;
    }

    public List<Candidate> getAllCandidates() {
        return repository.findAll();
    }

    public Candidate getCandidateById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + id));
    }

    public Candidate createCandidate(Candidate candidate) {
        // Add any business validation logic here
        if (repository.existsByEmail(candidate.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        return repository.save(candidate);
    }

    @Transactional
    public Candidate getCandidateByIdWithSkills(Long id) {
        Candidate candidate = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + id));
        // Initialize the skills collection
        candidate.getSkills().size(); // This forces initialization
        return candidate;
    }

    public Candidate updateCandidate(Long id, Candidate candidateDetails) {
        Candidate candidate = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + id));

        // Update only non-null fields
        if (candidateDetails.getNom() != null) {
            candidate.setNom(candidateDetails.getNom());
        }
        if (candidateDetails.getPrenom() != null) {
            candidate.setPrenom(candidateDetails.getPrenom());
        }
        if (candidateDetails.getEmail() != null && !candidateDetails.getEmail().equals(candidate.getEmail())) {
            if (repository.existsByEmail(candidateDetails.getEmail())) {
                throw new IllegalArgumentException("Email already exists");
            }
            candidate.setEmail(candidateDetails.getEmail());
        }
        if (candidateDetails.getTelephone() != null) {
            candidate.setTelephone(candidateDetails.getTelephone());
        }
        if (candidateDetails.getSkills() != null) {
            candidate.setSkills(candidateDetails.getSkills());
        }
        if (candidateDetails.getCv() != null) {
            candidate.setCv(candidateDetails.getCv());
        }
        if (candidateDetails.getStatut() != null) {
            candidate.setStatut(candidateDetails.getStatut());
        }

        return repository.save(candidate);
    }

    public void deleteCandidate(Long id) {
        Candidate candidate = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + id));
        repository.delete(candidate);
    }

    @Transactional
    public Map<String, Object> uploadCv(Long id, String cvPath) {
        Candidate candidate = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + id));
        candidate.setCv(cvPath);
        Candidate saved = repository.save(candidate);

        // Return only what you need in the response
        return Map.of(
                "id", saved.getId(),
                "nom", saved.getNom(),
                "prenom", saved.getPrenom(),
                "cv", saved.getCv(),
                "message", "CV uploaded successfully"
        );
    }

    // CandidateService.java
    @Transactional
    public List<Candidate> getAllCandidatesWithRelations() {
        List<Candidate> candidates = repository.findAll();
        // Initialize necessary relationships
        candidates.forEach(candidate -> {
            Hibernate.initialize(candidate.getSkills());
            if (candidate.getResponsable() != null) {
                Hibernate.initialize(candidate.getResponsable().getFullName());
            }
        });
        return candidates;
    }

    public List<Candidate> getCandidatesByStatus(Statut status) {
        return repository.findByStatut(status);
    }

    public Candidate save(Candidate candidate) {
        // Validate candidate before saving
        if (candidate == null) {
            throw new IllegalArgumentException("Candidate cannot be null");
        }

        // Check for duplicate email if this is a new candidate
        if (candidate.getId() == null && repository.existsByEmail(candidate.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Check for duplicate email if email is being updated
        if (candidate.getId() != null) {
            Candidate existing = repository.findById(candidate.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));

            if (!existing.getEmail().equals(candidate.getEmail()) &&
                    repository.existsByEmail(candidate.getEmail())) {
                throw new IllegalArgumentException("Email already exists");
            }
        }

        return repository.save(candidate);
    }
}