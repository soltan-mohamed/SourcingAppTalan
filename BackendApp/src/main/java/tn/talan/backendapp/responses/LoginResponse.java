package tn.talan.backendapp.responses;

import lombok.Getter;
import lombok.Setter;
import tn.talan.backendapp.entity.Role;

@Getter
@Setter
public class LoginResponse {
    private String token;
    private long expiresIn;
    private String fullName;
    private Role role;

    public String getToken() {
        return token;
    }



    public long getExpiresIn() {
        return expiresIn;
    }

    public LoginResponse setFullName(String fullName) {
        this.fullName = fullName;
        return this;
    }

    public LoginResponse setRole(Role role) {
        this.role = role;
        return this;
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