package com.orbitamos.api.controller;

import com.orbitamos.api.entity.Job;
import com.orbitamos.api.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class JobsController {

    @Autowired
    private JobRepository jobRepository;

    @GetMapping
    public ResponseEntity<?> listJobs(@RequestParam(required = false) String type) {
        List<Job> jobs = (type != null && !type.isBlank())
            ? jobRepository.findByStatusAndTypeOrderByCreatedAtDesc("aberta", type.trim())
            : jobRepository.findByStatusOrderByCreatedAtDesc("aberta");
        List<Map<String, Object>> payload = jobs.stream()
            .map(j -> Map.<String, Object>of(
                "id", j.getId(),
                "title", j.getTitle(),
                "description", j.getDescription() != null ? j.getDescription() : "",
                "type", j.getType(),
                "status", j.getStatus(),
                "createdAt", j.getCreatedAt()
            ))
            .collect(Collectors.toList());
        return ResponseEntity.ok(Map.of(
            "success", true,
            "jobs", payload
        ));
    }
}
