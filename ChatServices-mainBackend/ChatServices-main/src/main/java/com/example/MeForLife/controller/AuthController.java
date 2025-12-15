package com.example.MeForLife.controller;


import com.example.MeForLife.entity.AuthResponse;
import com.example.MeForLife.entity.Conversation;
import com.example.MeForLife.entity.Messages;
import com.example.MeForLife.entity.User;
import com.example.MeForLife.repo.ConversationRepo;
import com.example.MeForLife.repo.MessagesRepo;
import com.example.MeForLife.repo.UserRepository;
import com.example.MeForLife.services.ChatExportService;
import com.example.MeForLife.services.EmailService;
import com.example.MeForLife.services.UserService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

// ------------------- Controller ----------------------
// Controller is just like an entry point that handles all the incoming requests 
// for eg: Imagine the controller is like a reception desk, all the people who want to access the building for different reasons has to go 
// through the reception. Anyone who approaches reception like React Native or client for signup, login, to start conv etc 
// the receptionist decides the the information what is required to proceed, which service user is looking for and what response to give 

// annotation to inform the spring this class is a REST controller that allows API requests from any origin and 
// every Restmapping method returns data directly as JSON
@RestController
@CrossOrigin(origins = "*") // allow requests from React Native in my case for eg: Postman
public class AuthController {

	// it helps to inject dependencies required for user service
	// the annotation tells the Spring to automatically inject an instance of the beans services and repositories from 
	// the application context, through this the controller talks to the business logic and database layer 
	
	// UserService excapsulates the logic related to user like registerUser(sign-up), loginUser, userRepository, passwordEncoder
    @Autowired
    private UserService userService;

    // Conversation history repo is a Spring JPA (Java Persistence API) repository that provides database operations 
    // assistance for the conversation entity 
    @Autowired
    private ConversationRepo crepo;
    
    // user repo is used to fetch user info like username or email from DB
    @Autowired
    private UserRepository urepo;
    
    // it handles the CRUD and custom queries related to chat messages
    @Autowired
    private MessagesRepo mrepo;
    
    // Chatexportservice handles logic to render the messages to convert chats to an image and also gets converted to PDF later.
    // this class can use its export related business logic without manually creating or managing the object 
    @Autowired
    private ChatExportService chatExportService;
    
    // Spring supplies an Emailservice instance automatically so this class can send emails through its methods without manually drafting one  
    @Autowired
    private EmailService emailService;
    
    // when someone POST the request to sign-up Postmapping means they handle http POST requests 
    // Request body asks Spring to convert the JSON body to user object
    @PostMapping("/signup")
    public String registerUser(@RequestBody User user) {
    	// the converted user object goes to the registration logic to UserServices
    	// the service handles validates the user data, checks the record if user exist, password hashing, if new user register the user in the DB
    	// returns a response the registeration is successful if not the user already exist 
        return userService.registerUser(user);
    }
    
    // Endpoint for login. Runs this method when client send a POST request to /login 
    // After the spring converting the json tp user object 
    @PostMapping("/login")
    public AuthResponse loginUser(@RequestBody User user) {
        System.out.println("asdasdad "+user.getEmail());
        // now the login task is handed to the service layer for authentication, extract user email and password, both the info goes to 
        // userService loginuser checks the match for the email and password, after the check whatever is the output AuthResponse returns the
        // message is shown 
        return userService.loginUser(user.getEmail(), user.getPassword());

    }
    
    // After the successful login the flow gets the user to start the conv
    @PostMapping("/startconv")
    public String startConv(@RequestBody Conversation conv) {
    	// Chatlist with the list of users the user chat before, so the user repo gets the username of the user with whom the conversation was made
    	// hence we get the data from conv by using getReceiver method 
        Optional<String> userlist=urepo.getUserNname(conv.getReceiver());
        // As per the selection we pick the selected user's actual username and display 
        conv.setReceiver(userlist.get());
        // Date is stored so that we know when the conv started and its formatted to a String pattern dd-mm-yyyy so that it matches the UI expectation
        conv.setDateTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")));
        // Saving the conv lets the database to assign a conv id incase of new conv or helps to pull the old messages from the DB to prepare the 
        // chat screen load the old messages 
        crepo.save(conv);
        // gets the most recent conv sort by date pulls the recent and in the conv repo query to arrange the conv in descending order 
        List<Conversation> getRConv=crepo.getRecentConvIDByDate(conv.getSender());
        System.out.println("getRConv   "+getRConv.get(0).getCoversationId());
        // creating a JSON object to contain the recent conv and conv id, username for that conv id is names as conreceiver 
        // the return shows the conv id and receiver's username so that the frontend opens the correcct chat screen with the header
        JSONObject convObj= new JSONObject();
        // putting the conversation id of that conv which is indexed in 0 position (latest) that id is added to convObj
        convObj.put("coversationId",getRConv.get(0).getCoversationId());
        // same logic as above for getting username to put it in the convObj
        convObj.put("conreceiver",getRConv.get(0).getReceiver());
        return convObj.toString();
    }

    // GetMapping allows the client to request data using the /getConv path
    // the app lists the conversation if there is any existing conversation available for a user
    // RequestParam expects a query from sender 
    @GetMapping("/getConv")
    public List<Conversation> getConv(@RequestParam String sender){
    	// Conv repo is called to fetch the conversation where the sender is involved
     List<Conversation> convList=crepo.getConv(sender);
        System.out.println(" convList "+convList.toString());
        // show the conv list
     return convList;
    }

