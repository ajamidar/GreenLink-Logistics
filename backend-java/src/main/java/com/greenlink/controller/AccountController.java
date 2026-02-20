package com.greenlink.controller;

import com.greenlink.dto.AccountResponse;
import com.greenlink.dto.AccountUpdateRequest;
import com.greenlink.model.Driver;
import com.greenlink.model.User;
import com.greenlink.repository.DriverRepository;
import com.greenlink.repository.UserRepository;
import com.greenlink.security.CurrentUserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/account")
public class AccountController {

    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final DriverRepository driverRepository;

    public AccountController(CurrentUserService currentUserService, UserRepository userRepository, DriverRepository driverRepository) {
        this.currentUserService = currentUserService;
        this.userRepository = userRepository;
        this.driverRepository = driverRepository;
    }

    @GetMapping
    public AccountResponse getAccount() {
        User user = currentUserService.requireUser();
        return toResponse(user);
    }

    @PutMapping
    public AccountResponse updateAccount(@RequestBody AccountUpdateRequest request) {
        User user = currentUserService.requireUser();
        String previousEmail = user.getUsername();

        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(user.getUsername())) {
            if (userRepository.existsByUsername(request.getEmail())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
            }
            user.setUsername(request.getEmail());
        }

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }

        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }

        User savedUser = userRepository.save(user);

        if (savedUser.getRole() == com.greenlink.model.Role.DRIVER) {
            driverRepository.findByEmailAndOrganizationId(previousEmail, savedUser.getOrganizationId())
                    .ifPresent(driver -> syncDriverProfile(driver, request, savedUser));
        }
        return toResponse(savedUser);
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAccount() {
        User user = currentUserService.requireUser();
        if (user.getRole() == com.greenlink.model.Role.DRIVER) {
            driverRepository.findByEmailAndOrganizationId(user.getUsername(), user.getOrganizationId())
                    .ifPresent(driver -> {
                        driver.setAssignedVehicle(null);
                        driver.setLastCheckIn(null);
                        driverRepository.save(driver);
                    });
        }
        userRepository.delete(user);
        return ResponseEntity.noContent().build();
    }

    private AccountResponse toResponse(User user) {
        return new AccountResponse(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                user.getFullName(),
                user.getPhoneNumber(),
                user.getCreatedAt()
        );
    }

    private void syncDriverProfile(Driver driver, AccountUpdateRequest request, User user) {
        if (request.getFullName() != null) {
            driver.setName(request.getFullName());
        }
        if (request.getPhoneNumber() != null) {
            driver.setPhone(request.getPhoneNumber());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            driver.setEmail(request.getEmail());
        } else {
            driver.setEmail(user.getUsername());
        }
        driverRepository.save(driver);
    }
}
