package com.schedow.user_service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.schedow.user_service.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {


Optional<User> findByEmail(String email);

List<User> findByActiveTrue();
}
