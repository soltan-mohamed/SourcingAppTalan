package tn.talan.backendapp.controller;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import tn.talan.backendapp.dtos.CandidateCreationResponse;
import tn.talan.backendapp.dtos.CandidateUpdateDTO;
import tn.talan.backendapp.dtos.CreateCandidatDTO;
import tn.talan.backendapp.dtos.createRecrutementDTO;
import tn.talan.backendapp.entity.Candidate;
import tn.talan.backendapp.entity.User;
import tn.talan.backendapp.repository.RecrutementRepository;
import tn.talan.backendapp.repository.UserRepository;
import tn.talan.backendapp.service.AuthenticationService;
import tn.talan.backendapp.service.CandidateService;
import org.springframework.web.bind.annotation.*;
import tn.talan.backendapp.service.FileStorageService;
import tn.talan.backendapp.service.RecrutementService;
import tn.talan.backendapp.entity.Recrutement;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/candidats")
public class CandidateController {

    private final CandidateService service;
    private final AuthenticationService authService;
    private final UserRepository userRepository;
    private final RecrutementService recrutementService;
    private final FileStorageService fileStorageService;


    public CandidateController(CandidateService service, AuthenticationService authService, UserRepository userRepository, RecrutementService recrutementService, FileStorageService fileStorageService) {
        this.authService = authService;
        this.service = service;
        this.userRepository = userRepository;
        this.recrutementService = recrutementService;
        this.fileStorageService = fileStorageService;

    }

    @PostMapping("/{id}/upload-cv")
    public ResponseEntity<?> uploadCv(
            @PathVariable Long id,
            @RequestParam("cv") MultipartFile file) {
        try {
            String fileName = fileStorageService.storeFile(file);
            String filePath = "/uploads/" + fileName;
            Map<String, Object> response = service.uploadCv(id, filePath);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to store file", "details", e.getMessage()));
        }
    }

    @GetMapping
    public List<Candidate> getAll() {
        return service.getAll();
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
    public Candidate update(@PathVariable Long id, @RequestBody CandidateUpdateDTO candidate) {
        return service.updateCandidate(id, candidate);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
