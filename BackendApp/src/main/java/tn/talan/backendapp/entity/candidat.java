package tn.talan.backendapp.entity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import tn.talan.backendapp.enums.statut;

import java.util.List;


@Entity
@Table(name="candidat")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties({"recrutements"})


public class candidat {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;
    @Column(name = "nom")
    private String nom;
    @Column(name = "prenom")
    private String prenom;
    @Column(name = "email", unique = true)
    private String email;
    @Column(name = "telephone")
    private String telephone;
    @Column(name = "competences")
    private String competences;
    @Column(name = "poste")
    private String poste;
    @Column(name = "cv_path")
    private String cvPath;
    @Column(name = "profile_photo_path")
    private String profilePhotoPath;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut")
    private statut statut;

    @OneToMany(mappedBy = "candidat")
    private List<recrutement> recrutements;




}
