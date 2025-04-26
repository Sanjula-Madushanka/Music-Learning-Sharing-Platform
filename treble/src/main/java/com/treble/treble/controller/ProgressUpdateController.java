package com.treble.treble.controller;

import com.treble.treble.dto.ProgressUpdateRequest;
import com.treble.treble.dto.ProgressUpdateResponse;
import com.treble.treble.model.ProgressUpdate;
import com.treble.treble.service.ProgressUpdateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/progress-updates")
public class ProgressUpdateController {

    @Autowired
    private ProgressUpdateService progressUpdateService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createProgressUpdate(
            @RequestParam("userId") Long userId,
            @RequestParam(value = "caption", required = false) String caption,
            @RequestParam("media") MultipartFile media) {

        try {
            System.out.println("Received request to create progress update for user: " + userId);
            System.out.println("Media file name: " + media.getOriginalFilename());
            System.out.println("Media file size: " + media.getSize() + " bytes");
            System.out.println("Media content type: " + media.getContentType());

            ProgressUpdate createdUpdate = progressUpdateService.createProgressUpdate(userId, caption, media);
            System.out.println("Progress update created successfully with ID: " + createdUpdate.getId());
            return new ResponseEntity<>(new ProgressUpdateResponse(createdUpdate), HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("Error creating progress update: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(
                    "Error creating progress update: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ProgressUpdateResponse>> getProgressUpdatesByUser(@PathVariable Long userId) {
        List<ProgressUpdate> updates = progressUpdateService.getAllProgressUpdatesByUser(userId);
        List<ProgressUpdateResponse> responses = updates.stream()
                .map(ProgressUpdateResponse::new)
                .collect(Collectors.toList());
        return new ResponseEntity<>(responses, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProgressUpdateResponse> getProgressUpdateById(@PathVariable Long id) {
        ProgressUpdate update = progressUpdateService.getProgressUpdateById(id);
        return new ResponseEntity<>(new ProgressUpdateResponse(update), HttpStatus.OK);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProgressUpdate(
            @PathVariable Long id,
            @RequestParam(value = "caption", required = false) String caption,
            @RequestParam(value = "media", required = false) MultipartFile media) {

        try {
            ProgressUpdateRequest updateRequest = new ProgressUpdateRequest(caption);
            ProgressUpdate updatedUpdate = progressUpdateService.updateProgressUpdate(id, updateRequest, media);
            return new ResponseEntity<>(new ProgressUpdateResponse(updatedUpdate), HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(
                    "Error updating progress update: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProgressUpdate(@PathVariable Long id) {
        progressUpdateService.deleteProgressUpdate(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
