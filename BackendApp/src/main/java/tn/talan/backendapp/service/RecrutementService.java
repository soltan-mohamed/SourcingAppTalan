package tn.talan.backendapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.talan.backendapp.entity.Candidate;
import tn.talan.backendapp.entity.Recrutement;
import tn.talan.backendapp.repository.RecrutementRepository;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecrutementService {
    @Autowired
    private final RecrutementRepository repository;


    public RecrutementService(RecrutementRepository repository) {
        this.repository = repository;
    }

    public List<Recrutement> getAll() {
        return repository.findAll();
    }

    public Recrutement getById(Long id) {
        return repository.findById(id).orElse(null);
    }




    public Recrutement save(Recrutement r) {
        return repository.save(r);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public Recrutement update(Long id, Recrutement updated) {
        Recrutement r = repository.findById(id).orElse(null);
        if (r != null) {
            r.setPosition(updated.getPosition());
            r.setDemandeur(updated.getDemandeur());
            r.setStatut(updated.getStatut());

            return repository.save(r);
        }
        return null;
    }
}
