package tn.talan.backendapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import tn.talan.backendapp.entity.candidat;
import tn.talan.backendapp.entity.recrutement;
import tn.talan.backendapp.service.recrutementService;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/recrutements")
@CrossOrigin(origins = "*")
public class recrutementController {

    private final recrutementService service;

    @Autowired
    public recrutementController(recrutementService service) {
        this.service = service;
    }

    @GetMapping
    public List<recrutement> getAll() {
        return service.getAll();
    }

    @GetMapping("/search")
    public List<recrutement> search(
            @RequestParam Long demandeurId,
            @RequestParam Long responsableId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date date) {
        return service.searchByDemandeurAndResponsableAndDate(demandeurId, responsableId, date);
    }

    @GetMapping("/candidats/responsable/{id}")
    public List<candidat> getCandidatsByResponsable(@PathVariable Long id) {
        return service.getCandidatsByResponsable(id);
    }

    @GetMapping("/recrutements/date")
    public List<recrutement> getRecrutementsByDate(@RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date date) {
        return service.getRecrutementsByDate(date);
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
