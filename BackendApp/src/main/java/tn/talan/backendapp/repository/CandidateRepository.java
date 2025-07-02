package tn.talan.backendapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.talan.backendapp.entity.Candidate;

import java.util.Date;
import java.util.List;


@Repository

public interface CandidateRepository extends JpaRepository<Candidate,Long> {
}
