package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_id")  // map to actual DB column name
    private Long id;

    private Long userId;
    private int communityId;
    private String questionText;
    private LocalDateTime timestamp = LocalDateTime.now();

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL)
    @JsonManagedReference  // to handle JSON serialization properly
    private List<Reply> replies;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public int getCommunityId() { return communityId; }
    public void setCommunityId(int communityId) { this.communityId = communityId; }

    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public List<Reply> getReplies() { return replies; }
    public void setReplies(List<Reply> replies) { this.replies = replies; }
}
