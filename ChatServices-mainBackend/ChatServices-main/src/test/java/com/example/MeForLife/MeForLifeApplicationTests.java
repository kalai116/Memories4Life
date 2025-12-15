package com.example.MeForLife;

import com.example.MeForLife.controller.*;
import com.example.MeForLife.entity.*;
import com.example.MeForLife.repo.*;
import com.example.MeForLife.services.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/*@PostMapping("/sendImage")
public Messages sendImage(@RequestBody  Messages chatMessage) {
    System.out.println("chatMessage " +chatMessage.getChatimage());
    chatMessage.setDateTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")));
    chatMessage.setChatTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm")));
    mrepo.save(chatMessage);
    chatMessage.setDateTime(null);
    return chatMessage;
} */

//extending the class declared below with the mockito extensons to use it in the class
@ExtendWith(MockitoExtension.class)
class MeForLifeApplicationTests {

	//declaring a mock or fake repo to use in the testing 
	@Mock
	private UserRepository uRepo;
	
	@Mock
	private MessagesRepo mRepo;
	
	 @Mock
	 private ChatExportService chatExpoServ;
	 
	 @Mock
	 private EmailService emailService;
	 
	 @Mock
	 private UserService userService;

	 @InjectMocks
	 private AuthController authController;
	
	@Test
	void testScribbleMessage() {
		Messages msg = new Messages();
        msg.setChatimage("base64-image-data");

        // act
        Messages result = authController.sendImage(msg);

        // assert: repo called
        verify(mRepo, times(1)).save(any(Messages.class));

        // assert: time is set on stored message
        assertNotNull(msg.getChatTime());

        // assert: date is cleared in response
        assertNull(result.getDateTime());
        assertEquals("base64-image-data", result.getChatimage());
	
	}
	
	@Test
	void contextLoads() {
	}

}
