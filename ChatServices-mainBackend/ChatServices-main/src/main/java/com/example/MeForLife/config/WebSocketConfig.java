package com.example.MeForLife.config;

// importing all the Spring annotation used to declare configuration classes 
// this class is a souce of bean definition 

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;
import org.springframework.web.socket.server.standard.ServletServerContainerFactoryBean;

// Marking this class as a spring confiiguration class 
// instructs Spring use this class to set up websocket chat, so that that the framework load it at the startup and apply websocket settings set here
@Configuration
// Enables Websocket message handling backed by a broker
// Activates STOMP over WebSocket so tht the users can send and receive messages real-time 
// with WebSocket and STOMP, we can use publish/subscribe messaging to topics instead of manually handling the socket 
@EnableWebSocketMessageBroker
// this class implements the interface so that i can override message routing and increasing the message size 
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

	 
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Prefix for subscriptions (topics)
    	// when the server send any message to the destination starting with /topic, the client who is subscribed to the topic 
    	// will receive the message 
        config.enableSimpleBroker("/topic");

        // Prefix for sending messages from client
        // this handles the incoming messages the client send to /app will be routd to the server the controller for handling it 
        // goes to @MessageMapping /chat.sendMessage       
        config.setApplicationDestinationPrefixes("/app");

    }

    @Override
    // defining the connection to the websocket for the clients to connect to start a websocket session 
    // without the registry there wont be entry door to the websocket connection 
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // WebSocket endpoint
    	// this the where the WebSocket connection can be made
        registry.addEndpoint("/ws")
        
        // lets any device with IP to connect to the websocket 
        // allow mobile/web clients
                .setAllowedOriginPatterns("*") 
                // when certain environment or browser who cant use real websockets fallback increases the reliability so the chat still works 
                .withSockJS(); // fallback for non-WebSocket clients

    }
    @Override
    // customised the method to increase the size limit and time limit that are default 
    public void configureWebSocketTransport(WebSocketTransportRegistration registry) {
        // default is around 64 * 1024 bytes (64 KB)
    	// message size limit is capped to 1MB because large message may delay in the delivery performance 
    	// to protect the server memory and stable performance capped the size
        registry.setMessageSizeLimit(1024 * 1024);        // 1 MB
        
        // limit the pending outgoing message data size per connection if the client receiving gets slow for any reason 
        // it will prevent the server from holding on endless message which will be a pressure on the server 
        registry.setSendBufferSizeLimit(1024 * 1024 * 2); // 2 MB
        
        // if a message didnt send within 20 secs the server considers sending failed, this will avoid keep the server busy for a longer duration 
        registry.setSendTimeLimit(20 * 1000);

    }


}
