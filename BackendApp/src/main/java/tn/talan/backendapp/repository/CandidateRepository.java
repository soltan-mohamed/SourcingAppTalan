package tn.talan.backendapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.talan.backendapp.entity.Candidate;
import tn.talan.backendapp.enums.Statut;

import java.util.List;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    boolean existsByEmail(String email);
    List<Candidate> findByStatut(Statut statut);
    List<Candidate> findByCvIsNotNull();
}