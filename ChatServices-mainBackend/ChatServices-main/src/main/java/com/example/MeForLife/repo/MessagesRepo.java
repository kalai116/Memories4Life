	package com.example.MeForLife.repo;

import com.example.MeForLife.entity.Messages;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MessagesRepo extends JpaRepository<Messages,Long> {
// helps to fetch all the messages belong to this conv id so that it load all the old messages of this id and display in the chat screen 

    @Query("SELECT m FROM Messages m WHERE m.conversationID= :conversationID")
    List<Messages> getConvsByID(@Param("conversationID") String conversationID);
    
// Spring automatically converts this method name to a SQL query, it simply finds all the messages for the conv id and date and sort in asc order 
    // in-built Spring Data JPA feature, method name derived query
    List<Messages> findByConversationIDAndDateTimeOrderByDateTimeAsc(
            Long conversationID,
            String dateTime
    );
}
