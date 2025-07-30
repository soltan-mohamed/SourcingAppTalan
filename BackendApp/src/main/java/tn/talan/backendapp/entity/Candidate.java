package tn.talan.backendapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import tn.talan.backendapp.enums.Statut;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "candidate")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "nom", nullable = false)
    private String nom;

    @Column(name = "prenom", nullable = false)
    private String prenom;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "telephone", nullable = false)
    private String telephone;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut")
    private Statut statut;

    @CreationTimestamp
    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDate dateCreation;

    @Column(name = "hiring_date", nullable = true)
    private LocalDate hiringDate;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "candidate_skills", joinColumns = @JoinColumn(name = "candidate_id"))
    @Column(name = "skill")
    private List<String> skills = new ArrayList<>();

    @Lob
    @JsonIgnore //avoid large payloads
    @Column(name = "cv", columnDefinition = "LONGBLOB")
    private byte[] cvData;

    @Column(name = "cv_filename")
    private String cvFilename;

    @Column(name = "cv_file_size")
    private Long cvFileSize;

    @ManyToOne
    @JoinColumn(name = "responsable_id")
    private User responsable;

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Recrutement> recrutements;

    @Transient
    private String experiencePeriod;


    public String getExperiencePeriod() {
        if (hiringDate == null) {
            return "0-1 year";
        }

        LocalDate currentDate = LocalDate.now();
        Period period = Period.between(hiringDate, currentDate);

        int years = period.getYears();
        int months = period.getMonths();

        if (years == 0) {
            if (months == 0) {
                return "0-1 year";
            } else if (months < 12) {
                return months + " month" + (months > 1 ? "s" : "");
            }
        }

        if (years > 0 && months > 0) {
            return years + " year" + (years > 1 ? "s" : "") + " " + months + " month" + (months > 1 ? "s" : "");
        } else {
            return years + " year" + (years > 1 ? "s" : "");
        }
    }


    public double getExperienceInYears() {
        if (hiringDate == null) {
            return 0.5;
        }

        LocalDate currentDate = LocalDate.now();
        Period period = Period.between(hiringDate, currentDate);

        return period.getYears() + (period.getMonths() / 12.0);
    }
}
