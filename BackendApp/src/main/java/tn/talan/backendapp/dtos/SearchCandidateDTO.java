package tn.talan.backendapp.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SearchCandidateDTO {
    private String searchText;
    private String statut;
    private Integer minExperience;
    private Integer maxExperience;
}