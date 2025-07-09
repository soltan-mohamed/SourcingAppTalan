package tn.talan.backendapp.service;

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
public class EvaluationService {

    private final EvaluationRepository evaluationRepo;
    private final RecrutementRepository recrutementRepo;
    private final UserRepository userRepo;

    public EvaluationService(EvaluationRepository evaluationRepo,
                             RecrutementRepository recrutementRepo,
                             UserRepository userRepo) {
        this.evaluationRepo = evaluationRepo;
        this.recrutementRepo = recrutementRepo;
        this.userRepo = userRepo;
    }

    public Evaluation createEvaluation(Long recrutementId, Evaluation evaluation) {
        User currentUser = getCurrentUser();

        if (!currentUser.getRoles().contains(Role.RECRUTEUR_MANAGER  )) {
            throw new UnauthorizedAccessException("Only recruteurs can create evaluations");
        }

        Recrutement recrutement = recrutementRepo.findById(recrutementId)
                .orElseThrow(() -> new ResourceNotFoundException("Recruitment not found"));

        evaluation.setRecrutement(recrutement);
        evaluation.setEvaluateur(currentUser);
        evaluation.setDate(LocalDateTime.now());
        evaluation.setStatut(Statut.IN_PROGRESS);

        return evaluationRepo.save(evaluation);
    }

    public Evaluation updateEvaluation(Long evaluationId, Evaluation evaluationDetails) {
        Evaluation evaluation = evaluationRepo.findById(evaluationId)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluation not found"));

        User currentUser = getCurrentUser();
        if (!canEditEvaluation(currentUser, evaluation)) {
            throw new UnauthorizedAccessException("You don't have permission to edit this evaluation");
        }

        if (evaluationDetails.getDescription() != null) {
            evaluation.setDescription(evaluationDetails.getDescription());
        }
        if (evaluationDetails.getType() != null) {
            evaluation.setType(evaluationDetails.getType());
        }
        if (evaluationDetails.getStatut() != null) {
            evaluation.setStatut(evaluationDetails.getStatut());
        }

        return evaluationRepo.save(evaluation);
    }

    public List<Evaluation> getEvaluationsByRecrutement(Long recrutementId) {
        return evaluationRepo.findByRecrutementId(recrutementId);
    }

    public List<Evaluation> getEvaluationsByEvaluateur() {
        User currentUser = getCurrentUser();
        return evaluationRepo.findByEvaluateurId(currentUser.getId());
    }

    public void deleteEvaluation(Long evaluationId) {
        Evaluation evaluation = evaluationRepo.findById(evaluationId)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluation not found"));

        User currentUser = getCurrentUser();
        if (!canEditEvaluation(currentUser, evaluation)) {
            throw new UnauthorizedAccessException("You don't have permission to delete this evaluation");
        }

        evaluationRepo.delete(evaluation);
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