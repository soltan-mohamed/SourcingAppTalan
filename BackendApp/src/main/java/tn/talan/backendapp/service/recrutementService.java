package tn.talan.backendapp.service;

import org.springframework.stereotype.Service;
import tn.talan.backendapp.entity.recrutement;
import tn.talan.backendapp.dao.recrutementRepository;

import java.util.List;

@Service
public class recrutementService {
    private final recrutementRepository repository;

    public recrutementService(recrutementRepository repository) {
        this.repository = repository;
    }

    public List<recrutement> getAll() {
        return repository.findAll();
    }

    public recrutement getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public recrutement save(recrutement r) {
        return repository.save(r);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public recrutement update(Long id, recrutement updated) {
        recrutement r = repository.findById(id).orElse(null);
        if (r != null) {
            r.setSkills(updated.getSkills());
            r.setDate(updated.getDate());
            r.setCandidat(updated.getCandidat());
            r.setDemandeur(updated.getDemandeur());
            r.setResponsable(updated.getResponsable());
            return repository.save(r);
        }
        return null;
    }
}
