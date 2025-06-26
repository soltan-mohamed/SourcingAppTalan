package tn.talan.backendapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.Date;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
@Entity
@Table(name = "recrutement")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class recrutement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "skills")
    private String skills;

    @Temporal(TemporalType.DATE)
    private Date date;

    @ManyToOne
    @JoinColumn(name = "responsable_id")
    private Utilisateur responsable;

    @ManyToOne
    @JoinColumn(name = "demandeur_id")
    private Utilisateur demandeur;

    @ManyToOne
    @JoinColumn(name = "candidat_id")
    private candidat candidat;

    @OneToMany(mappedBy = "recrutement", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<evaluationAction> evaluations;


}
