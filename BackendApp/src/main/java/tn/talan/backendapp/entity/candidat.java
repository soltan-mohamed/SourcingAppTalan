package tn.talan.backendapp.entity;
import jakarta.persistence.*;
import tn.talan.backendapp.enums.statut;

import lombok.Data;

@Entity
@Table(name="candidat")
@Data
public class candidat {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String competences;
    private String poste;
    private String cvPath;
    private String profilePhotoPath;

    @Enumerated(EnumType.STRING)
    private statut statut;



}
