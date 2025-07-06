package tn.talan.backendapp.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.talan.backendapp.entity.*;
import tn.talan.backendapp.enums.*;
import tn.talan.backendapp.exceptions.*;
import tn.talan.backendapp.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

@Service
@Transactional
public class RecrutementService {

    private final RecrutementRepository recrutementRepo;
    private final CandidateRepository candidateRepo;
    private final UserRepository userRepo;

    public RecrutementService(RecrutementRepository recrutementRepo,
                              CandidateRepository candidateRepo,
                              UserRepository userRepo) {
        this.recrutementRepo = recrutementRepo;
        this.candidateRepo = candidateRepo;
        this.userRepo = userRepo;
    }

    // RecrutementService.java
    public Recrutement createRecrutement(Long candidateId, String position, Long managerId) {
        User currentUser = getCurrentUser();

        // 1. Verify recruiter role
        if (!currentUser.getRoles().contains(Role.RECRUTEUR)) {
            throw new UnauthorizedAccessException("Only recruiters can initiate recruitment");
        }

        Candidate candidate = candidateRepo.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));

        // 2. Verify current user is the candidate's owner
        if (!candidate.getResponsable().getId().equals(currentUser.getId())) {
            throw new UnauthorizedAccessException("You can only recruit your own candidates");
        }

        // 3. Validate candidate status
        if (!List.of(Statut.CONTACTED, Statut.SCHEDULED, Statut.VIVIER).contains(candidate.getStatut())) {
            throw new IllegalStateException("Candidate must be in CONTACTED, SCHEDULED or VIVIER status");
        }

        User manager = userRepo.findById(Math.toIntExact(managerId))
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));

        if (!manager.getRoles().contains(Role.MANAGER)) {
            throw new IllegalArgumentException("Selected user is not a manager");
        }

        Recrutement recrutement = new Recrutement();
        recrutement.setPosition(position);
        recrutement.setStatut(StatutRecrutement.IN_PROGRESS);
        recrutement.setRecruteur(currentUser); // Set current user as recruiter
        recrutement.setManager(manager);
        recrutement.setCandidate(candidate);

        return recrutementRepo.save(recrutement);
    }
    public Recrutement updateRecrutementStatus(Long recrutementId, StatutRecrutement newStatus) {
        Recrutement recrutement = getRecrutementById(recrutementId);
        User currentUser = getCurrentUser();

        if (!recrutement.isEditable(currentUser)) {
            throw new UnauthorizedAccessException("Not authorized to update this recruitment");
        }

        recrutement.setStatut(newStatus);
        return recrutementRepo.save(recrutement);
    }

    public List<Recrutement> getRecrutementsByCandidate(Long candidateId) {
        User currentUser = getCurrentUser();
        List<Recrutement> recrutements = recrutementRepo.findByCandidateId(candidateId);

        recrutements.forEach(r ->
                r.setEditable(r.isEditable(currentUser))
        );

        return recrutements;
    }

    public void deleteRecrutement(Long recrutementId) {
        Recrutement recrutement = getRecrutementById(recrutementId);
        User currentUser = getCurrentUser();

        if (!recrutement.getRecruteur().getId().equals(currentUser.getId())) {
            throw new UnauthorizedAccessException("Only the initiating recruiter can delete");
        }

        recrutementRepo.delete(recrutement);
    }

    private Recrutement getRecrutementById(Long id) {
        return recrutementRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recruitment not found"));
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User) {
            return (User) auth.getPrincipal();
        }
        throw new UnauthorizedAccessException("User not authenticated");
    }
}