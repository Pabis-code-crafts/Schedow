package com.schedow.user_service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestBCrypt {

    public static void main(String[] args) {

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        String password = "password123";

        String hash = encoder.encode(password);

        System.out.println(hash);
    }
}