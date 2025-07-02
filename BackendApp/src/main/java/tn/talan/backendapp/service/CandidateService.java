package tn.talan.backendapp.service;

import tn.talan.backendapp.entity.Candidat;
import tn.talan.backendapp.repository.CandidatRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class CandidatService {
    private final CandidatRepository repository;

    public CandidatService(CandidatRepository repository) {
        this.repository = repository;
    }

    public List<Candidat> getAll() {
        return repository.findAll();
    }

    public Candidat getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public List<Candidat> getCandidatsByDate(Date date) {
        return repository.findByDate(date);
    }
    public Candidat save(Candidat c) {
        return repository.save(c);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public Candidat update(Long id, Candidat updated) {
        Candidat c = repository.findById(id).orElse(null);
        if (c != null) {
            c.setNom(updated.getNom());
            c.setPrenom(updated.getPrenom());
            c.setEmail(updated.getEmail());
            c.setTelephone(updated.getTelephone());
            c.setSkills(updated.getSkills());
            c.setCv(updated.getCv());
            c.setStatut(updated.getStatut());
            return repository.save(c);
        }
        return null;
    }
}

