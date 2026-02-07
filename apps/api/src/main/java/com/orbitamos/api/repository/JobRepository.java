package com.orbitamos.api.repository;

import com.orbitamos.api.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByStatusOrderByCreatedAtDesc(String status);
    List<Job> findByStatusAndTypeOrderByCreatedAtDesc(String status, String type);
}
