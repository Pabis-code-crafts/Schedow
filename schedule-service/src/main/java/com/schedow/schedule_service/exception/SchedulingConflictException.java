package com.schedow.schedule_service.exception;

public class SchedulingConflictException extends RuntimeException {

    public SchedulingConflictException(String message) {
        super(message);
    }
}