package tn.talan.backendapp.controller;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import tn.talan.backendapp.dtos.CandidateCreationResponse;
import tn.talan.backendapp.dtos.CandidateUpdateDTO;
import tn.talan.backendapp.dtos.CreateCandidatDTO;
import tn.talan.backendapp.dtos.createRecrutementDTO;
import tn.talan.backendapp.entity.Candidate;
import tn.talan.backendapp.entity.User;
import tn.talan.backendapp.enums.Statut;
import tn.talan.backendapp.repository.RecrutementRepository;
import tn.talan.backendapp.repository.UserRepository;
import tn.talan.backendapp.service.*;
import org.springframework.web.bind.annotation.*;
import tn.talan.backendapp.entity.Recrutement;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

import static org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE;

@RestController
@RequestMapping("/api/candidats")
@Slf4j
public class CandidateController {

    private final CandidateService service;
    private final AuthenticationService authService;
    private final UserRepository userRepository;
    private final RecrutementService recrutementService;
    private final FileStorageService fileStorageService;
    private final AiMatchingService aiMatchingService;

    public CandidateController(CandidateService service, AuthenticationService authService, UserRepository userRepository, RecrutementService recrutementService, FileStorageService fileStorageService, AiMatchingService aiMatchingService) {
        this.authService = authService;
        this.service = service;
        this.userRepository = userRepository;
        this.recrutementService = recrutementService;
        this.fileStorageService = fileStorageService;
        this.aiMatchingService = aiMatchingService;
    }

    @GetMapping("/{id}/cv")
    public ResponseEntity<byte[]> getCandidateCv(@PathVariable Long id) {
        Candidate candidate = service.findByIdWithCv(id);
        if (candidate == null) {
            return ResponseEntity.notFound().build();
        }

        byte[] cvBytes = candidate.getCvData();
        String filename = candidate.getCvFilename();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(cvBytes);
    }



