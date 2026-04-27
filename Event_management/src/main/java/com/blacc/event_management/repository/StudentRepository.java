package com.blacc.event_management.repository;

import com.blacc.event_management.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
public interface StudentRepository extends JpaRepository<Student, Long> {
}
