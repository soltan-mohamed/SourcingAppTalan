package tn.talan.backendapp.dtos;

import tn.talan.backendapp.enums.Statut;
import java.util.List;

public class CandidateDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private Statut statut;
    private List<String> skills;
    private String cvPath;


    private Long responsableId;  // Add this field

    // Add getter and setter
    public Long getResponsableId() {
        return responsableId;
    }

    public void setResponsableId(Long responsableId) {
        this.responsableId = responsableId;
    }


    // Constructors
    public CandidateDTO() {}

    public CandidateDTO(Long id, String nom, String prenom, String email,
                        String telephone, Statut statut, List<String> skills, String cvPath) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.telephone = telephone;
        this.statut = statut;
        this.skills = skills;
        this.cvPath = cvPath;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public Statut getStatut() { return statut; }
    public void setStatut(Statut statut) { this.statut = statut; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public String getCvPath() { return cvPath; }
    public void setCvPath(String cvPath) { this.cvPath = cvPath; }
}