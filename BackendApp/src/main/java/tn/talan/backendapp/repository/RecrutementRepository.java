package tn.talan.backendapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.talan.backendapp.entity.Recrutement;
import java.util.List;

public interface RecrutementRepository extends JpaRepository<Recrutement, Long> {
    List<Recrutement> findByCandidateId(Long candidateId);
}