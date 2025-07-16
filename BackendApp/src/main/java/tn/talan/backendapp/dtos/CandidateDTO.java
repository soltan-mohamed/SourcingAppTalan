package tn.talan.backendapp.dtos;

import tn.talan.backendapp.entity.User;
import tn.talan.backendapp.enums.Statut;

import java.time.LocalDate;
import java.util.List;

public class CandidateDTO {

        private Long id;
        private String nom;
        private String prenom;
        private String email;
        private String telephone;
        private String cv;
        private Statut statut;
        private LocalDate dateCreation;
        private User responsable;

        private List<RecrutementDTO> recrutements;

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

        public String getCv() { return cv; }
        public void setCv(String cv) { this.cv = cv; }

        public Statut getStatut() { return statut; }
        public void setStatut(Statut statut) { this.statut = statut; }

        public LocalDate getDateCreation() { return dateCreation; }
        public void setDateCreation(LocalDate dateCreation) { this.dateCreation = dateCreation; }

        public User getResponsable() { return responsable; }
        public void setResponsable(User responsableFullName) { this.responsable = responsable; }

        public List<RecrutementDTO> getRecrutements() { return recrutements; }
        public void setRecrutements(List<RecrutementDTO> recrutements) { this.recrutements = recrutements; }
    }



