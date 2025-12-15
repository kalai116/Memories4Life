package com.example.MeForLife.repo;

import com.example.MeForLife.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
	// Spring converts to query to find by email 
    Optional<User> findByEmail(String email);
    // Spring converts to query and check if the email exist or not returns tru or false mainly when user register 
    boolean existsByEmail(String email);

    @Query("SELECT u.username FROM User u WHERE u.email = :email")
    Optional<String> getUserNname(@Param("email") String email);

    @Query("SELECT u.email FROM User u WHERE u.username = :username")
    Optional<String> getEmailByUser(@Param("username") String username);

}
