package tn.talan.backendapp.controller;

import tn.talan.backendapp.entity.candidat;
import tn.talan.backendapp.service.candidatService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidats")
@CrossOrigin(origins = "*")
public class candidatController {
    private final candidatService service;

    public candidatController(candidatService service) {
        this.service = service;
    }

    @GetMapping
    public List<candidat> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public candidat getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public candidat create(@RequestBody candidat candidat) {
        return service.save(candidat);
    }

    @PutMapping("/{id}")
    public candidat update(@PathVariable Long id, @RequestBody candidat candidat) {
        return service.update(id, candidat);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
