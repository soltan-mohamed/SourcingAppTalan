package tn.talan.backendapp.responses;


import lombok.Getter;
import lombok.Setter;
import tn.talan.backendapp.enums.Role;

import java.util.Set;

@Getter
@Setter
public class LoginResponse {
    private String token;
    private long expiresIn;
    private String fullName;
    private Long id;
    private Set<Role> roles; // Changé de Role à Set<Role>

    public String getToken() {
        return token;
    }

    public Long getId() {
        return id;
    }

    public LoginResponse setId(Long id) {
        this.id = id;
        return this;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public LoginResponse setFullName(String fullName) {
        this.fullName = fullName;
        return this;
    }

    // Getters et setters
    public LoginResponse setRoles(Set<Role> roles) {
        this.roles = roles;
        return this;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public LoginResponse setToken(String token) {
        this.token = token;
        return this;
    }

    public LoginResponse setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
        return this;
    }
}