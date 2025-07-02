package tn.talan.backendapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.talan.backendapp.entity.candidat;
import tn.talan.backendapp.entity.recrutement;
import tn.talan.backendapp.dao.recrutementRepository;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class recrutementService {
    @Autowired
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

    public List<recrutement> searchByDemandeurAndResponsableAndDate(Long demandeurId, Long responsableId, Date date) {
        return repository.findByDemandeur_IdAndResponsable_IdAndDate(demandeurId, responsableId, date);
    }

    public List<recrutement> getRecrutementsByDate(Date date) {
        return repository.findByDate(date);
    }

    public List<candidat> getCandidatsByResponsable(Long responsableId) {
        List<recrutement> recrutements = repository.findByResponsable_Id(responsableId);
        return recrutements.stream()
                .map(recrutement::getCandidat)
                .distinct()
                .collect(Collectors.toList());
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
