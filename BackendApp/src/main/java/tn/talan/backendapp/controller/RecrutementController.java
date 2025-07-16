package tn.talan.backendapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import tn.talan.backendapp.dtos.createRecrutementDTO;
import tn.talan.backendapp.entity.Candidate;
import tn.talan.backendapp.entity.Recrutement;
import tn.talan.backendapp.entity.User;
import tn.talan.backendapp.enums.Statut;
import tn.talan.backendapp.enums.StatutRecrutement;
import tn.talan.backendapp.repository.CandidateRepository;
import tn.talan.backendapp.repository.UserRepository;
import tn.talan.backendapp.service.AuthenticationService;
import tn.talan.backendapp.service.RecrutementService;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/recrutements")
public class RecrutementController {

    private final RecrutementService service;
    private final AuthenticationService authService;
    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;

    @Autowired
    public RecrutementController(RecrutementService service, AuthenticationService authService, UserRepository userRepository, CandidateRepository candidateRepository) {
        this.service = service;
        this.authService = authService;
        this.userRepository = userRepository;
        this.candidateRepository = candidateRepository;
    }

    @GetMapping
    public List<Recrutement> getAll() {
        return service.getAll();
    }



    @GetMapping("/{id}")
    public Recrutement getById(@PathVariable Long id) {
        return service.getById(id);
    }


    @PutMapping("/{id}")
    public Recrutement update(@PathVariable Long id, @RequestBody Recrutement r) {
        return service.update(id, r);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}