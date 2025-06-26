package tn.talan.backendapp.dtos;


import lombok.Getter;
import lombok.Setter;
import tn.talan.backendapp.entity.Role;

@Getter
@Setter
public class RegisterUserDto {
    private String email;

    private String password;

    private String fullName;

    private Role role; // Ajout du rôle


    // getters and setters here...
}