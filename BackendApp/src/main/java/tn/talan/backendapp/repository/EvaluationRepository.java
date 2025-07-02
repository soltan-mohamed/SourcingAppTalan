package tn.talan.backendapp.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.talan.backendapp.entity.Evaluation;
import tn.talan.backendapp.enums.Statut;

import java.util.Date;
import java.util.List;

public interface evaluationActionRepository extends JpaRepository<Evaluation, Long> {
    List<Evaluation> findByStatutAndEvaluateur_Id(Statut statut, Long evaluateurId);
    List<Evaluation> findByDate(Date date);

}
