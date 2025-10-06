package com.example.demo.model;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "communities")
public class Community {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int community_id;

    private String community_name;
    private String description;
    private Timestamp created_at;

    // Getters and Setters
    public int getCommunity_id() { return community_id; }
    //public void setCommunity_id(int id) { this.community_id = id; }

    public String getCommunity_name() { return community_name; }
    public void setCommunity_name(String name) { this.community_name = name; }

    public String getDescription() { return description; }
    public void setDescription(String desc) { this.description = desc; }

    public Timestamp getCreated_at() { return created_at; }
    public void setCreated_at(Timestamp t) { this.created_at = t; }
}
