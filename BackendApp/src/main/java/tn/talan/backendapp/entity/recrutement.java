package tn.talan.backendapp.entity;

import jakarta.persistence.*;
import java.util.Date;
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
    private user responsable;

    @ManyToOne
    @JoinColumn(name = "demandeur_id")
    private user demandeur;

    @ManyToOne
    @JoinColumn(name = "candidat_id")
    private candidat candidat;

}
