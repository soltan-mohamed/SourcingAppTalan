package tn.talan.backendapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import tn.talan.backendapp.enums.role;

import java.util.List;

@Entity
@Table(name = "user")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties({"recrutementsResponsable", "recrutementsDemandeur"})

public class user {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "nom")
    private String nom;

    @Column(name = "prenom")
    private String prenom;

    @Column(name = "email", unique = true)
    private String email;

    @Column(name = "password")
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private role role;

    @Column(name = "profile_cover_path")
    private String profileCoverPath;

    @Column(name = "profile_photo_path")
    private String profilePhotoPath;

    @OneToMany(mappedBy = "responsable")
    private List<recrutement> recrutementsResponsable;

    @OneToMany(mappedBy = "demandeur")
    private List<recrutement> recrutementsDemandeur;


}
