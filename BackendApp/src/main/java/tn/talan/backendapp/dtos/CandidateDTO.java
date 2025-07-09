package tn.talan.backendapp.dtos;

import lombok.Data;
import tn.talan.backendapp.entity.User;
import tn.talan.backendapp.enums.Statut;

import java.util.List;

@Data
public class CandidateDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private Statut statut;
    private List<String> skills;
    private String cv;
    private User responsable;

}
