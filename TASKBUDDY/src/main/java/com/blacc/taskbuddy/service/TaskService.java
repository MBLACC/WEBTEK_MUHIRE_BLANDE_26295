package com.blacc.taskbuddy.service;

import com.blacc.taskbuddy.model.Task;
import com.blacc.taskbuddy.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    public Task saveTask(Task task) {
        return taskRepository.save(task);
    }

    public List<Task> getTasksForUser(Long userId) {
        List<Task> tasks = taskRepository.findByUserId(userId);
        
        boolean modified = false;
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        // when the task ends make as complete
        for (Task task : tasks) {
            if (!task.isComplete()) {
                if (task.getDueDate().isBefore(today) || 
                   (task.getDueDate().isEqual(today) && task.getDueTime().isBefore(now))) {
                    task.setComplete(true);
                    modified = true;
                }
            }
        }
        
        if (modified) {
            taskRepository.saveAll(tasks);
        }

        return tasks;
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    public List<Task> searchTasks(Long userId, String query) {
        List<Task> allTasks = getTasksForUser(userId);
        if (query == null || query.trim().isEmpty()) {
            return allTasks;
        }

        String lowerQuery = query.toLowerCase();

        return allTasks.stream().filter(task -> {
            boolean matchId = String.valueOf(task.getId()).contains(lowerQuery);
            boolean matchName = task.getName().toLowerCase().contains(lowerQuery);
            boolean matchDate = task.getDueDate().toString().contains(lowerQuery);
            return matchId || matchName || matchDate;
        }).collect(Collectors.toList());
    }
}
