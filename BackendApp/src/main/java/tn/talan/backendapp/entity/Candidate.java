package tn.talan.backendapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import tn.talan.backendapp.enums.Statut;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "candidate")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // Add this line
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "nom", nullable = false)
    private String nom;

    @Column(name = "prenom", nullable = false)
    private String prenom;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "telephone", nullable = false)
    private String telephone;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut")
    private Statut statut;

    @ElementCollection(fetch = FetchType.LAZY) // Explicitly set to LAZY (optional)
    @CollectionTable(name = "candidate_skills", joinColumns = @JoinColumn(name = "candidate_id"))
    @Column(name = "skill")
    @JsonIgnore // Add this to prevent serialization of skills in this endpoint
    private List<String> skills = new ArrayList<>();

    @Column(name = "cv")
    private String cv;

    @ManyToOne
    @JoinColumn(name = "responsable_id")
    private User responsable;

    @JsonIgnore // Add this to prevent serialization of skills in this endpoint
    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Recrutement> recrutements;
}