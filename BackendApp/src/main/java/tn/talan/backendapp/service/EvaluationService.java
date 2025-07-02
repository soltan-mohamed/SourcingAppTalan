package tn.talan.backendapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.talan.backendapp.entity.Evaluation;
import tn.talan.backendapp.repository.EvaluationRepository;
import tn.talan.backendapp.enums.Statut;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Service
public class EvaluationService {
    private final EvaluationRepository repository;

    @Autowired
    public EvaluationService(EvaluationRepository repository) {
        this.repository = repository;
    }

    public List<Evaluation> getAll() {
        return repository.findAll();
    }

    public Evaluation getById(Long id) {
        return repository.findById(id).orElse(null);
    }




    public Evaluation save(Evaluation e) {
        return repository.save(e);
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
