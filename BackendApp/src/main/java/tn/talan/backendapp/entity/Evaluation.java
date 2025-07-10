package tn.talan.backendapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonInclude(JsonInclude.Include.NON_NULL)  // Only include if not null
    private User evaluateur;

    @JsonProperty("evaluateur")
    public User getEvaluateur() {
        return this.evaluateur;
    }

    @ManyToOne
    @JoinColumn(name = "recruteur_id", nullable = false) // Add this
    private User recruteur;

    @ManyToOne
    @JoinColumn(name = "recrutement_id")
    private Recrutement recrutement;
}
