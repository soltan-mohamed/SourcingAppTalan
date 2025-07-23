package tn.talan.backendapp.dtos;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import tn.talan.backendapp.entity.Recrutement;
import tn.talan.backendapp.enums.LieuEvaluation;
import tn.talan.backendapp.enums.Statut;
import tn.talan.backendapp.enums.TypeEvaluation;

import java.time.LocalDateTime;

@Getter
@Setter
public class createEvaluationDTO {

    private String description;

    private LocalDateTime date;

    private TypeEvaluation type;

    private Statut statut;

    private Long evaluateur_id;

    private Long recrutement_id;

    private LieuEvaluation lieuEvaluation;

    public createEvaluationDTO(String description, LocalDateTime date, Long recrutement_id, Long evaluateur_id, Statut statut, TypeEvaluation type, LieuEvaluation lieuEvaluation) {
        this.description = description;
        this.date = date;
        this.recrutement_id = recrutement_id;
        this.evaluateur_id = evaluateur_id;
        this.statut = statut;
        this.type = type;
        this.lieuEvaluation = lieuEvaluation;
    }

}