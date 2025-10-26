package com.example.chatapp.repository;

import com.example.chatapp.entity.ConversationReadState;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConversationReadStateRepository extends JpaRepository<ConversationReadState, Long> {

    Optional<ConversationReadState> findByConversation_IdAndUser_Id(Long conversationId, Long userId);
}
