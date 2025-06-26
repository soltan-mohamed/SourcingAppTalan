package tn.talan.backendapp.service;

import tn.talan.backendapp.entity.Utilisateur;
import tn.talan.backendapp.dao.UtilisateurRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UtilisateurService {
    private final UtilisateurRepository repository;

    public UtilisateurService(UtilisateurRepository repository) {
        this.repository = repository;
    }

    public List<Utilisateur> getAll() {
        return repository.findAll();
    }

    public Utilisateur getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Utilisateur save(Utilisateur user) {
        return repository.save(user);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public Utilisateur update(Long id, Utilisateur updated) {
        Utilisateur user = repository.findById(id).orElse(null);
        if (user != null) {
            user.setNom(updated.getNom());
            user.setPrenom(updated.getPrenom());
            user.setEmail(updated.getEmail());
            user.setPassword(updated.getPassword());
            user.setRole(updated.getRole());
            user.setProfilePhotoPath(updated.getProfilePhotoPath());
            return repository.save(user);
        }
        return null;
    }
}
