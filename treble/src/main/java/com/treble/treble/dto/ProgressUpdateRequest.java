package com.treble.treble.dto;

public class ProgressUpdateRequest {
    private String caption;

    public ProgressUpdateRequest() {
    }

    public ProgressUpdateRequest(String caption) {
        this.caption = caption;
    }

    public String getCaption() {
        return caption;
    }

    public void setCaption(String caption) {
        this.caption = caption;
    }
}
