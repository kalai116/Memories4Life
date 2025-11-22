package com.example.MeForLife.repo;

import com.example.MeForLife.entity.Messages;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MessagesRepo extends JpaRepository<Messages,Long> {


    @Query("SELECT m FROM Messages m WHERE m.conversationID= :conversationID")
    List<Messages> getConvsByID(@Param("conversationID") String conversationID);

    List<Messages> findByConversationIDAndDateTimeOrderByDateTimeAsc(
            Long conversationID,
            String dateTime
    );
}
