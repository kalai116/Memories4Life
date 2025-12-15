package com.example.MeForLife.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

// Spring service, to denote this class has the business logic 
@Service
public class EmailService {

	// JavaMailSender interface simplifies sending emails through SMTP
	// its a convenient wrapper around the underlying Java Mail (Jakarta mail) API
	// JavaMailSender creates MimeMessage, delegates creation and sending 
    @Autowired
    private JavaMailSender mailSender;

    // creating a send mail method and passed in all the parameters required when drafting the email 
    public void sendChatExportEmail(String toEmail, String subject, String text, byte[] attachmentBytes, String fileName)  {
try {


	// Creating MimeMessage object to create the Mime style email (Multipurpose Internet Mail Extension)
	// it helps to create a email body that can accept text, attachment 
    MimeMessage message = mailSender.createMimeMessage();
    // Mimehelper helper class for populating a MimeMessage, true enables the attachment feature in an email 
    MimeMessageHelper helper = new MimeMessageHelper(message, true);

    // helper class sets vaues on behalf of MimeMEssage  
    // setting to email using setTo method, likewise setSubject and setText
    helper.setTo(toEmail);
    helper.setSubject(subject);
    helper.setText(text);

    // adding the attachment 
    // byteArray resource wraps the raw bytes so that Spring mail will consider it as attachment 
    // filename is provided  by the calling  cntroller when the email service is called
    helper.addAttachment(fileName, new ByteArrayResource(attachmentBytes));

    // send using the configured mail server, JavaMailSender handles the SMTP communication 
    mailSender.send(message);
}
catch (Exception e){
    e.printStackTrace();
}
    }
}
