package com.example.MeForLife.repo;

import com.example.MeForLife.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepo extends JpaRepository<Conversation,Long> {

	// Custom query to fetch all conversations where the user is either a sender or receiver 
	// so that the chat screen show all the conversation where the user is involved be it sender or receiver 
    @Query("SELECT c FROM Conversation c WHERE c.sender=:sender OR c.receiver=:sender")
    List<Conversation> getConv(@Param("sender") String sender);

    // fetching the conversation by date and sort it or arrange in descending order to get the latest first
    // after saving the new conversation we need to get the latest conversation id created for the sender 
    @Query("SELECT c  FROM Conversation c WHERE c.sender =:sender ORDER BY c.dateTime DESC LIMIT 1")
    List<Conversation> getRecentConvIDByDate(@Param("sender") String sender);
}
