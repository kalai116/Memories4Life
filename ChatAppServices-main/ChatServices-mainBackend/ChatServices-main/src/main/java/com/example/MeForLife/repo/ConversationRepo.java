package com.example.MeForLife.repo;

import com.example.MeForLife.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepo extends JpaRepository<Conversation,Long> {


    @Query("SELECT c FROM Conversation c WHERE c.sender=:sender OR c.receiver=:sender")
    List<Conversation> getConv(@Param("sender") String sender);

    @Query("SELECT c  FROM Conversation c WHERE c.sender =:sender ORDER BY c.dateTime DESC LIMIT 1")
    List<Conversation> getRecentConvIDByDate(@Param("sender") String sender);
}
