package tn.talan.backendapp.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.talan.backendapp.dtos.LoginUserDto;
import tn.talan.backendapp.dtos.RegisterUserDto;
import tn.talan.backendapp.entity.User;
import tn.talan.backendapp.responses.LoginResponse;
import tn.talan.backendapp.service.AuthenticationService;
import tn.talan.backendapp.service.JwtService;


@RequestMapping("/auth")
@RestController
public class AuthenticationController {
    private final JwtService jwtService;
    private final AuthenticationService authenticationService;

    public AuthenticationController(JwtService jwtService, AuthenticationService authenticationService) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
    }

    @PostMapping("/signup")
    public ResponseEntity<User> register(@RequestBody RegisterUserDto registerUserDto) {
        // Validation optionnelle des rôles
        if (registerUserDto.getRoles() == null || registerUserDto.getRoles().isEmpty()) {
            throw new IllegalArgumentException("At least one role must be specified");
        }

        User registeredUser = authenticationService.signup(registerUserDto);
        return ResponseEntity.ok(registeredUser);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticate(@RequestBody LoginUserDto loginUserDto) {
        User authenticatedUser = authenticationService.authenticate(loginUserDto);
        String jwtToken = jwtService.generateToken(authenticatedUser);

        LoginResponse loginResponse = new LoginResponse()
                .setToken(jwtToken)
                .setExpiresIn(jwtService.getExpirationTime())
                .setFullName(authenticatedUser.getFullName())
                .setRoles(authenticatedUser.getRoles()); // Utilisez getRoles() au lieu de getRole()

        return ResponseEntity.ok(loginResponse);
    }

}