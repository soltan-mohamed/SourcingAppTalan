package tn.talan.backendapp.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.web.multipart.MultipartFile;
import tn.talan.backendapp.dtos.CandidateUpdateDTO;
import tn.talan.backendapp.dtos.RecrutementUpdateDTO;
import tn.talan.backendapp.entity.Candidate;
import tn.talan.backendapp.entity.Recrutement;
import tn.talan.backendapp.entity.User;
import tn.talan.backendapp.enums.Statut;
import tn.talan.backendapp.exceptions.ResourceNotFoundException;
import tn.talan.backendapp.repository.CandidateRepository;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import tn.talan.backendapp.repository.RecrutementRepository;

import java.io.IOException;
import java.time.LocalDate;
import java.util.*;

@Service
@Transactional // Add this
@Slf4j
public class CandidateService {
    private final CandidateRepository repository;
    private final RecrutementRepository recrutementRepository;

    // Maximum file size: 10MB
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    public CandidateService(CandidateRepository repository, RecrutementRepository recrutementRepository) {
        this.repository = repository;
        this.recrutementRepository = recrutementRepository;
    }

    @Transactional
    public Candidate uploadCv(Long candidateId, MultipartFile file) throws IOException {
        validateFile(file);

        Candidate candidate = repository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found with id: " + candidateId));

        candidate.setCvData(file.getBytes());
        candidate.setCvFilename(file.getOriginalFilename());
        candidate.setCvFileSize(file.getSize());
//        candidate.setCvContentType(file.getContentType());

        log.info("CV uploaded for candidate {}: {} ({} bytes)",
                candidateId, file.getOriginalFilename(), file.getSize());

        return repository.save(candidate);
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size exceeds maximum limit of 10MB");
        }

//        String contentType = file.getContentType();
//        boolean isValidType = false;
//        for (String allowedType : ALLOWED_CONTENT_TYPES) {
//            if (allowedType.equals(contentType)) {
//                isValidType = true;
//                break;
//            }
//        }
//
//        if (!isValidType) {
//            throw new RuntimeException("Invalid file type. Only PDF files are allowed");
//        }
    }
    public List<Candidate> getAll() {
        return repository.fetchAllWithRecrutements();
    }


    public Candidate findByIdWithCv(Long id) {
        return repository.findByIdWithCv(id).orElse(null);
    }

    public Candidate getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public List<Candidate> getAllVivierCandidates() {
        return repository.findByStatut(Statut.VIVIER);
    }

    public List<Candidate> getAllInProgressAndContacted(User currentUser) {
        List<Statut> statuts = Arrays.asList(Statut.CONTACTED, Statut.IN_PROGRESS);
//        return repository.findByStatutIn(statuts);
        return repository.findByEvaluateur(currentUser);

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
        if (dto.getSkills() != null) {
            candidate.setSkills(dto.getSkills());
        }
        if (dto.getStatut() != null) {
            candidate.setStatut(dto.getStatut());
        }

        candidate.setHiringDate(dto.getHiringDate());

        if (dto.getRecrutements() != null && !dto.getRecrutements().isEmpty()) {
            log.info("Processing recruitment updates for candidate {}", id);
            for (RecrutementUpdateDTO recrutementDto : dto.getRecrutements()) {
                // On charge l'entité Recrutement par son ID
                Recrutement recrutementToUpdate = recrutementRepository.findById(recrutementDto.getId())
                        .orElseThrow(() -> new EntityNotFoundException("Recruitment not found with id: " + recrutementDto.getId()));

                // On vérifie que ce recrutement appartient bien au bon candidat pour la sécurité
                if (recrutementToUpdate.getCandidate().getId().equals(id)) {
                    log.info("Updating position for recruitment {} from '{}' to '{}'",
                            recrutementDto.getId(),
                            recrutementToUpdate.getPosition(), // Ancienne valeur pour le log
                            recrutementDto.getPosition());

                    recrutementToUpdate.setPosition(recrutementDto.getPosition());
                    // Pas besoin de save ici, car @Transactional gère la sauvegarde
                } else {
                    log.warn("Attempted to update recruitment {} which does not belong to candidate {}",
                            recrutementDto.getId(), id);
                }
            }
        }

        // La transaction sera "commit" à la fin de la méthode,
        // et toutes les modifications (sur Candidate et Recrutement) seront sauvegardées.

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

    public List<Candidate> searchVivierCandidates(String searchText, String searchCriteria, Integer minExperience, Integer maxExperience) {
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

        return repository.searchVivierCandidates(searchText, searchCriteria, minExperience, maxExperience, minExperienceDate, maxExperienceDate);
    }
}
