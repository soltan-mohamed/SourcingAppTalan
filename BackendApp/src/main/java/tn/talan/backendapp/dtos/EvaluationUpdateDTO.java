package tn.talan.backendapp.dtos;

import tn.talan.backendapp.enums.Statut;
import tn.talan.backendapp.enums.TypeEvaluation;

import java.time.LocalDateTime;

public class EvaluationUpdateDTO {
    private String description;
    private TypeEvaluation type;
    private Statut statut;
    private LocalDateTime date;

    // Getter et Setter pour description
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    // Getter et Setter pour type
    public TypeEvaluation getType() {
        return type;
    }

    public void setType(TypeEvaluation type) {
        this.type = type;
    }

    // Getter et Setter pour statut
    public Statut getStatut() {
        return statut;
    }

    public void setStatut(Statut statut) {
        this.statut = statut;
    }

    // Getter et Setter pour date
    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }
}
