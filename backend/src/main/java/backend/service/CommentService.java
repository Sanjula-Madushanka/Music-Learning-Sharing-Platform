package backend.service;

import backend.model.Comment;
import backend.model.Music;
import backend.repository.CommentRepository;
import backend.repository.MusicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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

    public Optional<Comment> updateComment(Long commentId, String content, String author) {
        return commentRepository.findById(commentId).map(existing -> {
            if (content != null) existing.setContent(content);
            if (author != null) existing.setAuthor(author);
            return commentRepository.save(existing);
        });
    }

    public boolean deleteComment(Long commentId) {
        return commentRepository.findById(commentId).map(c -> {
            commentRepository.delete(c);
            return true;
        }).orElse(false);
    }

    public Optional<Comment> getCommentById(Long commentId) {
        return commentRepository.findById(commentId);
    }
}
