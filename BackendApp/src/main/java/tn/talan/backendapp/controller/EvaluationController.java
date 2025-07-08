package tn.talan.backendapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import tn.talan.backendapp.entity.Evaluation;
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



    @PostMapping
    public Evaluation create(@RequestBody Evaluation e) {
        return service.save(e);
    }

    @PutMapping("/{id}")
    public Evaluation update(@PathVariable Long id, @RequestBody Evaluation e) {
        return service.update(id, e);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
