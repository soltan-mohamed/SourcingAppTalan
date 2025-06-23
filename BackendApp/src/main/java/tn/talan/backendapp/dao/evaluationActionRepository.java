package tn.talan.backendapp.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.talan.backendapp.entity.evaluationAction;

public interface evaluationActionRepository extends JpaRepository<evaluationAction, Long> {
}