    @PostMapping(path="/{id}/cv")
    public ResponseEntity<Map<String, Object>> uploadCv(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        log.info(">>> Received uploadCv request for candidate: {}", id);


        Map<String, Object> response = new HashMap<>();

        try {
            Candidate candidate = service.uploadCv(id, file);

            response.put("success", true);
            response.put("message", "CV uploaded successfully");
            response.put("filename", candidate.getCvFilename());
            response.put("fileSize", candidate.getCvFileSize());

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            log.error("Error uploading CV for candidate {}: {}", id, e.getMessage());
            response.put("success", false);
            response.put("message", "Failed to upload CV: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } catch (RuntimeException e) {
            log.error("Validation error uploading CV for candidate {}: {}", id, e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PostMapping("/match")
    public ResponseEntity<?> findMatches(@RequestBody Map<String, String> request) {
        try {
            String requirements = request.get("requirements");
            List<Candidate> candidates = service.getAllVivierCandidates();

            List<Map<String, Object>> matches = aiMatchingService.findMatches(requirements, candidates);
            return ResponseEntity.ok(Map.of("matches", matches));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public List<Candidate> getAll() {
        return service.getAll();
    }

    @GetMapping("/in-progress&contacted")
    public List<Candidate> getAllInProgressAndContacted() {
        String email = authService.getCurrentUsername();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        return service.getAllInProgressAndContacted(currentUser);
    }

    @GetMapping("/{id}")
    public Candidate getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public ResponseEntity<CandidateCreationResponse> create(@RequestBody CreateCandidatDTO candidate_recrutement_DTO) {
        Candidate candidate = candidate_recrutement_DTO.getCandidate();
        String email = authService.getCurrentUsername();
        User responsable = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        candidate.setResponsable(responsable);

        Candidate savedCandidate = service.save(candidate);
        Recrutement createdRecrutement = null;

        if (candidate_recrutement_DTO.getRecruitment() != null) {
            //candidate_recrutement_DTO.getRecruitment().setCandidate(savedCandidate);
            createdRecrutement = recrutementService.create(candidate_recrutement_DTO.getRecruitment(), candidate);
        }

        return ResponseEntity.ok(new CandidateCreationResponse(savedCandidate, createdRecrutement));
    }

    @GetMapping("/not-vivier")
    public List<Candidate> getAllNotVivier() {
        return service.getAllNotVivierCandidates();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Candidate> update(@PathVariable Long id, @RequestBody CandidateUpdateDTO candidate) {
        try {
            Candidate updatedCandidate = service.updateCandidate(id, candidate);
            return ResponseEntity.ok(updatedCandidate);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    // New endpoints for experience-related queries
    @GetMapping("/without-experience")
    public ResponseEntity<List<Candidate>> getCandidatesWithoutExperience() {
        List<Candidate> candidates = service.getCandidatesWithoutExperience();
        return ResponseEntity.ok(candidates);
    }

    @GetMapping("/experience/greater-than/{years}")
    public ResponseEntity<List<Candidate>> getCandidatesWithExperienceGreaterThan(@PathVariable int years) {
        List<Candidate> candidates = service.getCandidatesWithExperienceGreaterThan(years);
        return ResponseEntity.ok(candidates);
    }

    @GetMapping("/experience/less-than/{years}")
    public ResponseEntity<List<Candidate>> getCandidatesWithExperienceLessThan(@PathVariable int years) {
        List<Candidate> candidates = service.getCandidatesWithExperienceLessThan(years);
        return ResponseEntity.ok(candidates);
    }

    @GetMapping("/{id}/experience-period")
    public ResponseEntity<Map<String, Object>> getExperiencePeriod(@PathVariable Long id) {
        try {
            String experiencePeriod = service.calculateExperiencePeriod(id);
            double experienceInYears = service.calculateExperienceInYears(id);

            return ResponseEntity.ok(Map.of(
                    "candidateId", id,
                    "experiencePeriod", experiencePeriod,
                    "experienceInYears", experienceInYears
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/hiring-date")
    public ResponseEntity<Candidate> updateHiringDate(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hiringDate) {
        try {
            Candidate candidate = service.getById(id);
            if (candidate == null) {
                return ResponseEntity.notFound().build();
            }

            candidate.setHiringDate(hiringDate);
            Candidate updatedCandidate = service.save(candidate);
            return ResponseEntity.ok(updatedCandidate);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Candidate>> searchCandidates(
            @RequestParam(required = false) String searchText,
            @RequestParam(required = false) String searchCriteria,
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) Integer minExperience,
            @RequestParam(required = false) Integer maxExperience) {

        try {
            Statut statutEnum = null;
            if (statut != null && !statut.trim().isEmpty()) {
                statutEnum = Statut.valueOf(statut.toUpperCase());
            }

            List<Candidate> candidates = service.searchCandidates(searchText, searchCriteria, statutEnum, minExperience, maxExperience);
            return ResponseEntity.ok(candidates);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/search/not-vivier")
    public ResponseEntity<List<Candidate>> searchNonVivierCandidates(
            @RequestParam(required = false) String searchText,
            @RequestParam(required = false) String searchCriteria,
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) Integer minExperience,
            @RequestParam(required = false) Integer maxExperience) {

        try {
            Statut statutEnum = null;
            if (statut != null && !statut.trim().isEmpty()) {
                statutEnum = Statut.valueOf(statut.toUpperCase());
            }

            List<Candidate> candidates = service.searchNonVivierCandidates(searchText, searchCriteria, statutEnum, minExperience, maxExperience);
            return ResponseEntity.ok(candidates);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/statuses")
    public ResponseEntity<List<String>> getAllStatuses() {
        List<String> statuses = Arrays.stream(Statut.values())
                .map(Enum::name)
                .collect(Collectors.toList());
        return ResponseEntity.ok(statuses);
    }

    @GetMapping("/search/vivier")
    public ResponseEntity<List<Candidate>> searchVivierCandidates(
            @RequestParam(required = false) String searchText,
            @RequestParam(required = false) String searchCriteria,
            @RequestParam(required = false) Integer minExperience,
            @RequestParam(required = false) Integer maxExperience) {

        try {
            List<Candidate> candidates = service.searchVivierCandidates(searchText, searchCriteria, minExperience, maxExperience);
            return ResponseEntity.ok(candidates);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
