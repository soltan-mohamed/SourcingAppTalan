package tn.talan.backendapp.dtos;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.Setter;
import tn.talan.backendapp.entity.Candidate;

import java.util.List;

@Getter
@Setter
public class CreateRecrutementDTO_2 {

    private String position;
    private Integer demandeur_id;
    private Long candidate_id;

    public CreateRecrutementDTO_2() {
    }

    public CreateRecrutementDTO_2(String position, Integer demandeur_id, Long candidate_id) {
        this.position = position;
        this.demandeur_id = demandeur_id;
        this.candidate_id = candidate_id;
    }
}
