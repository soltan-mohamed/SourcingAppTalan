package tn.talan.backendapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.talan.backendapp.entity.Evaluation;
import tn.talan.backendapp.enums.Role;
import tn.talan.backendapp.enums.Statut;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;


@Repository

public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {

    @Query("SELECT e FROM Evaluation e JOIN FETCH e.evaluateur WHERE e.recrutement.id = :recrutementId")
    List<Evaluation> findByRecrutementId(@Param("recrutementId") Long recrutementId);


    List<Evaluation> findByEvaluateurId(Integer evaluateurId);

    @Query("SELECT e FROM Evaluation e WHERE e.evaluateur.id = :evaluateurId AND :role MEMBER OF e.evaluateur.roles")
    List<Evaluation> findByEvaluateurIdAndEvaluateurRole(
            @Param("evaluateurId") Integer evaluateurId,  // Use Integer instead of Long
            @Param("role") Role role
    );
    // Find evaluations where evaluator has EVALUATEUR role
    @Query("SELECT e FROM Evaluation e JOIN e.evaluateur u WHERE :role MEMBER OF u.roles")
    List<Evaluation> findByEvaluateurRole(@Param("role") Role role);

    // Find evaluations assigned by current RECRUTEUR_MANAGER to EVALUATEURs
    @Query("SELECT e FROM Evaluation e JOIN e.evaluateur u WHERE e.recruteur.id = :recruteurId AND :role MEMBER OF u.roles")
    List<Evaluation> findByRecruteurIdAndEvaluateurRole(
            @Param("recruteurId") Long recruteurId,
            @Param("role") Role role
    );


}
