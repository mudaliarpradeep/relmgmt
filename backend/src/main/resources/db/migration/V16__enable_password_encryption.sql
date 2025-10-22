-- Enable password encryption by updating existing plaintext passwords to BCrypt hashes
-- This migration updates the admin user's password from plaintext to BCrypt hash

-- BCrypt hash for "Release2024!" (strength 10)
-- Generated using BCryptPasswordEncoder with default strength
-- Hash: $2a$10$7iBO3awrlKKLn4.geHF4mu3gyIMLEszxaeqCNy7Vu5y5Ado33xHkC

-- Update admin user password to BCrypt hash
-- Original password: Release2024!
UPDATE users 
SET password = '$2a$10$7iBO3awrlKKLn4.geHF4mu3gyIMLEszxaeqCNy7Vu5y5Ado33xHkC'
WHERE username = 'admin' AND password = 'Release2024!';

-- Note: This migration only updates users with plaintext passwords
-- New users created after this migration will automatically have BCrypt-hashed passwords
-- due to the PasswordEncoder bean in SecurityConfig

