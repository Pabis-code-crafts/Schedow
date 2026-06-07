package com.schedow.schedule_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.schedow.schedule_service.entity.Shift;

public interface ShiftRepository extends JpaRepository<Shift, Long> {
}
