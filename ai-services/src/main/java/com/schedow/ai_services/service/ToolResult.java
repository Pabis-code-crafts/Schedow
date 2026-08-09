package com.schedow.ai_services.service;

public class ToolResult {

    private final String name;
    private final Object data;
    private final String error;

    private ToolResult(String name, Object data, String error) {
        this.name = name;
        this.data = data;
        this.error = error;
    }

    public static ToolResult success(String name, Object data) {
        return new ToolResult(name, data, null);
    }

    public static ToolResult failure(String name, Exception exception) {
        return new ToolResult(name, null, exception.getMessage());
    }

    public String getName() {
        return name;
    }

    public Object getData() {
        return data;
    }

    public String getError() {
        return error;
    }

    public boolean isSuccess() {
        return error == null;
    }
}
