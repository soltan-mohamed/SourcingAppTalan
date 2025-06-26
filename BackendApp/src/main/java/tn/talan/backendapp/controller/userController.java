package tn.talan.backendapp.controller;

import tn.talan.backendapp.entity.user;
import tn.talan.backendapp.service.userService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class userController {
    private final userService service;

    public userController(userService service) {
        this.service = service;
    }

    @GetMapping
    public List<user> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public user getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public user create(@RequestBody user user) {
        return service.save(user);
    }

    @PutMapping("/{id}")
    public user update(@PathVariable Long id, @RequestBody user user) {
        return service.update(id, user);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
