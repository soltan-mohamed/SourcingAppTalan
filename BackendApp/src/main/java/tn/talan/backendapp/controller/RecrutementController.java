package tn.talan.backendapp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.talan.backendapp.entity.Recrutement;
import tn.talan.backendapp.enums.StatutRecrutement;
import tn.talan.backendapp.service.RecrutementService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recrutements")
@CrossOrigin(origins = "*")
public class RecrutementController {

    private final RecrutementService recrutementService;

    public RecrutementController(RecrutementService recrutementService) {
        this.recrutementService = recrutementService;
    }

    // In RecrutementController.java
    @PostMapping("/candidate/{candidateId}")
    public ResponseEntity<Recrutement> createRecrutement(
            @PathVariable Long candidateId,
            @RequestBody Map<String, String> request) {
        String position = request.get("position");
        Long managerId = Long.parseLong(request.get("managerId"));
        Recrutement recrutement = recrutementService.createRecrutement(candidateId, position, managerId);
        return ResponseEntity.ok(recrutement);
    }

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<Recrutement>> getRecrutementsByCandidate(
            @PathVariable Long candidateId) {
        List<Recrutement> recrutements = recrutementService.getRecrutementsByCandidate(candidateId);
        return ResponseEntity.ok(recrutements);
    }

    @PutMapping("/{recrutementId}/status")
    public ResponseEntity<Recrutement> updateRecrutementStatus(
            @PathVariable Long recrutementId,
            @RequestParam StatutRecrutement newStatus) {
        Recrutement recrutement = recrutementService.updateRecrutementStatus(recrutementId, newStatus);
        return ResponseEntity.ok(recrutement);
    }
}