package com.blacc.taskbuddy.service;

import com.blacc.taskbuddy.model.User;
import com.blacc.taskbuddy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User register(User user) {
        if(userRepository.findByUsername(user.getUsername()) != null) {
            throw new RuntimeException("Username already exists");
        }
        return userRepository.save(user);
    }

    public User login(String username, String password) {
        User user = userRepository.findByUsername(username);
        if (user != null && user.getPassword().equals(password)) {
            return user;
        }
        throw new RuntimeException("Invalid credentials");
    }

    public User updateUsername(Long id, String newUsername) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if(userRepository.findByUsername(newUsername) != null) {
                throw new RuntimeException("Username already exists");
            }
            user.setUsername(newUsername);
            return userRepository.save(user);
        }
        throw new RuntimeException("User not found");
    }

    public void deleteAccount(Long id) {
        userRepository.deleteById(id);
    }
}
