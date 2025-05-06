package backend.service;

import backend.model.Music;
import backend.repository.MusicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class MusicService {
    private final MusicRepository musicRepository;
    
    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Autowired
    public MusicService(MusicRepository musicRepository) {
        this.musicRepository = musicRepository;
    }

    public Music createMusic(Music music, MultipartFile file) throws IOException {
        if (file != null && !file.isEmpty()) {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);
            music.setFilePath(filePath.toString());
        }
        return musicRepository.save(music);
    }

    public List<Music> getAllMusic() {
        return musicRepository.findAll();
    }

    public Optional<Music> getMusicById(Long id) {
        return musicRepository.findById(id);
    }

    public Optional<Music> updateMusic(Long id, String title, String artist, String genre, MultipartFile file) throws IOException {
        return musicRepository.findById(id).map(music -> {
            if (title != null) music.setTitle(title);
            if (artist != null) music.setArtist(artist);
            if (genre != null) music.setGenre(genre);
            
            try {
                if (file != null && !file.isEmpty()) {
                    // Delete old file if exists
                    if (music.getFilePath() != null) {
                        Files.deleteIfExists(Paths.get(music.getFilePath()));
                    }
                    
                    // Save new file
                    String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                    Path filePath = Paths.get(uploadDir, fileName);
                    Files.copy(file.getInputStream(), filePath);
                    music.setFilePath(filePath.toString());
                }
            } catch (IOException e) {
                throw new RuntimeException("Failed to update file", e);
            }
            
            return musicRepository.save(music);
        });
    }

    public void deleteMusic(Long id) {
        musicRepository.findById(id).ifPresent(music -> {
            if (music.getFilePath() != null) {
                try {
                    Files.deleteIfExists(Paths.get(music.getFilePath()));
                } catch (IOException e) {
                    System.err.println("Failed to delete file: " + e.getMessage());
                }
            }
            musicRepository.delete(music);
        });
    }

    public Optional<Music> likeMusic(Long id) {
        return musicRepository.findById(id).map(music -> {
            music.setLikesCount(music.getLikesCount() + 1);
            return musicRepository.save(music);
        });
    }
}