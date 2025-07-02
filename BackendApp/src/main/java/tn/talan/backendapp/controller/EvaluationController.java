package tn.talan.backendapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import tn.talan.backendapp.entity.Evaluation;
import tn.talan.backendapp.service.evaluationActionService;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/evaluations")
@CrossOrigin(origins = "*")
public class evaluationActionController {
    private final evaluationActionService service;


    @Autowired
    public evaluationActionController(evaluationActionService service) {
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

    @GetMapping("/scheduled/evaluateur/{id}")
    public List<Evaluation> getScheduledByEvaluateur(@PathVariable Long id) {
        return service.getScheduledEvaluationsByUserId(id);
    }

    @GetMapping("/date")
    public List<Evaluation> getEvaluationActionsByDate(@RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date date) {
        return service.getEvaluationActionsByDate(date);
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
