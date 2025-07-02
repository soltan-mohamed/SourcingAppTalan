package tn.talan.backendapp.controller;

import org.springframework.format.annotation.DateTimeFormat;
import tn.talan.backendapp.entity.Candidat;
import tn.talan.backendapp.service.CandidatService;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/candidats")
@CrossOrigin(origins = "*")
public class CandidatController {
    private final CandidatService service;

    public CandidatController(CandidatService service) {
        this.service = service;
    }

    @GetMapping
    public List<Candidat> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Candidat getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/date")
    public List<Candidat> getCandidatsByDate(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date date) {
        return service.getCandidatsByDate(date);
    }

    @PostMapping
    public Candidat create(@RequestBody Candidat candidat) {
        return service.save(candidat);
    }

    @PutMapping("/{id}")
    public Candidat update(@PathVariable Long id, @RequestBody Candidat candidat) {
        return service.update(id, candidat);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
