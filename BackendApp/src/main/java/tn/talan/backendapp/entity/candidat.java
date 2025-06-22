package tn.talan.backendapp.entity;
import jakarta.persistence.*;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import tn.talan.backendapp.enums.statut;


@Entity
@Table(name="candidat")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
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



}
