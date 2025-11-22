package com.example.MeForLife.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;
import org.springframework.web.socket.server.standard.ServletServerContainerFactoryBean;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Prefix for subscriptions (topics)
        config.enableSimpleBroker("/topic");

        // Prefix for sending messages from client
        config.setApplicationDestinationPrefixes("/app");

    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // WebSocket endpoint
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // allow mobile/web clients
                .withSockJS(); // fallback for non-WebSocket clients

    }
    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registry) {
        // default is around 64 * 1024 bytes (64 KB)
        registry.setMessageSizeLimit(1024 * 1024);        // 1 MB
        registry.setSendBufferSizeLimit(1024 * 1024 * 2); // 2 MB
        registry.setSendTimeLimit(20 * 1000);

    }


}
