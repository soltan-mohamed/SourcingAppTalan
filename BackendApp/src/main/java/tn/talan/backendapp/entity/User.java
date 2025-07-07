package tn.talan.backendapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import tn.talan.backendapp.enums.Role;

import java.util.*;
import java.util.stream.Collectors;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(nullable = false)
    private Integer id;

    @Column(nullable = false)
    private String fullName;

    @Column(unique = true, length = 100, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @CreationTimestamp
    @Column(updatable = false, name = "created_at")
    private Date createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Date updatedAt;

    @ElementCollection(targetClass = Role.class, fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    private Set<Role> roles = new HashSet<>();

    @OneToMany(mappedBy = "responsable", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Candidate> candidates = new ArrayList<>();

    @OneToMany(mappedBy = "evaluateur", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Evaluation> evaluations = new ArrayList<>();

    public void addRoles(Set<Role> rolesToAdd) {
        this.roles.addAll(rolesToAdd);
    }

    public void addRole(Role role) {
        this.roles.add(role);
    }

    public boolean isRecruteurManager() {
        return this.roles.contains(Role.RECRUTEUR_MANAGER);
    }

    public boolean isRecruteur() {
        return this.roles.contains(Role.RECRUTEUR);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return this.roles.stream()
                .map(role -> new SimpleGrantedAuthority(role.name()))
                .collect(Collectors.toList());
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public User setEmail(String email) {
        this.email = email;
        return this;
    }

    public User setFullName(String fullName) {
        this.fullName = fullName;
        return this;
    }

    public User setPassword(String password) {
        this.password = password;
        return this;
    }
}