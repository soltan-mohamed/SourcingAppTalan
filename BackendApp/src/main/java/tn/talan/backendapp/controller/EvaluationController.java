package tn.talan.backendapp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.talan.backendapp.entity.Evaluation;
import tn.talan.backendapp.service.EvaluationService;

import java.util.List;

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
        return ResponseEntity.ok(evaluationService.createEvaluation(recrutementId, evaluation));
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
    public ResponseEntity<Void> deleteEvaluation(@PathVariable Long id) {
        evaluationService.deleteEvaluation(id);
        return ResponseEntity.noContent().build();
    }
}