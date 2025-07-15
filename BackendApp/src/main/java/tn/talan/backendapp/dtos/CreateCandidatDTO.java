package tn.talan.backendapp.dtos;

import lombok.Getter;
import lombok.Setter;
import tn.talan.backendapp.entity.Candidate;

@Setter
@Getter
public class CreateCandidatDTO {
    private Candidate candidate;
    private createRecrutementDTO recruitment;

    public CreateCandidatDTO(Candidate candidate, createRecrutementDTO recruitment) {
        this.candidate = candidate;
        this.recruitment = recruitment;
    }

    public CreateCandidatDTO() {
    }
}
