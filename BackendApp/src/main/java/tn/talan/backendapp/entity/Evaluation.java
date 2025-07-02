package tn.talan.backendapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import tn.talan.backendapp.enums.statut;
import tn.talan.backendapp.enums.typeEvaluation;

import java.util.Date;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class evaluationAction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;

    private Date date;

    @Enumerated(EnumType.STRING)
    private typeEvaluation type;

    @Enumerated(EnumType.STRING)
    private statut statut;

    @ManyToOne
    @JoinColumn(name = "evaluateur_id")
    @JsonIgnoreProperties({"recrutementsResponsable", "recrutementsDemandeur"})
    private Utilisateur evaluateur;

    @ManyToOne
    @JoinColumn(name = "recrutement_id")
    @JsonIgnoreProperties({"candidat", "responsable", "demandeur"})
    private Recrutement recrutement;
}
