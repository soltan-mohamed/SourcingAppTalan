package tn.talan.backendapp.dtos;



import lombok.Getter;
import lombok.Setter;
import tn.talan.backendapp.entity.Role;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
public class RegisterUserDto {
    private String email;
    private String password;
    private String fullName;
    private Set<Role> roles = new HashSet<>(); // Changement ici pour supporter plusieurs rôles

    // Méthodes utilitaires
    public void addRole(Role role) {
        this.roles.add(role);
    }

    public boolean hasRole(Role role) {
        return this.roles.contains(role);
    }

    public void removeRole(Role role) {
        this.roles.remove(role);
    }
}