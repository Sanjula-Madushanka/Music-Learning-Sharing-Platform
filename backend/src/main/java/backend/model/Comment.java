package backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String content;
    private String author;

    @ManyToOne
    @JoinColumn(name = "music_id")
    @JsonIgnore
    private Music music;

    public Comment() {}

    public Comment(String content, String author, Music music) {
        this.content = content;
        this.author = author;
        this.music = music;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public Music getMusic() { return music; }
    public void setMusic(Music music) { this.music = music; }
}
