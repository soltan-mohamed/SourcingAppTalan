package tn.talan.backendapp.dtos;


import tn.talan.backendapp.enums.Statut;

import java.util.List;

public class CandidateUpdateDTO {

    private String nom ;
    private String prenom ;
    private String email ;
    private String telephone ;
    private List<String> skills;
    private String cv;
    private Statut statut;

    public CandidateUpdateDTO() {

    }

    public CandidateUpdateDTO(String nom, String prenom, String email, String telephone, List<String> skills, String cv, Statut statut) {
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.telephone = telephone;
        this.skills = skills;
        this.cv = cv;
        this.statut = statut;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public String getCv() {
        return cv;
    }

    public void setCv(String cv) {
        this.cv = cv;
    }

    public Statut getStatut() {
        return statut;
    }

    public void setStatut(Statut statut) {
        this.statut = statut;}
}
