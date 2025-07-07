package tn.talan.backendapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.talan.backendapp.entity.Candidate;
import tn.talan.backendapp.enums.Statut;

import java.util.Date;
import java.util.List;


@Repository

public interface CandidateRepository extends JpaRepository<Candidate,Long> {

    List<Candidate> findByStatutNotIn(List<Statut> statuts);
    List<Candidate> findByStatutIsNot(Statut statut);
}