    // Maps messages sent by Websocket clients to the method 
    // when client sends messages to app/chat.sendMessage this method gets invoked
    // for eg: Websocket is just like a restaurant open for communicating freely, STOMP is like a waiter I can guide the waiter where to 
    // deliver the message, topic is the table where users sit, the user sitting in the target table gets the message 
    // @MessageMapping is telling the waiter the message what i want to send 
    // @SendTo is the waiter delivering the message to the table/topic 
    @MessageMapping("/chat.sendMessage") // when client sends to /app/chat.sendMessage
    @SendTo("/topic/public")             // broadcast to all subscribers
    public Messages sendMessage(@RequestBody  Messages chatMessage) {
        System.out.println("chatMessage " +chatMessage.getChatimage());
        	// we attach the current date and time to the server 
                chatMessage.setDateTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")));
                // attaching the time in the said format 
                chatMessage.setChatTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm")));
                // every message is saved in the database as the data persistance is required
                // its essential that all the old messages are recorded to make the system reliable 
                mrepo.save(chatMessage);
                // As the messages are grouped by date I want the date to appear once and the messages grouped in that date 
                // eacch time the date dont have to send 
                chatMessage.setDateTime(null);
        return chatMessage;
    }

    // this method handles POST request sent to /sendImage
    // it receives messages that contains images (scribbled message ) from the client adds a timestamp, saves to the DB and 
    // returns the saved message, in the chat screen the image gets sent to the receiver 
    
    @PostMapping("/sendImage")
    public Messages sendImage(@RequestBody  Messages chatMessage) {
        System.out.println("chatMessage " +chatMessage.getChatimage());
        chatMessage.setDateTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy"))); // this sets only date 
        chatMessage.setChatTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm"))); // this sets only time 
        mrepo.save(chatMessage);
        chatMessage.setDateTime(null);
        return chatMessage;
    }
    
    // et API endpoint defined at /getPvtMessage
    // the method fetches all the messages for the conv id from the databse 
    
    @GetMapping("/getPvtMessages")
   public List<Messages> getMessagesByConvID(@RequestParam String Convid){
        System.out.println("getMessagesByConvID "+Convid);
        List<Messages> mesgList=mrepo.getConvsByID(Convid);
        // the logic loops through the message list and checks if the array of messages, indexed in 0 for eg has date 08/12/2025 and the 
        // next index date also the same then the date is set to nul for the consecutive messages 
        // this avoid date duplication 
        String checkDate="";
        for (int i=0; i<mesgList.size(); i++){

            if (checkDate.equalsIgnoreCase(mesgList.get(i).getDateTime().trim())){

                mesgList.get(i).setDateTime(null);
            }
            else {
                checkDate=mesgList.get(i).getDateTime().trim();
            }
        }
    return mesgList ;
   }

    // Get endpoint 
    // Response body contains the byte [], byte[] is a raw image file as this method is intend to convert the chat to image
    // the method expects the parameters convid, date and the logged user as the method also sends an email to the user the export 	
    // the method basically first prepares the image and makes to ready to be sent over JSON to client for download and email the user 
    @GetMapping("/chat-image")
    public ResponseEntity<byte[]> exportChat(
            @RequestParam Long conversationID,
            @RequestParam String date,
            @RequestParam String loggedUser
    ) {
        try {
        	// JPA query to look for email address, checking if the email address for the logged user is available
            Optional<String> userlist=urepo.getEmailByUser(loggedUser); // get logged in user's email address, repo looks up for the same 
            // calls the ChatExportService from the service layer, export as per conv id, date and hardcoded template resource 
            // and logged user to further email the respective user, conversion of the chat to image happens there
            // BufferedImage is from Java AWT (Abstract Window Toolkit) help render the chat messages visually and generate a screenshot like image of the conversation 
            BufferedImage img =
                    chatExportService.exportChatImage(conversationID, date, "Temp1", loggedUser);
            // Convert image to png 
            // ImageIO.write helps to convert image to bytes 
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(img, "png", baos);
            // the client is told the return type is a png image file 
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_PNG);

// 2. Email the export
            String subject = "Chat Export - " + System.currentTimeMillis();
            // Calling Email service to send an email to the logged user 
            emailService.sendChatExportEmail(
                    userlist.get(), // logged user (the recipients email 
                    subject, 
                    "Your exported chat is attached. Thank you for your gift purchase"+subject, // email subject
                    baos.toByteArray(), // bringing the image as an attachment 
                    subject+".png"  // attachments name 
            );
            // client directly receives the image as a response (logic in RN to save the file using the RNFS )
            return new ResponseEntity<>(baos.toByteArray(), headers, HttpStatus.OK);
            //handle the error accordingly 
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
// similar to the export chat-image the structure is same however i used PDF library to convert image to pdf 
    
    @GetMapping("/chat-pdf")
    public ResponseEntity<byte[]> exportChatPDF(
            @RequestParam Long conversationID,
            @RequestParam String date,
            @RequestParam String loggedUser
    ) {
        try {
        	// service converts the image to pdf and returns s a byte
            BufferedImage chatImage = chatExportService.exportChatImage(
                    conversationID, date, "Temp1", loggedUser
            );

            byte[] pdfBytes = chatExportService.convertImageToPDF(chatImage);
            // this the alert content we see in the app when we export 
            // its a PDF file, the content must be downloaded, name of the file 
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.set(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=chat_export.pdf");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

}
