package tn.talan.backendapp.service;

import tn.talan.backendapp.entity.candidat;
import tn.talan.backendapp.dao.candidatRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class candidatService {
    private final candidatRepository repository;

    public candidatService(candidatRepository repository) {
        this.repository = repository;
    }

    public List<candidat> getAll() {
        return repository.findAll();
    }

    public candidat getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public candidat save(candidat c) {
        return repository.save(c);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public candidat update(Long id, candidat updated) {
        candidat c = repository.findById(id).orElse(null);
        if (c != null) {
            c.setNom(updated.getNom());
            c.setPrenom(updated.getPrenom());
            c.setEmail(updated.getEmail());
            c.setTelephone(updated.getTelephone());
            c.setCompetences(updated.getCompetences());
            c.setCvPath(updated.getCvPath());
            c.setProfilePhotoPath(updated.getProfilePhotoPath());
            c.setStatut(updated.getStatut());
            c.setPoste(updated.getPoste());
            return repository.save(c);
        }
        return null;
    }
}

