package com.schedow.user_service.entity;

import com.schedow.user_service.role.Role;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "users")
public class User {


@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@NotBlank
private String name;

@Email
@NotBlank
private String email;

@NotBlank
private String password;


@Enumerated(EnumType.STRING)
private Role role;

private String site;

private Integer contractedHours;

private Boolean active = true;

public User() {
}

public Long getId() {
    return id;
}

public String getName() {
    return name;
}

public void setName(String name) {
    this.name = name;
}

public String getEmail() {
    return email;
}

public void setEmail(String email) {
    this.email = email;
}

public String getPassword() {
    return password;
}

public void setPassword(String password) {
    this.password = password;
}

public Role getRole() {
    return role;
}

public void setRole(Role role) {
    this.role = role;
}

public String getSite() {
    return site;
}

public void setSite(String site) {
    this.site = site;
}

public Integer getContractedHours() {
    return contractedHours;
}

public void setContractedHours(Integer contractedHours) {
    this.contractedHours = contractedHours;
}

public Boolean getActive() {
    return active;
}

public void setActive(Boolean active) {
    this.active = active;
}

}
