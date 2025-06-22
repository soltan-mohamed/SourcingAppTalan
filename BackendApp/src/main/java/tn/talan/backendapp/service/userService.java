package tn.talan.backendapp.service;

import tn.talan.backendapp.entity.user;
import tn.talan.backendapp.dao.userRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class userService {
    private final userRepository repository;

    public userService(userRepository repository) {
        this.repository = repository;
    }

    public List<user> getAll() {
        return repository.findAll();
    }

    public user getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public user save(user user) {
        return repository.save(user);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public user update(Long id, user updated) {
        user user = repository.findById(id).orElse(null);
        if (user != null) {
            user.setNom(updated.getNom());
            user.setPrenom(updated.getPrenom());
            user.setEmail(updated.getEmail());
            user.setPassword(updated.getPassword());
            user.setRole(updated.getRole());
            user.setProfileCoverPath(updated.getProfileCoverPath());
            user.setProfilePhotoPath(updated.getProfilePhotoPath());
            return repository.save(user);
        }
        return null;
    }
}
