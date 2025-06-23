package tn.talan.backendapp.controller;

import org.springframework.web.bind.annotation.*;
import tn.talan.backendapp.entity.recrutement;
import tn.talan.backendapp.service.recrutementService;

import java.util.List;

@RestController
@RequestMapping("/api/recrutements")
@CrossOrigin(origins = "*")
public class recrutementController {
    private final recrutementService service;

    public recrutementController(recrutementService service) {
        this.service = service;
    }

    @GetMapping
    public List<recrutement> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public recrutement getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public recrutement create(@RequestBody recrutement recrutement) {
        return service.save(recrutement);
    }

    @PutMapping("/{id}")
    public recrutement update(@PathVariable Long id, @RequestBody recrutement r) {
        return service.update(id, r);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
