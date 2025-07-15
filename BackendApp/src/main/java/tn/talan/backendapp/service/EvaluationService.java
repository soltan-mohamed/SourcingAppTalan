package tn.talan.backendapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
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

    public Evaluation save(createEvaluationDTO e) {

        Recrutement recrutement = recrutementRepo.findById(e.getRecrutement_id())
                .orElseThrow( () -> new RuntimeException("Recrutement with id "+e.getRecrutement_id()+" not found: " ) );

        User evaluateur = userRepo.findById(e.getEvaluateur_id())
                .orElseThrow( () -> new RuntimeException("User with id "+e.getEvaluateur_id()+" not found: " ) );

        Evaluation evaluation = new Evaluation(e.getDescription(), e.getDate(), e.getType(), e.getStatut(), evaluateur, recrutement);
        return repository.save(evaluation);
    }

    public Evaluation update(Long id, Evaluation updated) {
        Evaluation e = repository.findById(id).orElse(null);
        if (e != null) {
            e.setDate(updated.getDate());
            e.setType(updated.getType());
            e.setDescription(updated.getDescription());
            e.setEvaluateur(updated.getEvaluateur());
            e.setRecrutement(updated.getRecrutement());
            e.setStatut(updated.getStatut());
            return repository.save(e);
        }
        return null;
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
