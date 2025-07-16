package tn.talan.backendapp.dtos;

import java.util.List;

public class RecrutementDTO {
    private Long id;
    private String position;
    private List<EvaluationDTO> evaluations;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public List<EvaluationDTO> getEvaluations() { return evaluations; }
    public void setEvaluations(List<EvaluationDTO> evaluations) { this.evaluations = evaluations; }
}
