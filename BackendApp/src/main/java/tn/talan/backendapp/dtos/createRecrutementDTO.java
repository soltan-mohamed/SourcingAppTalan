package tn.talan.backendapp.dtos;

import java.util.List;

public class createRecrutementDTO {

    private String position;
    private Integer demandeur_id;
    private Long candidate_id;

    public createRecrutementDTO() {

    }

    public createRecrutementDTO(String position, Integer demandeur_id, Long candidate_id) {
        this.position = position;
        this.demandeur_id = demandeur_id;
        this.candidate_id = candidate_id;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public Integer getDemandeur_id() {
        return demandeur_id;
    }

    public void setDemandeur_id(Integer demandeur_id) {
        this.demandeur_id = demandeur_id;
    }

    public Long getCandidate_id() {
        return candidate_id;
    }

    public void setCandidate_id(Long candidate_id) {
        this.candidate_id = candidate_id;
    }
}
