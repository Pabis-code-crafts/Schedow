package com.schedow.schedule_service.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.schedow.schedule_service.entity.Unavailability;

public interface UnavailabilityRepository
extends JpaRepository<Unavailability, Long> {

List<Unavailability> findByUserId(Long userId);

List<Unavailability> findByUnavailableDate(
        LocalDate unavailableDate
);


}
