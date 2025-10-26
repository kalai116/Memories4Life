package com.example.chatapp.repository;

import com.example.chatapp.entity.Conversation;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("select distinct c from Conversation c join c.participants p where p.id = :userId order by c.updatedAt desc")
    List<Conversation> findAllForUser(@Param("userId") Long userId);

    @Query("""
            select distinct c from Conversation c
            join c.participants p1
            where p1.id in :participantIds
            group by c.id
            having count(distinct p1.id) = :expectedSize
            """)
    List<Conversation> findByParticipantIds(
            @Param("participantIds") Collection<Long> participantIds,
            @Param("expectedSize") long expectedSize);

    default Optional<Conversation> findExistingBetween(Long userA, Long userB) {
        return findByParticipantIds(List.of(userA, userB), 2).stream().findFirst();
    }
}
