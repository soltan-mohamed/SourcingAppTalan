package tn.talan.backendapp.dtos;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import tn.talan.backendapp.entity.Recrutement;
import tn.talan.backendapp.enums.Statut;
import tn.talan.backendapp.enums.TypeEvaluation;

import java.time.LocalDateTime;

public class createEvaluationDTO {

    private String description;

    private LocalDateTime date;

    private TypeEvaluation type;

    private Statut statut;

    private Long evaluateur_id;

    private Long recrutement_id;

    public createEvaluationDTO(String description, LocalDateTime date, Long recrutement_id, Long evaluateur_id, Statut statut, TypeEvaluation type) {
        this.description = description;
        this.date = date;
        this.recrutement_id = recrutement_id;
        this.evaluateur_id = evaluateur_id;
        this.statut = statut;
        this.type = type;
    }

    public createEvaluationDTO() {
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public TypeEvaluation getType() {
        return type;
    }

    public void setType(TypeEvaluation type) {
        this.type = type;
    }

    public Statut getStatut() {
        return statut;
    }

    public void setStatut(Statut statut) {
        this.statut = statut;
    }

    public Long getEvaluateur_id() {
        return evaluateur_id;
    }

    public void setEvaluateur_id(Long evaluateur_id) {
        this.evaluateur_id = evaluateur_id;
    }

    public Long getRecrutement_id() {
        return recrutement_id;
    }

    public void setRecrutement_id(Long recrutement_id) {
        this.recrutement_id = recrutement_id;
    }
}