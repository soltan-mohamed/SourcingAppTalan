package tn.talan.backendapp.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.talan.backendapp.entity.recrutement;

public interface recrutementRepository extends JpaRepository<recrutement, Long> {
}
