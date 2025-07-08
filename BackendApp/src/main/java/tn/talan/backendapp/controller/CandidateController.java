package tn.talan.backendapp.controller;

import jakarta.transaction.Transactional;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;
import tn.talan.backendapp.entity.Candidate;
import tn.talan.backendapp.entity.User;
import tn.talan.backendapp.enums.Statut;
import tn.talan.backendapp.service.CandidateService;
import tn.talan.backendapp.service.UserService;
import org.springframework.web.bind.annotation.*;
import tn.talan.backendapp.repository.UserRepository;

import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/candidats")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class CandidateController {
    private final CandidateService service;
    private final UserService userService;

    public CandidateController(CandidateService service,UserService userService) {
        this.service = service;
        this.userService = userService;
    }

    @GetMapping
    @Transactional
    public List<Candidate> getAll() {

        List<Candidate> candidats = service.getAll();

        candidats.forEach(c -> c.getSkills().size());

        return candidats;
    }

    @GetMapping("/{id}")
    public Candidate getById(@PathVariable Long id) {
        return service.getById(id);
    }



    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Candidate> create(@RequestBody Map<String, Object> payload, Authentication authentication) {
        Candidate candidate = new Candidate();
        candidate.setNom((String) payload.get("nom"));
        candidate.setPrenom((String) payload.get("prenom"));
        candidate.setEmail((String) payload.get("email"));
        candidate.setTelephone((String) payload.get("telephone"));
        candidate.setStatut(Statut.valueOf((String) payload.get("statut")));

        // skills is a list of strings
        List<String> skills = (List<String>) payload.get("skills");
        candidate.setSkills(skills);

        candidate.setCv((String) payload.get("cv"));

        String userEmail = authentication.getName();
        User responsable = userService.findByEmail(userEmail);
        candidate.setResponsable(responsable);

        Candidate saved = service.save(candidate);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public Candidate update(@PathVariable Long id, @RequestBody Candidate candidate) {
        return service.update(id, candidate);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
