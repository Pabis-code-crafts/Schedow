package com.schedow.schedule_service.dto;

public class UserResponse {

    private Long id;

    private String name;

    private Integer contractedHours;

    private Boolean active;

    public UserResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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