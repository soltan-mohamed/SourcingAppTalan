package tn.talan.backendapp.entity;

import jakarta.persistence.*;
import lombok.*;
import tn.talan.backendapp.enums.Role;
import tn.talan.backendapp.enums.StatutRecrutement;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "recrutement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Recrutement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String position;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutRecrutement statut;

    @ManyToOne
    @JoinColumn(name = "recruteur_id", nullable = false)
    private User recruteur;

    @ManyToOne
    @JoinColumn(name = "manager_id", nullable = false)
    private User manager;

    @ManyToOne
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @OneToMany(mappedBy = "recrutement", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Evaluation> evaluations = new ArrayList<>();

    @Transient
    private boolean editable;

    public boolean isEditable(User currentUser) {
        if (currentUser.getRoles().contains(Role.RECRUTEUR_MANAGER)) {
            return true;
        }
        return this.recruteur.getId().equals(currentUser.getId()) ||
                this.manager.getId().equals(currentUser.getId());
    }
}