package tn.talan.backendapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tn.talan.backendapp.dtos.EvaluationDTO;
import tn.talan.backendapp.dtos.EvaluationUpdateDTO;
import tn.talan.backendapp.entity.Evaluation;
import tn.talan.backendapp.dtos.createEvaluationDTO;
import tn.talan.backendapp.service.EvaluationService;


import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;


@RestController
@RequestMapping("/api/evaluations")
public class EvaluationController {

    private final EvaluationService service;

    @Autowired
    public EvaluationController(EvaluationService service) {
        this.service = service;
    }

    @GetMapping
    public List<Evaluation> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Evaluation getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/my-interviews")
    public List<EvaluationDTO> getMyInterviews(Authentication authentication) {
        String email = authentication.getName(); // Comes from the JWT
        return service.getMyInterviews(email);
    }


    @PostMapping
    public Evaluation create(@RequestBody createEvaluationDTO e) {
        return service.save(e);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EvaluationDTO> updateEvaluation(
            @PathVariable Long id,
            @RequestBody EvaluationUpdateDTO dto
    ) {
        EvaluationDTO updated = service.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}