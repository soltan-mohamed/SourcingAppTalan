package tn.talan.backendapp.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.talan.backendapp.entity.candidat;

import java.util.Date;
import java.util.List;

public interface candidatRepository extends JpaRepository<candidat,Long> {
    List<candidat> findByDate(Date date);
}
