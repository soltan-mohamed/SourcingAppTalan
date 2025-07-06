package tn.talan.backendapp.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import tn.talan.backendapp.entity.Recrutement;
import tn.talan.backendapp.enums.StatutRecrutement;
import tn.talan.backendapp.exceptions.ResourceNotFoundException;
import tn.talan.backendapp.exceptions.UnauthorizedAccessException;
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

    @PostMapping("/candidate/{candidateId}")
    public ResponseEntity<?> createRecrutement(
            @PathVariable Long candidateId,
            @RequestBody Map<String, Object> request) {
        try {
            String position = (String) request.get("position");
            Long managerId = parseLong(request.get("managerId"));

            Recrutement created = recrutementService.createRecrutement(
                    candidateId, position, managerId);
            return ResponseEntity.ok(created);
        } catch (NumberFormatException e) {
            return badRequest("Invalid manager ID format");
        } catch (IllegalArgumentException | IllegalStateException e) {
            return badRequest(e.getMessage());
        } catch (UnauthorizedAccessException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return serverError(e.getMessage());
        }
    }

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<Recrutement>> getRecrutementsForCandidate(
            @PathVariable Long candidateId) {
        List<Recrutement> recrutements = recrutementService.getRecrutementsByCandidate(candidateId);
        return ResponseEntity.ok(recrutements);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam StatutRecrutement status) {
        try {
            Recrutement updated = recrutementService.updateRecrutementStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (UnauthorizedAccessException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRecrutement(@PathVariable Long id) {
        try {
            recrutementService.deleteRecrutement(id);
            return ResponseEntity.noContent().build();
        } catch (UnauthorizedAccessException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    private Long parseLong(Object value) {
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        return Long.parseLong(value.toString());
    }

    private ResponseEntity<String> badRequest(String message) {
        return ResponseEntity.badRequest().body(message);
    }

    private ResponseEntity<String> serverError(String message) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(message);
    }
}