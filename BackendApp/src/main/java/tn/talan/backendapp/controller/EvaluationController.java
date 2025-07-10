package tn.talan.backendapp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.talan.backendapp.entity.Evaluation;
import tn.talan.backendapp.service.EvaluationService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/evaluations")
public class EvaluationController {

    private final EvaluationService evaluationService;

    public EvaluationController(EvaluationService evaluationService) {
        this.evaluationService = evaluationService;
    }

    @PostMapping("/recrutement/{recrutementId}")
    public ResponseEntity<Evaluation> createEvaluation(
            @PathVariable Long recrutementId,
            @RequestBody Evaluation evaluation) {

        Evaluation createdEvaluation = evaluationService.createEvaluation(recrutementId, evaluation);
        return ResponseEntity.ok(createdEvaluation);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Evaluation> updateEvaluation(
            @PathVariable Long id,
            @RequestBody Evaluation evaluation) {
        return ResponseEntity.ok(evaluationService.updateEvaluation(id, evaluation));
    }

    @GetMapping("/recrutement/{recrutementId}")
    public ResponseEntity<List<Evaluation>> getEvaluationsByRecrutement(
            @PathVariable Long recrutementId) {
        return ResponseEntity.ok(evaluationService.getEvaluationsByRecrutement(recrutementId));
    }

    @GetMapping("/my-evaluations")
    public ResponseEntity<List<Evaluation>> getMyEvaluations() {
        return ResponseEntity.ok(evaluationService.getEvaluationsByEvaluateur());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvaluation(@PathVariable Long id) {
        try {
            evaluationService.deleteEvaluation(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            // Return the specific error message with 400 status
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            // Handle other exceptions
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}