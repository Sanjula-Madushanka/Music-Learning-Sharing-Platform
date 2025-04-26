package com.treble.treble.service;

import com.treble.treble.dto.ProgressUpdateRequest;
import com.treble.treble.exception.ResourceNotFoundException;
import com.treble.treble.model.ProgressUpdate;
import com.treble.treble.repository.ProgressUpdateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class ProgressUpdateService {

    @Autowired
    private ProgressUpdateRepository progressUpdateRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${server.port:8080}")
    private String serverPort;

    public ProgressUpdate createProgressUpdate(Long userId, String caption, MultipartFile mediaFile) throws IOException {
        if (mediaFile == null || mediaFile.isEmpty()) {
            throw new IllegalArgumentException("Media file is required");
        }

        // Validate file type
        String contentType = mediaFile.getContentType();
        String mediaType;

        if (contentType != null && contentType.startsWith("image/")) {
            mediaType = "IMAGE";
        } else if (contentType != null && contentType.startsWith("video/")) {
            mediaType = "VIDEO";
        } else {
            throw new IllegalArgumentException("Unsupported media type: " + contentType);
        }

        // Store the file
        String fileName = fileStorageService.storeFile(mediaFile);
        System.out.println("File stored successfully: " + fileName);

        String mediaUrl;
        if (baseUrl.contains(":")) {
            // If baseUrl already contains port
            mediaUrl = baseUrl + "/uploads/" + fileName;
        } else {
            // If baseUrl doesn't contain port
            mediaUrl = baseUrl + ":" + serverPort + "/uploads/" + fileName;
        }

        // Create and save the progress update
        ProgressUpdate progressUpdate = new ProgressUpdate(userId, caption, mediaType, mediaUrl);
        return progressUpdateRepository.save(progressUpdate);
    }

    public List<ProgressUpdate> getAllProgressUpdatesByUser(Long userId) {
        return progressUpdateRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public ProgressUpdate getProgressUpdateById(Long id) {
        return progressUpdateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Progress update not found with id: " + id));
    }

    public ProgressUpdate updateProgressUpdate(Long id, ProgressUpdateRequest updateRequest, MultipartFile mediaFile) throws IOException {
        ProgressUpdate existingUpdate = getProgressUpdateById(id);

        // Update caption if provided
        if (updateRequest.getCaption() != null) {
            existingUpdate.setCaption(updateRequest.getCaption());
        }

        // Update media if provided
        if (mediaFile != null && !mediaFile.isEmpty()) {
            // Delete old file if it exists
            String oldFileName = existingUpdate.getMediaUrl().substring(existingUpdate.getMediaUrl().lastIndexOf("/") + 1);
            fileStorageService.deleteFile(oldFileName);

            // Store new file
            String contentType = mediaFile.getContentType();
            String mediaType;

            if (contentType != null && contentType.startsWith("image/")) {
                mediaType = "IMAGE";
            } else if (contentType != null && contentType.startsWith("video/")) {
                mediaType = "VIDEO";
            } else {
                throw new IllegalArgumentException("Unsupported media type: " + contentType);
            }

            String fileName = fileStorageService.storeFile(mediaFile);
            String mediaUrl;
            if (baseUrl.contains(":")) {
                // If baseUrl already contains port
                mediaUrl = baseUrl + "/uploads/" + fileName;
            } else {
                // If baseUrl doesn't contain port
                mediaUrl = baseUrl + ":" + serverPort + "/uploads/" + fileName;
            }

            existingUpdate.setMediaType(mediaType);
            existingUpdate.setMediaUrl(mediaUrl);
        }

        return progressUpdateRepository.save(existingUpdate);
    }

    public void deleteProgressUpdate(Long id) {
        ProgressUpdate progressUpdate = getProgressUpdateById(id);

        // Delete the media file
        String fileName = progressUpdate.getMediaUrl().substring(progressUpdate.getMediaUrl().lastIndexOf("/") + 1);
        fileStorageService.deleteFile(fileName);

        // Delete the database record
        progressUpdateRepository.deleteById(id);
    }
}
