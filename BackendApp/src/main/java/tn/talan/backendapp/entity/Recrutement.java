package tn.talan.backendapp.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import tn.talan.backendapp.enums.StatutRecrutement;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "recrutement")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Recrutement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "position", nullable = false)
    private String position;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutRecrutement statut;

    @ManyToOne
    @JoinColumn(name = "demandeur_id")
    private User demandeur;

    @ManyToOne
    @JoinColumn(name = "candidate_id")
    @JsonBackReference
    private Candidate candidate;

    @OneToMany(mappedBy = "recrutement", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Evaluation> evaluations = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "date", nullable = false, updatable = false)
    private LocalDate date;

    public Recrutement(String position, StatutRecrutement statut, User demandeur, Candidate candidate) {
        this.position = position;
        this.statut = statut;
        this.demandeur = demandeur;
        this.candidate = candidate;
    }
}