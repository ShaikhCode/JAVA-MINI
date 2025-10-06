package com.example.demo.repository;

import com.example.demo.model.Community;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommunityRepository extends JpaRepository<Community, Integer> {
    Community findById(int id); // or Optional<Community> findById(int id);
}

