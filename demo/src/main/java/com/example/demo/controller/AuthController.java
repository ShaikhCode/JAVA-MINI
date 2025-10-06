package com.example.demo.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // allow frontend calls
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/signup")
    @CrossOrigin(origins = "*") // allow all
    public Map<String, Object> signup(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String email = payload.get("email");
        String password = payload.get("password");

        Map<String, Object> resp = new HashMap<>();

        if(userRepository.findByEmail(email).isPresent()) {
            resp.put("message", "Email already registered");
            return resp;
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(password); // for MVP, plain password. Later hash!
        userRepository.save(user);

        resp.put("name", user.getName());
        resp.put("email", user.getEmail());
        return resp;
    }


    @PostMapping("/login")
    @CrossOrigin(origins = "*") // allow all
    public Map<String, Object> login(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String password = payload.get("password");

        Map<String, Object> resp = new HashMap<>();

        User user = userRepository.findByEmail(email).orElse(null);
        if(user == null || !user.getPassword().equals(password)) {
            resp.put("message", "Invalid email or password");
            return resp;
        }

        resp.put("name", user.getName());
        resp.put("email", user.getEmail());
        return resp;
    }

    // GET user name by email
    @PostMapping("/getName")
    @CrossOrigin(origins = "*") // allow all
    public Map<String, Object> getNameByEmail(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        Map<String, Object> resp = new HashMap<>();

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            resp.put("message", "User not found");
            return resp;
        }

        resp.put("name", user.getName());
        resp.put("id", user.getId());
        return resp;
    }

}


