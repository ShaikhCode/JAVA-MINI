package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "replies")
public class Reply {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")  // Assuming your DB uses reply_id, adjust if different
    private Long id;

    private Long userId;
    private String replyText;
    private int likes = 0;
    private LocalDateTime timestamp = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "question_id")  // FK column in replies table
    @JsonBackReference  // to avoid circular JSON reference
    private Question question;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getReplyText() { return replyText; }
    public void setReplyText(String replyText) { this.replyText = replyText; }

    public int getLikes() { return likes; }
    public void setLikes(int likes) { this.likes = likes; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public Question getQuestion() { return question; }
    public void setQuestion(Question question) { this.question = question; }
}
