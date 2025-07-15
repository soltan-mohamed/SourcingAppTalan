package tn.talan.backendapp.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import tn.talan.backendapp.enums.Statut;
import tn.talan.backendapp.enums.TypeEvaluation;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;

    private LocalDateTime date;

    @Enumerated(EnumType.STRING)
    private TypeEvaluation type;

    @Enumerated(EnumType.STRING)
    private Statut statut;

    @ManyToOne
    @JoinColumn(name = "evaluateur_id")
    private User evaluateur;

    @ManyToOne
    @JoinColumn(name = "recrutement_id")
    @JsonBackReference
    private Recrutement recrutement;

    public Evaluation(String description, LocalDateTime date, TypeEvaluation type, Statut statut, User evaluateur, Recrutement recrutement) {
        this.description = description;
        this.date = date;
        this.type = type;
        this.statut = statut;
        this.evaluateur = evaluateur;
        this.recrutement = recrutement;
    }
}
