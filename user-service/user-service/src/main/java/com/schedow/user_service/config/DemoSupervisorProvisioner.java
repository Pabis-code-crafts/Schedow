package com.schedow.user_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.schedow.user_service.entity.User;
import com.schedow.user_service.repository.UserRepository;
import com.schedow.user_service.role.Role;

@Component
public class DemoSupervisorProvisioner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String passwordHash;
    private final String password;
    private final String name;
    private final String site;

    public DemoSupervisorProvisioner(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${schedow.demo-supervisor.email:}") String email,
            @Value("${schedow.demo-supervisor.password-hash:}") String passwordHash,
            @Value("${schedow.demo-supervisor.password:}") String password,
            @Value("${schedow.demo-supervisor.name:Demo Supervisor}") String name,
            @Value("${schedow.demo-supervisor.site:Hatfield}") String site
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.email = email;
        this.passwordHash = passwordHash;
        this.password = password;
        this.name = name;
        this.site = site;
    }

    @Override
    public void run(String... args) {
        if (!StringUtils.hasText(email)) {
            return;
        }

        String encodedPassword = resolvePassword();

        User user = userRepository.findByEmail(email)
                .orElseGet(User::new);

        user.setName(StringUtils.hasText(name) ? name : "Demo Supervisor");
        user.setEmail(email);
        user.setPassword(encodedPassword);
        user.setRole(Role.SUPERVISOR);
        user.setSite(StringUtils.hasText(site) ? site : "Hatfield");
        user.setContractedHours(0);
        user.setActive(true);

        userRepository.save(user);
    }

    private String resolvePassword() {
        if (StringUtils.hasText(passwordHash)) {
            return passwordHash;
        }

        if (StringUtils.hasText(password)) {
            return passwordEncoder.encode(password);
        }

        throw new IllegalStateException(
                "Demo supervisor provisioning requires DEMO_SUPERVISOR_PASSWORD_HASH or DEMO_SUPERVISOR_PASSWORD."
        );
    }
}
