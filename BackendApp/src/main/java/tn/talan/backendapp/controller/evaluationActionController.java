package tn.talan.backendapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import tn.talan.backendapp.entity.evaluationAction;
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
    public List<evaluationAction> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public evaluationAction getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/scheduled/evaluateur/{id}")
    public List<evaluationAction> getScheduledByEvaluateur(@PathVariable Long id) {
        return service.getScheduledEvaluationsByUserId(id);
    }


    @PostMapping
    public evaluationAction create(@RequestBody evaluationAction e) {
        return service.save(e);
    }

    @PutMapping("/{id}")
    public evaluationAction update(@PathVariable Long id, @RequestBody evaluationAction e) {
        return service.update(id, e);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
