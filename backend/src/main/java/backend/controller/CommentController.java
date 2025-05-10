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
        Comment created = commentService.addComment(musicId, comment);
        return created != null ? ResponseEntity.ok(created) : ResponseEntity.notFound().build();
    }

    @GetMapping
    public ResponseEntity<List<Comment>> getAllComments(@PathVariable Long musicId) {
        return ResponseEntity.ok(commentService.getCommentsByMusicId(musicId));
    }

    @GetMapping("/{commentId}")
    public ResponseEntity<Comment> getCommentById(@PathVariable Long commentId) {
        return commentService.getCommentById(commentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<Comment> updateComment(
            @PathVariable Long commentId,
            @RequestBody Comment updatedData) {
        return commentService.updateComment(commentId, updatedData.getContent(), updatedData.getAuthor())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        boolean deleted = commentService.deleteComment(commentId);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
