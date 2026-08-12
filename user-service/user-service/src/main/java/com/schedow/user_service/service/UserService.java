package com.schedow.user_service.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.schedow.user_service.dto.AuthResponse;
import com.schedow.user_service.dto.LoginRequest;
import com.schedow.user_service.dto.RegisterUserRequest;
import com.schedow.user_service.dto.UserResponse;
import com.schedow.user_service.entity.User;
import com.schedow.user_service.exception.InvalidCredentialsException;
import com.schedow.user_service.repository.UserRepository;
import com.schedow.user_service.util.JwtService;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse loginUser(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        return new AuthResponse(jwtService.generateToken(user), toResponse(user));
    }

    public UserResponse registerUser(RegisterUserRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setSite(request.getSite());
        user.setContractedHours(request.getContractedHours());
        user.setActive(true);

        return toResponse(userRepository.save(user));
    }

    public List<UserResponse> getActiveWorkers() {
        return userRepository.findByActiveTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private UserResponse toResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setSite(user.getSite());
        response.setContractedHours(user.getContractedHours());
        response.setActive(user.getActive());
        return response;
    }
}
