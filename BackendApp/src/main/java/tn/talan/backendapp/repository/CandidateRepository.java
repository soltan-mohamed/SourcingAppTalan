package tn.talan.backendapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.talan.backendapp.entity.Candidat;

import java.util.Date;
import java.util.List;


@Repository

public interface CandidatRepository extends JpaRepository<Candidat,Long> {
    List<Candidat> findByDate(Date date);
}
