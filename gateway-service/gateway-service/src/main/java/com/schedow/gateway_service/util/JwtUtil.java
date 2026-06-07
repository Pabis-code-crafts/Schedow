package com.schedow.gateway_service.util;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

@Component
public class JwtUtil {

private static final String SECRET_KEY =
        "myverysecuresecretkeyforjwtokenschedowapplication123456789";

public Claims extractClaims(String token) {

    return Jwts.parser()
            .setSigningKey(SECRET_KEY)
            .build()
            .parseClaimsJws(token)
            .getBody();
}

public boolean isTokenValid(String token) {

    try {
        extractClaims(token);
        return true;
    } catch (Exception e) {
        return false;
    }
}


}
