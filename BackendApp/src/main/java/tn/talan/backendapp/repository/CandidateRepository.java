package tn.talan.backendapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.talan.backendapp.entity.Candidate;
import tn.talan.backendapp.entity.User;
import tn.talan.backendapp.enums.Statut;

import java.util.List;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    boolean existsByEmail(String email);

    List<Candidate> findByStatut(Statut statut);

    List<Candidate> findByCvIsNotNull();

    // Find candidates by responsable ID
    List<Candidate> findByResponsableId(Long responsableId);

    // Find candidates by status and responsable ID
    List<Candidate> findByStatutAndResponsableId(Statut statut, Long responsableId);

    // Find candidates by email (for validation)
    Candidate findByEmail(String email);

    // Find candidates by responsable
    List<Candidate> findByResponsable(User responsable);

    // Check if candidate exists with email and not the given ID (for update validation)
    boolean existsByEmailAndIdNot(String email, Long id);

    // Find candidates with CV by responsable
    List<Candidate> findByCvIsNotNullAndResponsableId(Long responsableId);

    // Count candidates by status and responsable
    long countByStatutAndResponsableId(Statut statut, Long responsableId);

    // Count all candidates by responsable
    long countByResponsableId(Long responsableId);
}