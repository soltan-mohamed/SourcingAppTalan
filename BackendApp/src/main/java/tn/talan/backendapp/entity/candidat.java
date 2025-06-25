package tn.talan.backendapp.entity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import tn.talan.backendapp.enums.statut;

import java.util.Date;
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
    @Column(name = "nom" , nullable = false)
    private String nom;
    @Column(name = "prenom", nullable = false)
    private String prenom;
    @Column(name = "email", unique = true, nullable = false)
    private String email;
    @Column(name = "telephone", nullable = false)
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

    @Temporal(TemporalType.DATE)
    @Column(name = "date_creation")
    private Date date = new Date();

    @OneToMany(mappedBy = "candidat")
    private List<recrutement> recrutements;




}
