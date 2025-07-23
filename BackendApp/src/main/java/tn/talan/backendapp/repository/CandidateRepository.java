package tn.talan.backendapp.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.talan.backendapp.entity.Candidate;
import tn.talan.backendapp.enums.Statut;

import java.time.LocalDate;
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

    // New methods for experience-based queries
    @Query("SELECT c FROM Candidate c WHERE c.hiringDate IS NULL")
    List<Candidate> findCandidatesWithoutExperience();

    @Query("SELECT c FROM Candidate c WHERE c.hiringDate IS NOT NULL AND c.hiringDate <= :dateThreshold")
    List<Candidate> findCandidatesWithExperienceGreaterThan(@Param("dateThreshold") LocalDate dateThreshold);

    @Query("SELECT c FROM Candidate c WHERE c.hiringDate IS NOT NULL AND c.hiringDate > :dateThreshold")
    List<Candidate> findCandidatesWithExperienceLessThan(@Param("dateThreshold") LocalDate dateThreshold);
}
