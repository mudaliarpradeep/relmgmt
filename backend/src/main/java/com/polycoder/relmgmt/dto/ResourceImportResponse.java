package com.polycoder.relmgmt.dto;

import java.util.List;

public class ResourceImportResponse {

    private int totalProcessed;
    private int successful;
    private int failed;
    private List<ImportError> errors;

    // Default constructor
    public ResourceImportResponse() {}

    // Constructor with fields
    public ResourceImportResponse(int totalProcessed, int successful, int failed, List<ImportError> errors) {
        this.totalProcessed = totalProcessed;
        this.successful = successful;
        this.failed = failed;
        this.errors = errors;
    }

    // Getters and Setters
    public int getTotalProcessed() {
        return totalProcessed;
    }

    public void setTotalProcessed(int totalProcessed) {
        this.totalProcessed = totalProcessed;
    }

    public int getSuccessful() {
        return successful;
    }

    public void setSuccessful(int successful) {
        this.successful = successful;
    }

    public int getFailed() {
        return failed;
    }

    public void setFailed(int failed) {
        this.failed = failed;
    }

    public List<ImportError> getErrors() {
        return errors;
    }

    public void setErrors(List<ImportError> errors) {
        this.errors = errors;
    }

    // Inner class for import errors
    public static class ImportError {
        private int row;
        private String message;

        public ImportError() {}

        public ImportError(int row, String message) {
            this.row = row;
            this.message = message;
        }

        public int getRow() {
            return row;
        }

        public void setRow(int row) {
            this.row = row;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}