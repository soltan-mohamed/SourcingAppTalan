package tn.talan.backendapp.dtos;


import lombok.Getter;
import lombok.Setter;
import tn.talan.backendapp.enums.StatutRecrutement;


@Getter
@Setter
public class RecrutementStatusUpdateDTO {
    private Long id;
    private StatutRecrutement statut;

}
