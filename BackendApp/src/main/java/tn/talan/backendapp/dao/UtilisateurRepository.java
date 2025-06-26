package tn.talan.backendapp.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.talan.backendapp.entity.Utilisateur;

public interface UtilisateurRepository extends JpaRepository<Utilisateur,Long> {
}
