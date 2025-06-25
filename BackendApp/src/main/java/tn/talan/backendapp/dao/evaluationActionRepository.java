package tn.talan.backendapp.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.talan.backendapp.entity.evaluationAction;
import tn.talan.backendapp.enums.statut;

import java.util.Date;
import java.util.List;

public interface evaluationActionRepository extends JpaRepository<evaluationAction, Long> {
    List<evaluationAction> findByStatutAndEvaluateur_Id(statut statut, Long evaluateurId);

}
