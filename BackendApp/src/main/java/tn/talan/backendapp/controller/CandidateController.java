package tn.talan.backendapp.controller;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
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
import tn.talan.backendapp.service.RecrutementService;
import tn.talan.backendapp.entity.Recrutement;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/candidats")
public class CandidateController {

    private final CandidateService service;
    private final AuthenticationService authService;
    private final UserRepository userRepository;
    private final RecrutementService recrutementService;

    public CandidateController(CandidateService service, AuthenticationService authService, UserRepository userRepository, RecrutementService recrutementService) {
        this.authService = authService;
        this.service = service;
        this.userRepository = userRepository;
        this.recrutementService = recrutementService;
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


//    @PostMapping
//    public Candidate create(@RequestBody Candidate candidate) {
//        String email = authService.getCurrentUsername(); // get from token
//        System.out.println("Username is : "+ email + "\n");
//        User responsable = userRepository.findByEmail(email)
//                .orElseThrow(() -> new RuntimeException("User not found: " + email));
//        candidate.setResponsable(responsable);
//        return service.save(candidate);
//
//    }

    @GetMapping("/not-vivier")
    public List<Candidate> getAllNotVivier() {
        return service.getAllNotVivierCandidates();
    }

//    @PutMapping("/{id}")
//    public Candidate update(@PathVariable Long id, @RequestBody Candidate candidate) {
//        return service.update(id, candidate);
//    }

    @PutMapping("/{id}")
    public Candidate update(@PathVariable Long id, @RequestBody CandidateUpdateDTO candidate) {
        return service.updateCandidate(id, candidate);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}

/*package tn.talan.backendapp.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.talan.backendapp.entity.Candidate;
import tn.talan.backendapp.enums.Statut;
import tn.talan.backendapp.exceptions.ResourceNotFoundException;
import tn.talan.backendapp.exceptions.UnauthorizedAccessException;
import tn.talan.backendapp.service.CandidateService;
import tn.talan.backendapp.service.FileStorageService;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/candidates")
@CrossOrigin(origins = "*")
public class CandidateController {

    private final CandidateService candidateService;
    private final FileStorageService fileStorageService;

    public CandidateController(CandidateService candidateService,
                               FileStorageService fileStorageService) {
        this.candidateService = candidateService;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping
    public ResponseEntity<List<Candidate>> getAllCandidates() {
        List<Candidate> candidates = candidateService.getAllCandidates();
        return ResponseEntity.ok(candidates);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Candidate> getCandidateById(@PathVariable Long id) {
        Candidate candidate = candidateService.getCandidateById(id);
        return ResponseEntity.ok(candidate);
    }

    @PostMapping
    public ResponseEntity<Candidate> createCandidate(@RequestBody Candidate candidate) {
        Candidate createdCandidate = candidateService.createCandidate(candidate);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCandidate);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Candidate> updateCandidate(
            @PathVariable Long id,
            @RequestBody Candidate candidateDetails) {
        Candidate updatedCandidate = candidateService.updateCandidate(id, candidateDetails);
        return ResponseEntity.ok(updatedCandidate);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCandidate(@PathVariable Long id) {
        candidateService.deleteCandidate(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Candidate>> getCandidatesByStatus(
            @PathVariable("status") String status) {
        List<Candidate> candidates = candidateService.getCandidatesByStatus(Statut.valueOf(status));
        return ResponseEntity.ok(candidates);
    }

    @PostMapping("/{id}/upload-cv")
    public ResponseEntity<?> uploadCv(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            String fileName = fileStorageService.storeFile(file);
            String filePath = "/uploads/" + fileName;
            Map<String, Object> response = candidateService.uploadCv(id, filePath);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to store file", "details", e.getMessage()));
        }
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<String> handleResourceNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    @ExceptionHandler(UnauthorizedAccessException.class)
    public ResponseEntity<String> handleUnauthorizedAccess(UnauthorizedAccessException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
    }
}*/