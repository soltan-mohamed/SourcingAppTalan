package tn.talan.backendapp.dtos;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.Setter;
import tn.talan.backendapp.entity.Candidate;

import java.util.List;

@Getter
@Setter
public class createRecrutementDTO {

    private String position;
    private Integer demandeur_id;
//    @JsonIgnore
//    private Candidate candidate;

    public createRecrutementDTO() {
    }

    public createRecrutementDTO(String position, Integer demandeur_id) {
        this.position = position;
        this.demandeur_id = demandeur_id;
        //this.candidate = candidate;
    }
}
