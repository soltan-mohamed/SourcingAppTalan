package tn.talan.backendapp.service;

import org.springframework.stereotype.Service;
import tn.talan.backendapp.entity.User;
import tn.talan.backendapp.enums.Role;
import tn.talan.backendapp.repository.UserRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> allUsers() {
        List<User> users = new ArrayList<>();

        userRepository.findAll().forEach(users::add);

        return users;
    }

    public List<User> allUsersByRole(Role role) {
        return userRepository.findByRolesContaining(role);
    }
}

