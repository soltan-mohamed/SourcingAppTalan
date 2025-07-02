package tn.talan.backendapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import tn.talan.backendapp.entity.Candidate;
import tn.talan.backendapp.entity.Recrutement;
import tn.talan.backendapp.service.RecrutementService;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/recrutements")
@CrossOrigin(origins = "*")
public class RecrutementController {

    private final RecrutementService service;

    @Autowired
    public RecrutementController(RecrutementService service) {
        this.service = service;
    }

    @GetMapping
    public List<Recrutement> getAll() {
        return service.getAll();
    }



    @GetMapping("/{id}")
    public Recrutement getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public Recrutement create(@RequestBody Recrutement recrutement) {
        return service.save(recrutement);
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
