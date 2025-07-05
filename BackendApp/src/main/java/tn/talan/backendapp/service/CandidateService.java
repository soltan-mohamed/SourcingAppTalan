package tn.talan.backendapp.service;

import org.hibernate.Hibernate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import tn.talan.backendapp.entity.Candidate;
import tn.talan.backendapp.entity.User;
import tn.talan.backendapp.enums.Statut;
import tn.talan.backendapp.exceptions.ResourceNotFoundException;
import tn.talan.backendapp.exceptions.UnauthorizedAccessException;
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

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }
        throw new UnauthorizedAccessException("User not authenticated");
    }

    public List<Candidate> getAllCandidates() {
        User currentUser = getCurrentUser();
        List<Candidate> allCandidates = repository.findAll();

        allCandidates.forEach(candidate -> {
            boolean isEditable = candidate.getResponsable() != null &&
                    candidate.getResponsable().getId().equals(currentUser.getId());
            candidate.setEditable(isEditable);
        });

        return allCandidates;
    }

    public Candidate getCandidateById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + id));
    }

    public Candidate createCandidate(Candidate candidate) {
        User currentUser = getCurrentUser();
        System.out.println("Assigning responsable: " + currentUser.getId()); // Debug log
        candidate.setResponsable(currentUser);

        if (repository.existsByEmail(candidate.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        return repository.save(candidate);
    }

    public Candidate updateCandidate(Long id, Candidate candidateDetails) {
        Candidate candidate = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + id));

        User currentUser = getCurrentUser();
        if (!candidate.getResponsable().getId().equals(currentUser.getId())) {
            throw new UnauthorizedAccessException("You can only edit your own candidates");
        }

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

        User currentUser = getCurrentUser();
        if (!candidate.getResponsable().getId().equals(currentUser.getId())) {
            throw new UnauthorizedAccessException("You can only delete your own candidates");
        }

        repository.delete(candidate);
    }

    @Transactional
    public Map<String, Object> uploadCv(Long id, String cvPath) {
        Candidate candidate = getCandidateById(id);
        User currentUser = getCurrentUser();
        if (!candidate.getResponsable().getId().equals(currentUser.getId())) {
            throw new UnauthorizedAccessException("You can only upload CV for your own candidates");
        }

        candidate.setCv(cvPath);
        Candidate saved = repository.save(candidate);

        return Map.of(
                "id", saved.getId(),
                "nom", saved.getNom(),
                "prenom", saved.getPrenom(),
                "cv", saved.getCv(),
                "message", "CV uploaded successfully"
        );
    }

    public List<Candidate> getCandidatesByStatus(Statut status) {
        return repository.findByStatut(status);
    }
}