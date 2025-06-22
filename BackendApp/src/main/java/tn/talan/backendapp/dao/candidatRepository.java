package tn.talan.backendapp.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.talan.backendapp.entity.candidat;

public interface candidatRepository extends JpaRepository<candidat,Long> {
}
