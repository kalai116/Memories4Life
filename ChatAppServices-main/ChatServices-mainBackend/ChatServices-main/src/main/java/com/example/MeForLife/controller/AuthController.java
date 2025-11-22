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

@RestController
@CrossOrigin(origins = "*") // allow requests from React Native
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private ConversationRepo crepo;
    @Autowired
    private UserRepository urepo;
    @Autowired
    private MessagesRepo mrepo;
    @Autowired
    private ChatExportService chatExportService;
    @Autowired
    private EmailService emailService;
    @PostMapping("/signup")
    public String registerUser(@RequestBody User user) {
        return userService.registerUser(user);
    }

    @PostMapping("/login")
    public AuthResponse loginUser(@RequestBody User user) {
        System.out.println("asdasdad "+user.getEmail());

        return userService.loginUser(user.getEmail(), user.getPassword());

    }
    @PostMapping("/startconv")
    public String startConv(@RequestBody Conversation conv) {
        Optional<String> userlist=urepo.getUserNname(conv.getReceiver());
        conv.setReceiver(userlist.get());
        conv.setDateTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")));

        crepo.save(conv);
        List<Conversation> getRConv=crepo.getRecentConvIDByDate(conv.getSender());
        System.out.println("getRConv   "+getRConv.get(0).getCoversationId());
        JSONObject convObj= new JSONObject();
        convObj.put("coversationId",getRConv.get(0).getCoversationId());
        convObj.put("conreceiver",getRConv.get(0).getReceiver());
        return convObj.toString();
    }

    @GetMapping("/getConv")
    public List<Conversation> getConv(@RequestParam String sender){
     List<Conversation> convList=crepo.getConv(sender);
        System.out.println(" convList "+convList.toString());
     return convList;
    }

    @MessageMapping("/chat.sendMessage") // when client sends to /app/chat.sendMessage
    @SendTo("/topic/public")             // broadcast to all subscribers
    public Messages sendMessage(@RequestBody  Messages chatMessage) {
        System.out.println("chatMessage " +chatMessage.getChatimage());

                chatMessage.setDateTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")));
                chatMessage.setChatTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm")));
                mrepo.save(chatMessage);
                chatMessage.setDateTime(null);
        return chatMessage;
    }

    @PostMapping("/sendImage")
    public Messages sendImage(@RequestBody  Messages chatMessage) {
        System.out.println("chatMessage " +chatMessage.getChatimage());
        chatMessage.setDateTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")));
        chatMessage.setChatTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm")));
        mrepo.save(chatMessage);
        chatMessage.setDateTime(null);
        return chatMessage;
    }
    @GetMapping("/getPvtMessages")
   public List<Messages> getMessagesByConvID(@RequestParam String Convid){
        System.out.println("getMessagesByConvID "+Convid);
        List<Messages> mesgList=mrepo.getConvsByID(Convid);
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

    @GetMapping("/chat-image")
    public ResponseEntity<byte[]> exportChat(
            @RequestParam Long conversationID,
            @RequestParam String date,
            @RequestParam String loggedUser
    ) {
        try {
            Optional<String> userlist=urepo.getEmailByUser(loggedUser);
            BufferedImage img =
                    chatExportService.exportChatImage(conversationID, date, "chat1", loggedUser);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(img, "png", baos);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_PNG);

// 2. Email the export
            String subject = "Chat Export - " + System.currentTimeMillis();

            emailService.sendChatExportEmail(
                    userlist.get(),
                    subject,
                    "Your exported chat is attached."+subject,
                    baos.toByteArray(),
                    subject+".png"
            );
            return new ResponseEntity<>(baos.toByteArray(), headers, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/chat-pdf")
    public ResponseEntity<byte[]> exportChatPDF(
            @RequestParam Long conversationID,
            @RequestParam String date,
            @RequestParam String loggedUser
    ) {
        try {
            BufferedImage chatImage = chatExportService.exportChatImage(
                    conversationID, date, "chat1", loggedUser
            );

            byte[] pdfBytes = chatExportService.convertImageToPDF(chatImage);

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
