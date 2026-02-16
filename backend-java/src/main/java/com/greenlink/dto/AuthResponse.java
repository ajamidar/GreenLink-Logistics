package com.greenlink.dto;

import com.greenlink.model.Role;

public class AuthResponse {
    private final String token;
    private final Role role;

    public AuthResponse(String token, Role role) {
        this.token = token;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public Role getRole() {
        return role;
    }
}
