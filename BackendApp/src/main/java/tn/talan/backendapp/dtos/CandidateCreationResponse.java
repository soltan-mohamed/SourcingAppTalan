package tn.talan.backendapp.dtos;

import lombok.Getter;
import lombok.Setter;
import tn.talan.backendapp.entity.Candidate;
import tn.talan.backendapp.entity.Recrutement;

@Getter
@Setter
public class CandidateCreationResponse {
    private Candidate candidate;
    private Recrutement recrutement;

    public CandidateCreationResponse(Candidate candidate, Recrutement recrutement) {
        this.candidate = candidate;
        this.recrutement = recrutement;
    }

}
