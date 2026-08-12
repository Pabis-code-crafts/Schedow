package com.schedow.user_service.config;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class RegistrationDisabledFilter extends OncePerRequestFilter {

    private final boolean registrationEnabled;

    public RegistrationDisabledFilter(@Value("${schedow.registration.enabled:true}") boolean registrationEnabled) {
        this.registrationEnabled = registrationEnabled;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        if (!registrationEnabled
                && "POST".equalsIgnoreCase(request.getMethod())
                && "/api/v1/users/register".equals(request.getRequestURI())) {
            response.setStatus(HttpStatus.FORBIDDEN.value());
            response.setContentType("text/plain");
            response.getWriter().write("Public registration is disabled.");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
