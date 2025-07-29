package tn.talan.backendapp.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.talan.backendapp.entity.Candidate;
import tn.talan.backendapp.entity.User;
import tn.talan.backendapp.enums.Statut;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate,Long> {
    @Query("SELECT DISTINCT c FROM Candidate c LEFT JOIN FETCH c.recrutements")
    List<Candidate> fetchAllWithRecrutements();

    List<Candidate> findByStatutIn(List<Statut> statuts);
    List<Candidate> findByStatutIsNot(Statut statut);

    List<Candidate> findByStatutNotIn(List<Statut> statuts);


    @Query("SELECT DISTINCT c FROM Candidate c " +
            "LEFT JOIN  Recrutement r ON c = r.candidate  " +
            "LEFT JOIN  Evaluation e ON e.recrutement = r " +
            "WHERE (e.evaluateur = :user OR c.responsable = :user) AND r.statut = 'IN_PROGRESS' AND ( c.statut = 'CONTACTED' OR c.statut = 'IN_PROGRESS' )")
    List<Candidate> findByEvaluateur(User user);

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

    // NEW SEARCH METHODS
    @Query("SELECT DISTINCT c FROM Candidate c LEFT JOIN FETCH c.recrutements r " +
            "WHERE (:searchText IS NULL OR :searchCriteria IS NULL OR " +
            "(LOCATE('name', :searchCriteria) > 0 AND LOWER(CONCAT(c.prenom, ' ', c.nom)) LIKE LOWER(CONCAT('%', :searchText, '%'))) OR " +
            "(LOCATE('email', :searchCriteria) > 0 AND LOWER(c.email) LIKE LOWER(CONCAT('%', :searchText, '%'))) OR " +
            "(LOCATE('phone', :searchCriteria) > 0 AND LOWER(c.telephone) LIKE LOWER(CONCAT('%', :searchText, '%'))) OR " +
            "(LOCATE('position', :searchCriteria) > 0 AND LOWER(r.position) LIKE LOWER(CONCAT('%', :searchText, '%')))) " +
            "AND (:statut IS NULL OR c.statut = :statut) " +
            "AND (:minExperience IS NULL OR :maxExperience IS NULL OR " +
            "(:minExperience = 0 AND :maxExperience = 1 AND (c.hiringDate IS NULL OR c.hiringDate > :maxExperienceDate)) OR " +
            "(:minExperience > 0 AND c.hiringDate IS NOT NULL AND c.hiringDate <= :minExperienceDate AND " +
            "(:maxExperience IS NULL OR c.hiringDate >= :maxExperienceDate)))")
    List<Candidate> searchCandidates(
            @Param("searchText") String searchText,
            @Param("searchCriteria") String searchCriteria,
            @Param("statut") Statut statut,
            @Param("minExperience") Integer minExperience,
            @Param("maxExperience") Integer maxExperience,
            @Param("minExperienceDate") LocalDate minExperienceDate,
            @Param("maxExperienceDate") LocalDate maxExperienceDate
    );

    @Query("SELECT DISTINCT c FROM Candidate c LEFT JOIN FETCH c.recrutements r " +
            "WHERE c.statut != 'VIVIER' " +
            "AND (:searchText IS NULL OR :searchCriteria IS NULL OR " +
            "(LOCATE('name', :searchCriteria) > 0 AND LOWER(CONCAT(c.prenom, ' ', c.nom)) LIKE LOWER(CONCAT('%', :searchText, '%'))) OR " +
            "(LOCATE('email', :searchCriteria) > 0 AND LOWER(c.email) LIKE LOWER(CONCAT('%', :searchText, '%'))) OR " +
            "(LOCATE('phone', :searchCriteria) > 0 AND LOWER(c.telephone) LIKE LOWER(CONCAT('%', :searchText, '%'))) OR " +
            "(LOCATE('position', :searchCriteria) > 0 AND LOWER(r.position) LIKE LOWER(CONCAT('%', :searchText, '%')))) " +
            "AND (:statut IS NULL OR c.statut = :statut) " +
            "AND (:minExperience IS NULL OR :maxExperience IS NULL OR " +
            "(:minExperience = 0 AND :maxExperience = 1 AND (c.hiringDate IS NULL OR c.hiringDate > :maxExperienceDate)) OR " +
            "(:minExperience > 0 AND c.hiringDate IS NOT NULL AND c.hiringDate <= :minExperienceDate AND " +
            "(:maxExperience IS NULL OR c.hiringDate >= :maxExperienceDate)))")
    List<Candidate> searchNonVivierCandidates(
            @Param("searchText") String searchText,
            @Param("searchCriteria") String searchCriteria,
            @Param("statut") Statut statut,
            @Param("minExperience") Integer minExperience,
            @Param("maxExperience") Integer maxExperience,
            @Param("minExperienceDate") LocalDate minExperienceDate,
            @Param("maxExperienceDate") LocalDate maxExperienceDate
    );

    @Query("SELECT DISTINCT c FROM Candidate c LEFT JOIN FETCH c.recrutements r " +
            "WHERE c.statut = 'VIVIER' " +
            "AND (:searchText IS NULL OR :searchCriteria IS NULL OR " +
            "(LOCATE('name', :searchCriteria) > 0 AND LOWER(CONCAT(c.prenom, ' ', c.nom)) LIKE LOWER(CONCAT('%', :searchText, '%'))) OR " +
            "(LOCATE('email', :searchCriteria) > 0 AND LOWER(c.email) LIKE LOWER(CONCAT('%', :searchText, '%'))) OR " +
            "(LOCATE('phone', :searchCriteria) > 0 AND LOWER(c.telephone) LIKE LOWER(CONCAT('%', :searchText, '%'))) OR " +
            "(LOCATE('position', :searchCriteria) > 0 AND LOWER(r.position) LIKE LOWER(CONCAT('%', :searchText, '%'))) OR " +
            "(LOCATE('skills', :searchCriteria) > 0 AND EXISTS (SELECT 1 FROM c.skills s WHERE LOWER(s) LIKE LOWER(CONCAT('%', :searchText, '%'))))) " +
            "AND (:minExperience IS NULL OR :maxExperience IS NULL OR " +
            "(:minExperience = 0 AND :maxExperience = 1 AND (c.hiringDate IS NULL OR c.hiringDate > :maxExperienceDate)) OR " +
            "(:minExperience > 0 AND c.hiringDate IS NOT NULL AND c.hiringDate <= :minExperienceDate AND " +
            "(:maxExperience IS NULL OR c.hiringDate >= :maxExperienceDate)))")
    List<Candidate> searchVivierCandidates(
            @Param("searchText") String searchText,
            @Param("searchCriteria") String searchCriteria,
            @Param("minExperience") Integer minExperience,
            @Param("maxExperience") Integer maxExperience,
            @Param("minExperienceDate") LocalDate minExperienceDate,
            @Param("maxExperienceDate") LocalDate maxExperienceDate
    );
}