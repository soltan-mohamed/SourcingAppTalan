package tn.talan.backendapp.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import tn.talan.backendapp.dtos.CandidateUpdateDTO;
import tn.talan.backendapp.entity.Candidate;
import tn.talan.backendapp.enums.Statut;
import tn.talan.backendapp.repository.CandidateRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
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

    public List<Candidate> getAllNotVivierCandidates() {
        //List<Statut> excludedStatuts = Arrays.asList(Statut.REJECTED);
        List<Candidate> candidates = repository.findByStatutIsNot(Statut.VIVIER);
        if (candidates.isEmpty()) {
            return null;
        }
        else return candidates;
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

    @Transactional
    public Candidate updateCandidate(Long id, CandidateUpdateDTO dto) {
        Candidate candidate = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Candidate not found"));

        if (dto.getNom() != null) {
            candidate.setNom(dto.getNom());
        }
        if (dto.getPrenom() != null) {
            candidate.setPrenom(dto.getPrenom());
        }
        if (dto.getEmail() != null) {
            candidate.setEmail(dto.getEmail());
        }
        if (dto.getTelephone() != null) {
            candidate.setTelephone(dto.getTelephone());
        }
        if (dto.getCv() != null) {
            candidate.setCv(dto.getCv());
        }
        if (dto.getSkills() != null) {
            candidate.setSkills(dto.getSkills());
        }

        return candidate;
    }
}

