package tn.talan.backendapp.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tn.talan.backendapp.entity.Candidate;
import tn.talan.backendapp.enums.Statut;

import java.util.Date;
import java.util.List;


@Repository

public interface CandidateRepository extends JpaRepository<Candidate,Long> {
    @Query("SELECT DISTINCT c FROM Candidate c LEFT JOIN FETCH c.recrutements")
    List<Candidate> fetchAllWithRecrutements();

    List<Candidate> findByStatutNotIn(List<Statut> statuts);
    List<Candidate> findByStatutIsNot(Statut statut);

    List<Candidate> findByStatut(Statut statut);

    @Query("SELECT DISTINCT c FROM Candidate c LEFT JOIN FETCH c.recrutements WHERE c.statut != 'VIVIER'")
    List<Candidate> findNonVivierCandidates();

    @Query("SELECT DISTINCT c FROM Candidate c LEFT JOIN FETCH c.recrutements WHERE c.statut = 'VIVIER'")
    List<Candidate> findVivierCandidates();

}
