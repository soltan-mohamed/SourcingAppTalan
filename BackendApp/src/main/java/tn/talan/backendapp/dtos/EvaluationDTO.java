package tn.talan.backendapp.dtos;

import tn.talan.backendapp.entity.User;
import tn.talan.backendapp.enums.Statut;
import tn.talan.backendapp.enums.TypeEvaluation;

import java.time.LocalDateTime;

public class EvaluationDTO {
    private Long id;
    private TypeEvaluation type;
    private Statut statut;
    private LocalDateTime date;
    private String description;
    private User evaluateur;
    private String evaluatorName;
    private String candidateName;
    private Long candidateId;
    private String position ;
    private String LieuEvaluation;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIdCandidate() { return candidateId; }
    public void setIdCandidate(Long candidateId) { this.candidateId = candidateId; }

    public TypeEvaluation getType() { return type; }
    public void setType(TypeEvaluation type) { this.type = type; }

    public Statut getStatut() { return statut; }
    public void setStatut(Statut statut) { this.statut = statut; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public User getEvaluateur() { return evaluateur; }
    public void setEvaluateur(User evaluateurFullName) { this.evaluateur = evaluateur; }

    public String getEvaluatorName() { return evaluatorName; }
    public void setEvaluatorName(String name) { this.evaluatorName = name; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String name) { this.candidateName = name; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public String getLieuEvaluation() { return LieuEvaluation; }
    public void setLieuEvaluation(String LieuEvaluation) { this.LieuEvaluation = LieuEvaluation; }


}

