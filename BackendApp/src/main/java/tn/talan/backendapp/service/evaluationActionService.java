package tn.talan.backendapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.talan.backendapp.entity.evaluationAction;
import tn.talan.backendapp.dao.evaluationActionRepository;
import tn.talan.backendapp.enums.statut;

import java.util.Date;
import java.util.List;

@Service
public class evaluationActionService {
    private final evaluationActionRepository repository;

    @Autowired
    public evaluationActionService(evaluationActionRepository repository) {
        this.repository = repository;
    }

    public List<evaluationAction> getAll() {
        return repository.findAll();
    }

    public evaluationAction getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public List<evaluationAction> getEvaluationActionsByDate(Date date) {
        return repository.findByDate(date);
    }

    public List<evaluationAction> getScheduledEvaluationsByUserId(Long userId) {
        return repository.findByStatutAndEvaluateur_Id(statut.scheduled, userId);
    }


    public evaluationAction save(evaluationAction e) {
        return repository.save(e);
    }

    public evaluationAction update(Long id, evaluationAction updated) {
        evaluationAction e = repository.findById(id).orElse(null);
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
