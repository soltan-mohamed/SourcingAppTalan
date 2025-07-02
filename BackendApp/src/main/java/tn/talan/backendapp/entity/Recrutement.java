package tn.talan.backendapp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import tn.talan.backendapp.enums.StatutRecrutement;

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
    private Candidate candidate;

    @OneToMany(mappedBy = "recrutement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Evaluation> evaluations = new ArrayList<>();
}
