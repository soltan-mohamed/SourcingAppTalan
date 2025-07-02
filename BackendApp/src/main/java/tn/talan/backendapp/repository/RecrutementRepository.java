package tn.talan.backendapp.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.talan.backendapp.entity.Recrutement;

import java.util.Date;
import java.util.List;

public interface recrutementRepository extends JpaRepository<Recrutement, Long> {
    List<Recrutement> findByDemandeur_IdAndResponsable_IdAndDate(Long demandeurId, Long responsableId, Date date);
    List<Recrutement> findByResponsable_Id(Long responsableId);
    List<Recrutement> findByDate(Date date);

}
