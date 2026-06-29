package com.schedow.user_service.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.schedow.user_service.dto.LoginRequest;
import com.schedow.user_service.dto.RegisterUserRequest;
import com.schedow.user_service.dto.UserResponse;
import com.schedow.user_service.service.UserService;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {


private final UserService userService;

public UserController(UserService userService) {
    this.userService = userService;
}

@GetMapping("/test")
public String test() {
    return "User service running";
}

@PostMapping("/register")
public UserResponse registerUser(@RequestBody RegisterUserRequest request) {
    return userService.registerUser(request);
}

@PostMapping("/login")
public String loginUser(@RequestBody LoginRequest request) {
    return userService.loginUser(request);      
}
@GetMapping("/workers")
public List<UserResponse> getWorkers() {
    return userService.getActiveWorkers();
}
}
