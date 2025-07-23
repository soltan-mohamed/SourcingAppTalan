package tn.talan.backendapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import tn.talan.backendapp.dtos.createRecrutementDTO;
import tn.talan.backendapp.entity.Candidate;
import tn.talan.backendapp.entity.Recrutement;
import tn.talan.backendapp.entity.User;
import tn.talan.backendapp.enums.Statut;
import tn.talan.backendapp.enums.StatutRecrutement;
import tn.talan.backendapp.repository.CandidateRepository;
import tn.talan.backendapp.repository.RecrutementRepository;
import tn.talan.backendapp.repository.UserRepository;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecrutementService {
    @Autowired
    private final RecrutementRepository repository;

    @Autowired
    private final UserRepository userRepository;

    @Autowired
    private final CandidateRepository candidateRepository;

    @Autowired
    private final AuthenticationService authService;


    public RecrutementService(RecrutementRepository repository , UserRepository userRepository , CandidateRepository candidateRepository, AuthenticationService authService) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.candidateRepository = candidateRepository;
        this.authService = authService;
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

    public Recrutement create(createRecrutementDTO recrutementDTO, Candidate candidate) {
        String email = authService.getCurrentUsername();
        User responsable = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        Long demandeurId = recrutementDTO.getDemandeur_id().longValue();
        User demandeur = userRepository.findById(demandeurId)
                .orElseThrow(() -> new RuntimeException("Demandeur not found: " + email));

//        Candidate candidate = recrutementDTO.getCandidate();

        //Updating correspondant candidate status and recruiter for each new recruitement
        candidate.setResponsable(responsable);
        candidate.setStatut(Statut.IN_PROGRESS);
        candidateRepository.save(candidate);

        Recrutement recrutement = new Recrutement(recrutementDTO.getPosition(), StatutRecrutement.IN_PROGRESS,demandeur,candidate);

        return repository.save(recrutement);
    }

}
