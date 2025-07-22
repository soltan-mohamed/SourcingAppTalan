package tn.talan.backendapp.service;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.talan.backendapp.dtos.EvaluationDTO;
import tn.talan.backendapp.dtos.EvaluationUpdateDTO;
import tn.talan.backendapp.entity.Candidate;
import tn.talan.backendapp.entity.Evaluation;
import tn.talan.backendapp.entity.Recrutement;
import tn.talan.backendapp.entity.User;
import tn.talan.backendapp.enums.TypeEvaluation;
import tn.talan.backendapp.repository.EvaluationRepository;
import tn.talan.backendapp.repository.RecrutementRepository;
import tn.talan.backendapp.repository.UserRepository;

import tn.talan.backendapp.dtos.createEvaluationDTO;
import tn.talan.backendapp.enums.Statut;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EvaluationService {
    private final EvaluationRepository repository;
    private final RecrutementRepository recrutementRepo;
    private final UserRepository userRepo;

    @Autowired
    public EvaluationService(EvaluationRepository repository, RecrutementRepository recrutementRepo, UserRepository userRepo) {
        this.repository = repository;
        this.recrutementRepo = recrutementRepo;
        this.userRepo = userRepo;
    }

    public List<Evaluation> getAll() {
        return repository.findAll();
    }

    public Evaluation getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public List<EvaluationDTO> getMyInterviews(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Evaluation> evaluations = repository.findByEvaluateur(user);

        // Convertir la liste d'entités en liste de DTOs
        return evaluations.stream()
                .map(this::convertToDto) // Utiliser une méthode de conversion
                .collect(Collectors.toList());
    }

    private EvaluationDTO convertToDto(Evaluation evaluation) {
        EvaluationDTO dto = new EvaluationDTO();
        dto.setId(evaluation.getId());
        dto.setDate(evaluation.getDate());
        dto.setType(evaluation.getType()); // Assurez-vous que c'est une chaîne
        dto.setStatut(evaluation.getStatut());

        // Accéder aux objets liés pour obtenir les informations
        dto.setEvaluatorName(evaluation.getEvaluateur().getFullName());
        Candidate c = evaluation.getRecrutement().getCandidate();
        dto.setCandidateName(c.getPrenom() + " " + c.getNom()); // EXEMPLE : dépend de votre entité Recrutement
        dto.setPosition(evaluation.getRecrutement().getPosition());   // EXEMPLE : dépend de votre entité Recrutement

        return dto;
    }

    public Evaluation save(createEvaluationDTO e) {

        Recrutement recrutement = recrutementRepo.findById(e.getRecrutement_id())
                .orElseThrow( () -> new RuntimeException("Recrutement with id "+e.getRecrutement_id()+" not found: " ) );

        Candidate candidat = recrutement.getCandidate();
        candidat.setStatut(e.getStatut());

        User evaluateur = userRepo.findById(e.getEvaluateur_id())
                .orElseThrow( () -> new RuntimeException("User with id "+e.getEvaluateur_id()+" not found: " ) );

        Evaluation evaluation = new Evaluation(e.getDescription(), e.getDate(), e.getType(), e.getStatut(), evaluateur, recrutement);


        return repository.save(evaluation);
    }

    public Evaluation update(Long id, EvaluationUpdateDTO dto) {
        Evaluation e = repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Evaluation not found"));

        e.setDescription(dto.getDescription());
        e.setType(dto.getType());
        e.setStatut(dto.getStatut());

        if (dto.getDate() != null) {
            e.setDate(dto.getDate()); // ⚠️ attention au format
        }

        return repository.save(e);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}