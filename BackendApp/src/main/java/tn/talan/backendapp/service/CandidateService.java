package tn.talan.backendapp.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import tn.talan.backendapp.dtos.CandidateUpdateDTO;
import tn.talan.backendapp.entity.Candidate;
import tn.talan.backendapp.enums.Statut;
import tn.talan.backendapp.exceptions.ResourceNotFoundException;
import tn.talan.backendapp.repository.CandidateRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
@Transactional // Add this
public class CandidateService {
    private final CandidateRepository repository;

    public CandidateService(CandidateRepository repository) {
        this.repository = repository;
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

    public List<Candidate> getAll() {
        return repository.fetchAllWithRecrutements();
    }

    public Candidate getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public List<Candidate> getAllVivierCandidates() {
        return repository.findByStatut(Statut.VIVIER);
    }

    public List<Candidate> getAllNonVivierCandidates() {
        return repository.findNonVivierCandidates();
    }

    public List<Candidate> getVivierCandidates() {
        return repository.findVivierCandidates();
    }

    public Candidate save(Candidate c) {
        return repository.save(c);
    }

    public List<Candidate> getAllNotVivierCandidates() {
        //List<Statut> excludedStatuts = Arrays.asList(Statut.REJECTED);
        List<Candidate> candidates = repository.findByStatutIsNot(Statut.VIVIER);
        if (candidates.isEmpty()) {
            return null;
        }
        else return candidates;
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public Candidate update(Long id, Candidate updated) {
        Candidate c = repository.findById(id).orElse(null);
        if (c != null) {
            c.setNom(updated.getNom());
            c.setPrenom(updated.getPrenom());
            c.setEmail(updated.getEmail());
            c.setTelephone(updated.getTelephone());
            c.setSkills(updated.getSkills());
            c.setCv(updated.getCv());
            c.setStatut(updated.getStatut());
            c.setHiringDate(updated.getHiringDate());
            return repository.save(c);
        }
        return null;
    }

    @Transactional
    public Candidate updateCandidate(Long id, CandidateUpdateDTO dto) {
        Candidate candidate = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Candidate not found"));

        if (dto.getNom() != null) {
            candidate.setNom(dto.getNom());
        }
        if (dto.getPrenom() != null) {
            candidate.setPrenom(dto.getPrenom());
        }
        if (dto.getEmail() != null) {
            candidate.setEmail(dto.getEmail());
        }
        if (dto.getTelephone() != null) {
            candidate.setTelephone(dto.getTelephone());
        }
        if (dto.getCv() != null) {
            candidate.setCv(dto.getCv());
        }
        if (dto.getSkills() != null) {
            candidate.setSkills(dto.getSkills());
        }
        if (dto.getStatut() != null) {
            candidate.setStatut(dto.getStatut());
        }

        candidate.setHiringDate(dto.getHiringDate());

        return candidate;
    }

    public List<Candidate> getCandidatesWithoutExperience() {
        return repository.findCandidatesWithoutExperience();
    }

    public List<Candidate> getCandidatesWithExperienceGreaterThan(int years) {
        LocalDate dateThreshold = LocalDate.now().minusYears(years);
        return repository.findCandidatesWithExperienceGreaterThan(dateThreshold);
    }

    public List<Candidate> getCandidatesWithExperienceLessThan(int years) {
        LocalDate dateThreshold = LocalDate.now().minusYears(years);
        return repository.findCandidatesWithExperienceLessThan(dateThreshold);
    }

    public String calculateExperiencePeriod(Long candidateId) {
        Candidate candidate = repository.findById(candidateId)
                .orElseThrow(() -> new EntityNotFoundException("Candidate not found"));
        return candidate.getExperiencePeriod();
    }

    public double calculateExperienceInYears(Long candidateId) {
        Candidate candidate = repository.findById(candidateId)
                .orElseThrow(() -> new EntityNotFoundException("Candidate not found"));
        return candidate.getExperienceInYears();
    }

    public List<Candidate> searchCandidates(String searchText, String searchCriteria, Statut statut, Integer minExperience, Integer maxExperience) {
        LocalDate minExperienceDate = null;
        LocalDate maxExperienceDate = null;

        // Handle special case for 0-1 years (candidates with no hiring date or very recent hiring date)
        if (minExperience != null && maxExperience != null && minExperience == 0 && maxExperience == 1) {
            // For 0-1 years, we want candidates with null hiring date OR hired within the last year
            maxExperienceDate = LocalDate.now().minusYears(1);
            // minExperienceDate stays null for this case
        } else {
            // For other ranges, calculate dates normally
            if (minExperience != null && minExperience > 0) {
                minExperienceDate = LocalDate.now().minusYears(minExperience);
            }

            if (maxExperience != null && maxExperience > 0) {
                maxExperienceDate = LocalDate.now().minusYears(maxExperience);
            }
        }

        return repository.searchCandidates(searchText, searchCriteria, statut, minExperience, maxExperience, minExperienceDate, maxExperienceDate);
    }

    public List<Candidate> searchNonVivierCandidates(String searchText, String searchCriteria, Statut statut, Integer minExperience, Integer maxExperience) {
        LocalDate minExperienceDate = null;
        LocalDate maxExperienceDate = null;

        // Handle special case for 0-1 years (candidates with no hiring date or very recent hiring date)
        if (minExperience != null && maxExperience != null && minExperience == 0 && maxExperience == 1) {
            // For 0-1 years, we want candidates with null hiring date OR hired within the last year
            maxExperienceDate = LocalDate.now().minusYears(1);
            // minExperienceDate stays null for this case
        } else {
            // For other ranges, calculate dates normally
            if (minExperience != null && minExperience > 0) {
                minExperienceDate = LocalDate.now().minusYears(minExperience);
            }

            if (maxExperience != null && maxExperience > 0) {
                maxExperienceDate = LocalDate.now().minusYears(maxExperience);
            }
        }

        return repository.searchNonVivierCandidates(searchText, searchCriteria, statut, minExperience, maxExperience, minExperienceDate, maxExperienceDate);
    }
}
