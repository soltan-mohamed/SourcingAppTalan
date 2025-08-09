package tn.talan.backendapp.dtos;

import tn.talan.backendapp.enums.Statut;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class CandidateUpdateDTO {
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private List<String> skills;
    private Statut statut;
    private LocalDate hiringDate;
    private List<RecrutementUpdateDTO> recrutements;
}
