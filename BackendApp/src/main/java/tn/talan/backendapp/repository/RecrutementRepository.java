
package tn.talan.backendapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.talan.backendapp.entity.Recrutement;
import tn.talan.backendapp.entity.User;

import java.util.Date;
import java.util.List;


@Repository

public interface RecrutementRepository extends JpaRepository<Recrutement, Long> {
    List<Recrutement> findByCandidate_Responsable(User responsable);

}
