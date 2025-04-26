package backend.controller;

import backend.model.Comment;
import backend.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/music/{musicId}/comments")
public class CommentController {
    private final CommentService commentService;

    @Autowired
    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    public ResponseEntity<Comment> addComment(@PathVariable Long musicId, @RequestBody Comment comment) {
        Comment newComment = commentService.addComment(musicId, comment);
        return newComment != null ? ResponseEntity.ok(newComment) : ResponseEntity.notFound().build();
    }

    @GetMapping
    public ResponseEntity<List<Comment>> getCommentsByMusicId(@PathVariable Long musicId) {
        return ResponseEntity.ok(commentService.getCommentsByMusicId(musicId));
    }
}