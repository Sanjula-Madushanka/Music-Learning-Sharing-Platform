package backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class Music {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false)
    private String artist;
    
    private String genre;
    private String filePath;
    private int likesCount = 0;
    
    @Column(nullable = false)
    private boolean isApproved = false; // Add is_approved field with default
    
    @OneToMany(mappedBy = "music", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();
    
    public Music() {}
    
    public Music(String title, String artist, String genre, boolean isApproved) {
        this.title = title;
        this.artist = artist;
        this.genre = genre;
        this.isApproved = isApproved;
    }
}