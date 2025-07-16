package tn.talan.backendapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.talan.backendapp.entity.Evaluation;
import tn.talan.backendapp.enums.Statut;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;


@Repository

public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {


}