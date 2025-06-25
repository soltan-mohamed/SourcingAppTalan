package tn.talan.backendapp.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.talan.backendapp.entity.user;

public interface userRepository extends JpaRepository<user,Long> {
}
