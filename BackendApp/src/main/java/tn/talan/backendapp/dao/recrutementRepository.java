package tn.talan.backendapp.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.talan.backendapp.entity.recrutement;

import java.util.Date;
import java.util.List;

public interface recrutementRepository extends JpaRepository<recrutement, Long> {
    List<recrutement> findByDemandeur_IdAndResponsable_IdAndDate(Long demandeurId, Long responsableId, Date date);

}
