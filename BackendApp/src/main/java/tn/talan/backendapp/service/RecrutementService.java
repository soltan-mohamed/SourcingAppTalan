package tn.talan.backendapp.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.talan.backendapp.entity.Candidate;
import tn.talan.backendapp.entity.Recrutement;
import tn.talan.backendapp.entity.User;
import tn.talan.backendapp.enums.Role;
import tn.talan.backendapp.enums.StatutRecrutement;
import tn.talan.backendapp.exceptions.ResourceNotFoundException;
import tn.talan.backendapp.exceptions.UnauthorizedAccessException;
import tn.talan.backendapp.repository.CandidateRepository;
import tn.talan.backendapp.repository.RecrutementRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import tn.talan.backendapp.repository.UserRepository;

import java.util.List;

@Service
@Transactional
public class RecrutementService {

    private final RecrutementRepository recrutementRepository;
    private final CandidateRepository candidateRepository;
    private final UserRepository userRepository;


    public RecrutementService(RecrutementRepository recrutementRepository,
                              CandidateRepository candidateRepository, UserRepository userRepository) {
        this.recrutementRepository = recrutementRepository;
        this.candidateRepository = candidateRepository;
        this.userRepository = userRepository;
    }

    public Recrutement createRecrutement(Long candidateId, String position, Long managerId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + candidateId));

        User currentUser = getCurrentUser();

        User manager = userRepository.findById(Math.toIntExact(managerId))
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found with id: " + managerId));

        // Verify the user is actually a manager using the new method
        if (!userRepository.findByRolesContaining(Role.MANAGER).contains(manager)) {
            throw new IllegalArgumentException("The selected user is not a manager");
        }

        Recrutement recrutement = new Recrutement();
        recrutement.setPosition(position);
        recrutement.setStatut(StatutRecrutement.IN_PROGRESS);
        recrutement.setDemandeur(currentUser);
        recrutement.setManager(manager);
        recrutement.setCandidate(candidate);

        return recrutementRepository.save(recrutement);
    }

    public List<Recrutement> getRecrutementsByCandidate(Long candidateId) {
        return recrutementRepository.findByCandidateId(candidateId);
    }

    public Recrutement updateRecrutementStatus(Long recrutementId, StatutRecrutement newStatus) {
        Recrutement recrutement = recrutementRepository.findById(recrutementId)
                .orElseThrow(() -> new ResourceNotFoundException("Recrutement not found with id: " + recrutementId));

        recrutement.setStatut(newStatus);
        return recrutementRepository.save(recrutement);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }
        throw new UnauthorizedAccessException("User not authenticated");
    }
}