package com.example.chatapp.repository;

import com.example.chatapp.entity.Message;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByConversation_IdOrderByCreatedAtAsc(Long conversationId);

    Optional<Message> findTopByConversation_IdOrderByCreatedAtDesc(Long conversationId);

    long countByConversation_Id(Long conversationId);

    long countByConversation_IdAndIdGreaterThan(Long conversationId, Long messageId);
}
