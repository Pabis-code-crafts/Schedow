package com.schedow.user_service.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.schedow.user_service.dto.LoginRequest;
import com.schedow.user_service.dto.RegisterUserRequest;
import com.schedow.user_service.dto.UserResponse;
import com.schedow.user_service.entity.User;
import com.schedow.user_service.repository.UserRepository;
import com.schedow.user_service.util.JwtService;

@Service
public class UserService {

private final UserRepository userRepository;

private final PasswordEncoder passwordEncoder;

private final JwtService jwtService;

public UserService(UserRepository userRepository,
PasswordEncoder passwordEncoder,
JwtService jwtService) {


this.userRepository = userRepository;
this.passwordEncoder = passwordEncoder;
this.jwtService = jwtService;

}


public String loginUser(LoginRequest request) {

User user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new RuntimeException("Invalid email or password"));

boolean passwordMatches = passwordEncoder.matches(
        request.getPassword(),
        user.getPassword()
);

if (!passwordMatches) {
    throw new RuntimeException("Invalid email or password");
}

return jwtService.generateToken(user.getEmail());

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

    user.setContractedHours(
            request.getContractedHours()
    );

    user.setActive(true);

    User savedUser = userRepository.save(user);

    UserResponse response = new UserResponse();

    response.setId(savedUser.getId());
    response.setName(savedUser.getName());
    response.setEmail(savedUser.getEmail());
    response.setRole(savedUser.getRole());

    response.setSite(savedUser.getSite());

    response.setContractedHours(
            savedUser.getContractedHours()
    );

    response.setActive(savedUser.getActive());

    return response;
}


}
