package tn.talan.backendapp.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import tn.talan.backendapp.entity.User;
import tn.talan.backendapp.enums.Role;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface UserRepository extends CrudRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    List<User> findByRolesContaining(Role roles);
}