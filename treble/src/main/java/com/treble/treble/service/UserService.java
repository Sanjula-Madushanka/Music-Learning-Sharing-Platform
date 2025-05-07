package com.treble.treble.service;

import com.treble.treble.model.User;
import com.treble.treble.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }


    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateUser(Long id, User user) {
        User existing = getUserById(id);
        existing.setFirstName(user.getFirstName());
        existing.setLastName(user.getLastName());
        existing.setEmail(user.getEmail());
        existing.setPassword(user.getPassword());
        existing.setGender(user.getGender());
        existing.setProfilePictureUrl(user.getProfilePictureUrl());
        return userRepository.save(existing);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public void followUser(Long id, Long followId) {
        User user = getUserById(id);          // follower
        User toFollow = getUserById(followId); // user being followed

        if (!user.getFollowing().contains(toFollow)) {
            user.getFollowing().add(toFollow);
            toFollow.getFollowers().add(user); // add the reverse mapping

            // Save both entities to persist the relationship
            userRepository.save(user);
            userRepository.save(toFollow);

            System.out.println("User " + id + " is now following user " + followId);
        }
    }

    public void unfollowUser(Long id, Long unfollowId) {
        User user = getUserById(id);
        User toUnfollow = getUserById(unfollowId);

        if (user.getFollowing().contains(toUnfollow)) {
            user.getFollowing().remove(toUnfollow);
            toUnfollow.getFollowers().remove(user);

            // Save both entities to persist the relationship
            userRepository.save(user);
            userRepository.save(toUnfollow);

            System.out.println("User " + id + " unfollowed user " + unfollowId);
        }
    }

}
