package tn.talan.backendapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import tn.talan.backendapp.dtos.CandidateDTO;
import tn.talan.backendapp.entity.Candidate;
import tn.talan.backendapp.entity.User;
import tn.talan.backendapp.repository.CandidateRepository;
import tn.talan.backendapp.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CandidateService {
    private final CandidateRepository repository;
    @Autowired
    private UserRepository userRepository;


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
        if (dto.getResponsable() != null && dto.getResponsable().getId() != null) {
            User responsable = userRepository.findById(dto.getResponsable().getId())
                    .orElseThrow(() -> new RuntimeException("Responsable not found"));
            candidate.setResponsable(responsable);
        } else {
            candidate.setResponsable(null); // si on veut pouvoir l'annuler
        }


        return repository.save(candidate);
    }



}

