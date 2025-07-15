package tn.talan.backendapp.controller;

import org.springframework.format.annotation.DateTimeFormat;
import tn.talan.backendapp.dtos.CandidateUpdateDTO;
import tn.talan.backendapp.entity.Candidate;
import tn.talan.backendapp.entity.User;
import tn.talan.backendapp.repository.UserRepository;
import tn.talan.backendapp.service.AuthenticationService;
import tn.talan.backendapp.service.CandidateService;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/candidats")
public class CandidateController {

    private final CandidateService service;
    private final AuthenticationService authService;
    private final UserRepository userRepository;

    public CandidateController(CandidateService service, AuthenticationService authService, UserRepository userRepository ) {
        this.authService = authService;
        this.service = service;
        this.userRepository = userRepository;
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
    public Candidate create(@RequestBody Candidate candidate) {
        String email = authService.getCurrentUsername(); // get from token
        System.out.println("Username is : "+ email + "\n");
        User responsable = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        candidate.setResponsable(responsable);
        return service.save(candidate);

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