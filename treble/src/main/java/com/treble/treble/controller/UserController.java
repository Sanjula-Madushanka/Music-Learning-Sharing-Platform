package com.treble.treble.controller;

import com.treble.treble.model.User;
import com.treble.treble.service.UserService;
import com.treble.treble.dto.UserDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "*")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<String> createUser(@RequestBody User user) {
        userService.createUser(user);
        return ResponseEntity.ok("User created successfully");
    }

    @GetMapping("/oauth-success")
    public void handleOAuthSuccess(@AuthenticationPrincipal OAuth2User oauth2User, HttpServletResponse response) throws IOException {
        String email = oauth2User.getAttribute("email");
        User user = userService.getUserByEmail(email);

        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setFirstName(oauth2User.getAttribute("given_name"));
            user.setLastName(oauth2User.getAttribute("family_name"));
            user.setProfilePictureUrl(oauth2User.getAttribute("picture"));
            user.setUserRole("user");
            user = userService.createUser(user);
        }

        if (user.getLastName() == null || user.getDOB() == null || user.getGender() == null || user.getContactNo() == null) {
            response.sendRedirect("http://localhost:5173/complete-profile?email=" + email);
        } else {
            response.sendRedirect("http://localhost:5173/oauth-redirect?email=" + email);
        }
    }

    @GetMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request, HttpServletResponse response, Authentication auth) {
        if (auth != null) {
            new SecurityContextLogoutHandler().logout(request, response, auth);
        }
        return ResponseEntity.ok("Logged out successfully");
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserDTO> userDTOs = users.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(convertToDTO(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateUser(@PathVariable Long id, @RequestBody User user) {
        userService.updateUser(id, user);
        return ResponseEntity.ok("User updated successfully");
    }

    @PutMapping("/update-by-email/{email}")
    public ResponseEntity<UserDTO> updateUserByEmail(@PathVariable String email, @RequestBody Map<String, String> updates) {
        User user = userService.getUserByEmail(email);
        if (user == null) return ResponseEntity.notFound().build();

        if (updates.containsKey("dob")) user.setDOB(LocalDate.parse(updates.get("dob")));
        if (updates.containsKey("gender")) user.setGender(updates.get("gender"));
        if (updates.containsKey("contactNo")) user.setContactNo(Integer.parseInt(updates.get("contactNo")));
        if (updates.containsKey("lastName")) user.setLastName(updates.get("lastName"));

        User updatedUser = userService.createUser(user);
        return ResponseEntity.ok(convertToDTO(updatedUser));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email) {
        User user = userService.getUserByEmail(email);
        if (user != null) {
            return ResponseEntity.ok(convertToDTO(user));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    @PostMapping("/{id}/follow/{followId}")
    public ResponseEntity<Map<String, Object>> followUser(@PathVariable Long id, @PathVariable Long followId) {
        try {
            userService.followUser(id, followId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Followed user successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/{id}/unfollow/{unfollowId}")
    public ResponseEntity<Map<String, Object>> unfollowUser(@PathVariable Long id, @PathVariable Long unfollowId) {
        try {
            userService.unfollowUser(id, unfollowId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Unfollowed user successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Helper method to convert User to UserDTO
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setUserRole(user.getUserRole());
        dto.setGender(user.getGender());
        dto.setProfilePictureUrl(user.getProfilePictureUrl());
        dto.setContactNo(user.getContactNo());
        dto.setDOB(user.getDOB());

        // Convert followers to simple DTOs (just IDs)
        dto.setFollowerIds(user.getFollowers().stream()
                .map(User::getId)
                .collect(Collectors.toSet()));

        // Convert following to simple DTOs (just IDs)
        dto.setFollowingIds(user.getFollowing().stream()
                .map(User::getId)
                .collect(Collectors.toSet()));

        return dto;
    }
}
