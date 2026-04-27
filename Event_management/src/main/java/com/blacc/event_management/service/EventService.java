package com.blacc.event_management.service;

import com.blacc.event_management.model.Event;
import com.blacc.event_management.repository.EventRepositry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventService {

    @Autowired
    private EventRepositry eventRepositry;

    public List<Event> getAllEvents() {
        return eventRepositry.findAll();
    }

    public Event createEvent(Event event) {
        return eventRepositry.save(event);
    }
}
