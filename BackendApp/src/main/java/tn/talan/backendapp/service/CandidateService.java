package tn.talan.backendapp.service;

import tn.talan.backendapp.dtos.CandidateDTO;
import tn.talan.backendapp.entity.Candidate;
import tn.talan.backendapp.enums.Statut;
import tn.talan.backendapp.repository.CandidateRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class CandidateService {
    private final CandidateRepository repository;

    public CandidateService(CandidateRepository repository) {
        this.repository = repository;
    }

    public List<Candidate> getAll() {
        return repository.findAll();
    }

    public Candidate getById(Long id) {
        return repository.findById(id).orElse(null);
    }


    public Candidate save(Candidate c) {
        return repository.save(c);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public Candidate update(Long id, Candidate updated) {
        Candidate c = repository.findById(id).orElse(null);
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
    public Candidate updateFromDTO(Long id, CandidateDTO dto) {
        Candidate candidate = getById(id); // méthode qui fetch depuis DB

        candidate.setNom(dto.getNom());
        candidate.setPrenom(dto.getPrenom());
        candidate.setEmail(dto.getEmail());
        candidate.setTelephone(dto.getTelephone());
        candidate.setCv(dto.getCv());
        candidate.setStatut(dto.getStatut());

        candidate.setSkills(dto.getSkills());

        return repository.save(candidate);
    }

}

