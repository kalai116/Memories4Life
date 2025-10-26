package com.example.chatapp.service;

import com.example.chatapp.dto.ConversationDto;
import com.example.chatapp.dto.CreateConversationRequest;
import com.example.chatapp.dto.LoginRequest;
import com.example.chatapp.dto.MarkConversationReadRequest;
import com.example.chatapp.dto.MessageDto;
import com.example.chatapp.dto.SendMessageRequest;
import com.example.chatapp.dto.TypingDto;
import com.example.chatapp.dto.UserDto;
import com.example.chatapp.entity.Conversation;
import com.example.chatapp.entity.Message;
import com.example.chatapp.entity.ConversationReadState;
import com.example.chatapp.entity.User;
import com.example.chatapp.repository.ConversationRepository;
import com.example.chatapp.repository.MessageRepository;
import com.example.chatapp.repository.ConversationReadStateRepository;
import com.example.chatapp.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class ChatService {

    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final ConversationReadStateRepository conversationReadStateRepository;
    private final ChatSocketService chatSocketService;

    public ChatService(UserRepository userRepository,
                       ConversationRepository conversationRepository,
                       MessageRepository messageRepository,
                       ConversationReadStateRepository conversationReadStateRepository,
                       ChatSocketService chatSocketService) {
        this.userRepository = userRepository;
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.conversationReadStateRepository = conversationReadStateRepository;
        this.chatSocketService = chatSocketService;
    }

    @Transactional
    public User registerUser(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User payload is required");
        }

        String email = StringUtils.trimWhitespace(user.getEmail());
        String username = StringUtils.trimWhitespace(user.getUsername());
        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException("Email is required");
        }
        if (!StringUtils.hasText(username)) {
            throw new IllegalArgumentException("Username is required");
        }

        Optional<User> existing = userRepository.findByEmailIgnoreCase(email);
        Optional<User> usernameOwner = userRepository.findByUsernameIgnoreCase(username);
        if (existing.isPresent()) {
            User stored = existing.get();
            if (usernameOwner.isPresent() && !Objects.equals(usernameOwner.get().getId(), stored.getId())) {
                throw new IllegalArgumentException("Username already in use");
            }
            stored.setUsername(username);
            stored.setEmail(email.toLowerCase());
            return userRepository.save(stored);
        }

        if (usernameOwner.isPresent()) {
            throw new IllegalArgumentException("Username already in use");
        }

        user.setUsername(username);
        user.setEmail(email.toLowerCase());
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public User login(LoginRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Login payload is required");
        }

        String email = StringUtils.trimWhitespace(request.getEmail());
        if (StringUtils.hasText(email)) {
            return userRepository.findByEmailIgnoreCase(email.toLowerCase())
                    .orElseThrow(() -> new EntityNotFoundException("User not found for email: " + email));
        }

        String username = StringUtils.trimWhitespace(request.getUsername());
        if (StringUtils.hasText(username)) {
            return userRepository.findByUsernameIgnoreCase(username)
                    .orElseThrow(() -> new EntityNotFoundException("User not found for username: " + username));
        }

        throw new IllegalArgumentException("Either email or username must be provided");
    }

    @Transactional(readOnly = true)
    public List<ConversationDto> getConversations(Long userId) {
        User user = getUserOrThrow(userId);
        List<Conversation> conversations = conversationRepository.findAllForUser(user.getId());
        return conversations.stream()
                .map(conversation -> toConversationDto(conversation, user.getId()))
                .collect(Collectors.toList());
    }

    @Transactional
    public ConversationDto createConversation(CreateConversationRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Conversation payload is required");
        }

        User initiator = getUserOrThrow(request.getInitiatorId());
        User target = resolveTargetUser(request);

        if (Objects.equals(initiator.getId(), target.getId())) {
            throw new IllegalArgumentException("Cannot start a conversation with yourself.");
        }

        Optional<Conversation> existing = conversationRepository.findExistingBetween(initiator.getId(), target.getId());
        Conversation conversation = existing.orElseGet(Conversation::new);

        conversation.addParticipant(initiator);
        conversation.addParticipant(target);
        if (StringUtils.hasText(request.getTitle())) {
            conversation.setTitle(request.getTitle());
        }
        conversation.touch();

        Conversation saved = conversationRepository.save(conversation);
        ConversationDto dto = toConversationDto(saved, initiator.getId());
        chatSocketService.broadcastConversation(dto);
        return dto;
    }

    @Transactional(readOnly = true)
    public List<MessageDto> getMessages(Long conversationId) {
        Conversation conversation = getConversationOrThrow(conversationId);
        return messageRepository.findByConversation_IdOrderByCreatedAtAsc(conversation.getId())
                .stream()
                .map(this::toMessageDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageDto sendMessage(Long conversationId, SendMessageRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Send message payload is required");
        }

        Conversation conversation = getConversationOrThrow(conversationId);
        User sender = getUserOrThrow(request.getSenderId());

        if (!conversation.getParticipants().contains(sender)) {
            throw new IllegalArgumentException("Sender is not part of the conversation");
        }

        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setContent(StringUtils.trimWhitespace(request.getContent()));

        if (!StringUtils.hasText(message.getContent())) {
            throw new IllegalArgumentException("Message content cannot be empty");
        }

        Message saved = messageRepository.save(message);
        conversation.touch();
        conversationRepository.save(conversation);
        updateReadState(conversation, sender, saved.getId());

        MessageDto dto = toMessageDto(saved);
        chatSocketService.broadcastMessage(dto, conversation.getParticipants());
        return dto;
    }

    @Transactional
    public ConversationDto markConversationAsRead(Long conversationId, MarkConversationReadRequest request) {
        if (request == null || request.getUserId() == null) {
            throw new IllegalArgumentException("Mark conversation read payload requires userId");
        }

        Conversation conversation = getConversationOrThrow(conversationId);
        User user = getUserOrThrow(request.getUserId());

        if (!conversation.getParticipants().contains(user)) {
            throw new IllegalArgumentException("User is not part of the conversation");
        }

        Long targetMessageId = request.getMessageId();
        Long lastMessageId;

        if (targetMessageId != null) {
            Message message = messageRepository.findById(targetMessageId)
                    .orElseThrow(() -> new EntityNotFoundException("Message not found: " + targetMessageId));
            if (!Objects.equals(message.getConversation().getId(), conversation.getId())) {
                throw new IllegalArgumentException("Message does not belong to the conversation");
            }
            lastMessageId = message.getId();
        } else {
            lastMessageId = messageRepository.findTopByConversation_IdOrderByCreatedAtDesc(conversation.getId())
                    .map(Message::getId)
                    .orElse(null);
        }

        updateReadState(conversation, user, lastMessageId);
        return toConversationDto(conversation, user.getId());
    }

    private User getUserOrThrow(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User id is required");
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));
    }

    private Conversation getConversationOrThrow(Long conversationId) {
        if (conversationId == null) {
            throw new IllegalArgumentException("Conversation id is required");
        }
        return conversationRepository.findById(conversationId)
                .orElseThrow(() -> new EntityNotFoundException("Conversation not found: " + conversationId));
    }

    private User resolveTargetUser(CreateConversationRequest request) {
        if (request.getTargetUserId() != null) {
            return getUserOrThrow(request.getTargetUserId());
        }
        if (StringUtils.hasText(request.getTargetEmail())) {
            return userRepository.findByEmailIgnoreCase(request.getTargetEmail().trim())
                    .orElseThrow(() -> new EntityNotFoundException("Target user not found for email: " + request.getTargetEmail()));
        }
        throw new IllegalArgumentException("Either targetUserId or targetEmail must be provided");
    }

    private void updateReadState(Conversation conversation, User user, Long lastReadMessageId) {
        if (conversation == null || user == null) {
            return;
        }
        ConversationReadState state = conversationReadStateRepository
                .findByConversation_IdAndUser_Id(conversation.getId(), user.getId())
                .orElseGet(() -> {
                    ConversationReadState created = new ConversationReadState();
                    created.setConversation(conversation);
                    created.setUser(user);
                    return created;
                });
        state.setLastReadMessageId(lastReadMessageId);
        state.setLastReadAt(LocalDateTime.now());
        conversationReadStateRepository.save(state);
    }

    private long calculateUnreadCount(Conversation conversation, Long userId) {
        if (conversation == null || userId == null) {
            return 0L;
        }
        Optional<ConversationReadState> optionalState =
                conversationReadStateRepository.findByConversation_IdAndUser_Id(conversation.getId(), userId);
        if (optionalState.isPresent()) {
            ConversationReadState state = optionalState.get();
            Long lastReadMessageId = state.getLastReadMessageId();
            if (lastReadMessageId != null) {
                return messageRepository.countByConversation_IdAndIdGreaterThan(conversation.getId(), lastReadMessageId);
            }
        }
        return messageRepository.countByConversation_Id(conversation.getId());
    }

    private ConversationDto toConversationDto(Conversation conversation) {
        return toConversationDto(conversation, null);
    }

    private ConversationDto toConversationDto(Conversation conversation, Long viewerId) {
        MessageDto lastMessage = messageRepository.findTopByConversation_IdOrderByCreatedAtDesc(conversation.getId())
                .map(this::toMessageDto)
                .orElse(null);

        List<UserDto> participants = conversation.getParticipants().stream()
                .map(this::toUserDto)
                .collect(Collectors.toList());

        long unreadCount = viewerId != null ? calculateUnreadCount(conversation, viewerId) : 0L;

        return new ConversationDto(
                conversation.getId(),
                conversation.getTitle(),
                conversation.getCreatedAt(),
                conversation.getUpdatedAt(),
                participants,
                lastMessage,
                unreadCount);
    }

    private MessageDto toMessageDto(Message message) {
        return new MessageDto(
                message.getId(),
                message.getConversation().getId(),
                message.getSender().getId(),
                message.getContent(),
                message.getCreatedAt());
    }

    private UserDto toUserDto(User user) {
        return new UserDto(user.getId(), user.getUsername(), user.getEmail());
    }

    @Transactional(readOnly = true)
    public void handleTypingSignal(Long conversationId, Long userId, boolean isTyping) {
        Conversation conversation = getConversationOrThrow(conversationId);
        User user = getUserOrThrow(userId);

        if (!conversation.getParticipants().contains(user)) {
            throw new IllegalArgumentException("User is not part of the conversation");
        }

        TypingDto typingDto = new TypingDto(
                conversation.getId(),
                user.getId(),
                isTyping,
                toUserDto(user));

        chatSocketService.broadcastTyping(typingDto, conversation.getParticipants(), user.getId());
    }
}
