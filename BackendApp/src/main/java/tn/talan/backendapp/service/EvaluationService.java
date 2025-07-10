package tn.talan.backendapp.service;

import jakarta.persistence.EntityManager;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.talan.backendapp.entity.*;
import tn.talan.backendapp.enums.*;
import tn.talan.backendapp.exceptions.*;
import tn.talan.backendapp.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
@Slf4j
public class EvaluationService {

    private final EvaluationRepository evaluationRepo;
    private final RecrutementRepository recrutementRepo;
    private final UserRepository userRepo;
    private final CandidateRepository candidateRepo;


    public EvaluationService(EvaluationRepository evaluationRepo,
                             RecrutementRepository recrutementRepo,
                             UserRepository userRepo,
                             CandidateRepository candidateRepo) {
        this.evaluationRepo = evaluationRepo;
        this.recrutementRepo = recrutementRepo;
        this.userRepo = userRepo;
        this.candidateRepo = candidateRepo;
    }

    public Evaluation createEvaluation(Long recrutementId, Evaluation evaluation) {
        User currentUser = getCurrentUser();
        Recrutement recrutement = recrutementRepo.findById(recrutementId)
                .orElseThrow(() -> new ResourceNotFoundException("Recruitment not found"));

        // Check permissions
        if (!currentUser.getRoles().contains(Role.RECRUTEUR_MANAGER) &&
                !recrutement.getRecruteur().getId().equals(currentUser.getId())) {
            throw new UnauthorizedAccessException("Not authorized to create evaluation");
        }

        // Get and validate evaluator
        User selectedEvaluator = userRepo.findById(evaluation.getEvaluateur().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Evaluator not found"));

        if (!selectedEvaluator.getRoles().contains(Role.EVALUATEUR)) {
            throw new IllegalArgumentException("Selected user must have EVALUATEUR role");
        }

        // Set evaluation details
        evaluation.setRecrutement(recrutement);
        evaluation.setEvaluateur(selectedEvaluator);
        evaluation.setRecruteur(recrutement.getRecruteur());
        evaluation.setDate(LocalDateTime.now());
        evaluation.setStatut(Statut.SCHEDULED);

        // Save evaluation
        Evaluation savedEvaluation = evaluationRepo.save(evaluation);

        // Update candidate status to SCHEDULED
        if (recrutement.getCandidate() != null) {
            recrutement.getCandidate().setStatut(Statut.SCHEDULED);
            candidateRepo.save(recrutement.getCandidate());
        }

        return savedEvaluation;
    }

    public boolean updateCandidateStatus(Long recrutementId, String newStatus) {
        Recrutement recrutement = recrutementRepo.findById(recrutementId)
                .orElseThrow(() -> new ResourceNotFoundException("Recruitment not found"));

        if (recrutement.getCandidate() != null) {
            recrutement.getCandidate().setStatut(Statut.valueOf(newStatus));
            candidateRepo.save(recrutement.getCandidate());
            return true;
        }
        return false;
    }





    @Transactional
    public Evaluation updateEvaluation(Long evaluationId, Evaluation evaluationDetails) {
        Evaluation evaluation = evaluationRepo.findById(evaluationId)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluation not found"));

        User currentUser = getCurrentUser();
        if (!canEditEvaluation(currentUser, evaluation)) {
            throw new UnauthorizedAccessException("You don't have permission to edit this evaluation");
        }

        // Track if status is being changed
        boolean statusChanged = evaluationDetails.getStatut() != null &&
                !evaluationDetails.getStatut().equals(evaluation.getStatut());

        if (evaluationDetails.getDescription() != null) {
            evaluation.setDescription(evaluationDetails.getDescription());
        }
        if (evaluationDetails.getType() != null) {
            evaluation.setType(evaluationDetails.getType());
        }
        if (evaluationDetails.getStatut() != null) {
            evaluation.setStatut(evaluationDetails.getStatut());
        }

        Evaluation updatedEvaluation = evaluationRepo.save(evaluation);

        // Update candidate status if evaluation status changed
        if (statusChanged) {
            updateCandidateStatusFromEvaluation(updatedEvaluation);
        }

        return updatedEvaluation;
    }

    private void updateCandidateStatusFromEvaluation(Evaluation evaluation) {
        if (evaluation.getRecrutement() != null &&
                evaluation.getRecrutement().getCandidate() != null) {

            Candidate candidate = evaluation.getRecrutement().getCandidate();
            candidate.setStatut(evaluation.getStatut());
            candidateRepo.save(candidate);

            log.info("Updated candidate {} status to {} based on evaluation update",
                    candidate.getId(), evaluation.getStatut());
        }
    }

    @Transactional
    public void deleteEvaluation(Long evaluationId) {
        // 1. Verify exists and get evaluation
        Evaluation evaluation = evaluationRepo.findById(evaluationId)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluation not found"));

        // 2. Check permissions
        User currentUser = getCurrentUser();
        if (!canEditEvaluation(currentUser, evaluation)) {
            throw new UnauthorizedAccessException("Not authorized to delete evaluation");
        }

        // 3. Check evaluation status
        if (evaluation.getStatut() == Statut.SCHEDULED) {
            throw new IllegalStateException("Cannot delete SCHEDULED evaluation");
        }

        // 4. Delete using custom repository method
        evaluationRepo.customDeleteById(evaluationId);

        // 5. Verify deletion
        if (evaluationRepo.existsById(evaluationId)) {
            throw new RuntimeException("Failed to delete evaluation");
        }
    }



    public List<Evaluation> getEvaluationsByRecrutement(Long recrutementId) {
        return evaluationRepo.findByRecrutementId(recrutementId);
    }

    public List<Evaluation> getEvaluationsByEvaluateur() {
        User currentUser = getCurrentUser();

        if (currentUser.getRoles().contains(Role.RECRUTEUR_MANAGER)) {
            return evaluationRepo.findByRecruteurIdAndEvaluateurRole(
                    currentUser.getId().longValue(),  // Convert Integer to Long if needed
                    Role.EVALUATEUR
            );
        }
        else if (currentUser.getRoles().contains(Role.EVALUATEUR)) {
            return evaluationRepo.findByEvaluateurId(currentUser.getId());
        }
        throw new UnauthorizedAccessException("Unauthorized access to evaluations");
    }



    private boolean canEditEvaluation(User currentUser, Evaluation evaluation) {
        return currentUser.getRoles().contains(Role.RECRUTEUR_MANAGER) ||
                evaluation.getEvaluateur().getId().equals(currentUser.getId());
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User) {
            return (User) auth.getPrincipal();
        }
        throw new UnauthorizedAccessException("User not authenticated");
    }
}