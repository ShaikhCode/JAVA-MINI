package com.example.demo.controller;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private QuestionRepository questionRepo;

    @Autowired
    private ReplyRepository replyRepo;

    // Get all questions (and replies) by community
    @GetMapping("/{communityId}")
    public List<Question> getCommunityQuestions(@PathVariable int communityId) {
        return questionRepo.findByCommunityId(communityId);
    }

    // Add new question
    @PostMapping("/question")
    public Question addQuestion(@RequestBody Map<String, Object> payload) {
        Question q = new Question();
        q.setUserId(Long.parseLong(payload.get("userId").toString()));
        q.setCommunityId(Integer.parseInt(payload.get("communityId").toString()));
        q.setQuestionText(payload.get("questionText").toString());
        return questionRepo.save(q);
    }

    // Add new reply
    @PostMapping("/reply")
    public Reply addReply(@RequestBody Map<String, Object> payload) {
        Long qid = Long.parseLong(payload.get("questionId").toString());
        Question q = questionRepo.findById(qid).orElse(null);
        if (q == null) return null;

        Reply r = new Reply();
        r.setUserId(Long.parseLong(payload.get("userId").toString()));
        r.setReplyText(payload.get("replyText").toString());
        r.setQuestion(q);
        return replyRepo.save(r);
    }

    // Like a reply
    @PostMapping("/like/{replyId}")
    public Map<String, Object> likeReply(@PathVariable Long replyId) {
        Reply r = replyRepo.findById(replyId).orElse(null);
        Map<String, Object> resp = new HashMap<>();
        if (r != null) {
            r.setLikes(r.getLikes() + 1);
            replyRepo.save(r);
            resp.put("likes", r.getLikes());
        } else {
            resp.put("error", "Reply not found");
        }
        return resp;
    }
}
