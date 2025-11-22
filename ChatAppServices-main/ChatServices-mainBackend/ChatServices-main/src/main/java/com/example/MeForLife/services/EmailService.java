package com.example.MeForLife.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendChatExportEmail(String toEmail, String subject, String text, byte[] attachmentBytes, String fileName)  {
try {


    MimeMessage message = mailSender.createMimeMessage();
    MimeMessageHelper helper = new MimeMessageHelper(message, true);

    helper.setTo(toEmail);
    helper.setSubject(subject);
    helper.setText(text);

    helper.addAttachment(fileName, new ByteArrayResource(attachmentBytes));

    mailSender.send(message);
}
catch (Exception e){
    e.printStackTrace();
}
    }
}
