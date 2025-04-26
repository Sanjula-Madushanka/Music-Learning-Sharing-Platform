package com.treble.treble.dto;

import com.treble.treble.model.ProgressUpdate;

import java.time.LocalDateTime;

public class ProgressUpdateResponse {
    private Long id;
    private Long userId;
    private String caption;
    private String mediaType;
    private String mediaUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProgressUpdateResponse(ProgressUpdate progressUpdate) {
        this.id = progressUpdate.getId();
        this.userId = progressUpdate.getUserId();
        this.caption = progressUpdate.getCaption();
        this.mediaType = progressUpdate.getMediaType();
        this.mediaUrl = progressUpdate.getMediaUrl();
        this.createdAt = progressUpdate.getCreatedAt();
        this.updatedAt = progressUpdate.getUpdatedAt();
    }

    // Getters
    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getCaption() {
        return caption;
    }

    public String getMediaType() {
        return mediaType;
    }

    public String getMediaUrl() {
        return mediaUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
