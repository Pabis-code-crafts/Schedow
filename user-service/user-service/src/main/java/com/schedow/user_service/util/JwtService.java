package com.schedow.user_service.util;

import java.util.Date;

import org.springframework.stereotype.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@Service
public class JwtService {

private static final String SECRET_KEY =
"myverysecuresecretkeyforjwtokenschedowapplication123456789";


public String generateToken(String email) {

    return Jwts.builder()
            .setSubject(email)
            .setIssuedAt(new Date())
            .setExpiration(
                    new Date(System.currentTimeMillis() + 1000 * 60 * 60)
            )
            .signWith(
                    SignatureAlgorithm.HS256,
                    SECRET_KEY
            )
            .compact();
}


}
