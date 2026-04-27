package com.blacc.event_management.repository;

import com.blacc.event_management.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
public interface EventRepositry extends JpaRepository<Event, Long> {
}
