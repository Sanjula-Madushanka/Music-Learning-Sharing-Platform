package backend.service;

import backend.model.Comment;
import backend.model.Music;
import backend.repository.CommentRepository;
import backend.repository.MusicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {
    private final CommentRepository commentRepository;
    private final MusicRepository musicRepository;

    @Autowired
    public CommentService(CommentRepository commentRepository, MusicRepository musicRepository) {
        this.commentRepository = commentRepository;
        this.musicRepository = musicRepository;
    }

    public Comment addComment(Long musicId, Comment comment) {
        Music music = musicRepository.findById(musicId).orElse(null);
        if (music != null) {
            comment.setMusic(music);
            return commentRepository.save(comment);
        }
        return null;
    }

    public List<Comment> getCommentsByMusicId(Long musicId) {
        return commentRepository.findByMusicId(musicId);
    }
}
