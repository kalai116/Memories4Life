package com.example.MeForLife.services;

import com.example.MeForLife.entity.Messages;
import com.example.MeForLife.repo.MessagesRepo;
import org.springframework.stereotype.Service;
import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.geom.RoundRectangle2D;
import java.awt.image.BufferedImage;
import java.awt.font.FontRenderContext;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.Base64;
import java.util.List;

// ChatExportService class is responsible for converting the selected conversation, chat screenshot as BufferedImage and converting that image to a PDF
// the service class takes care of all the backend process required to perform the action and controller will be only calling this service
// controller will pass the conversation which need to exported to an image as per the passed in conversation ID messages will be retrieved and 
// process goes on from there 

@Service
public class ChatExportService {

	// I declared reference for MessagesRepo, to fetch the messages for the reapective conversation ID
    private final MessagesRepo messageRepository;

    // passed in the MessagesRepo as a parameter in the class so that we can call for this repo to retrieve the messages data from DB
    // As the MessagesRepo extends JPA repository (Spring managed bean) and through @Service this class also Spring managed bean hence Spring 
    // can wie the connection automatically 
    public ChatExportService(MessagesRepo messageRepository) {
        this.messageRepository = messageRepository;
    }

    // ---------------------------------------------------------------
    // Helper function to clean base64 (removes prefix if present)
    // ---------------------------------------------------------------
    private byte[] cleanBase64(String input) { 

    	// if no input is found returns null no need to perorm the below removing prefix thingy avoids crashing 
        if (input == null || input.trim().isEmpty()) return null;
        // As base64 decoding even considers spaces, trimming them to avoid crashing 
        input = input.trim();

        // Remove "data:image/...;base64," prefix if exists
        
        // incase of getting the base64 with these prefixes for browsers its ok however for base64 decoding i must be without any extras 
        // must be a plain actual data 
        // for eg: data:image/png;base64,iVBORw0KGxxxxx series of alphabets, here data describes protocol like http, ftp etc,type image/png or image/jpeg,
        // base64 encoding of the data, and the last part is the actual data so we dont need anything as base64 decoder accepts only that actual data
        if (input.startsWith("data:image")) {
        	// declaring sommaindex as int and finding the index position of the comma the seperator after the comma is the actual data 
        	// find that index and assign to commaindex
            int commaIndex = input.indexOf(",");
            // if no commaindex is found returns -1, if commaindex exist 
            // now the input should be assigned as an input which goes from 0+1  throughout the end must be set as the new input now along with comma 
            // all the data prior to that will be ignored 
            if (commaIndex != -1) {
                input = input.substring(commaIndex + 1);
            }
        }

        // Remove any whitespace or newlines
        input = input.replace("\n", "")
                .replace("\r", "")
                .replace(" ", "")
                .trim();

        return Base64.getDecoder().decode(input);
    }

    // ---------------------------------------------------------------
    // Export Chat Image
    // ---------------------------------------------------------------
    
    // set parameters to go into, for preparing the BufferedImage
    public BufferedImage exportChatImage(Long conversationId,
                                         String date,
                                         String backgroundKey,
                                         String loggedUser) throws Exception {

        // ---------------- FETCH MESSAGES ----------------
    	// We make a list of the messages we will fetch for this convid and date 
    	// As explained before the repos extend JPA hence Spring data JPA gives us access to these methods, even though we didnt write the query
    	// to fetch the data its auto done and Spring understands it and break it accordingly to get the messages in the order required 
        List<Messages> messages =
                messageRepository.findByConversationIDAndDateTimeOrderByDateTimeAsc(conversationId, date);

        // empty messages are handled and stopped here to avoid empty gifts 
        if (messages.isEmpty()) {
            throw new RuntimeException("No messages found for this date.");
        }

        // ---------------- LOAD BACKGROUND ----------------
        // these are the accepted image extensions for using in the background (for now i hardcoded a bg )
        String[] extensions = {".png", ".jpg", ".jpeg"};
        // declaring a variable for background its set null because be default
        BufferedImage bgImage = null;
        
        // locate the background file by looping through possible extention excepted 
        // I wanted to make the background to be in any of this format in the future even though i hardcoded for now in the future i want to accept 
        // other formats 
        for (String ext : extensions) {
        	// attempts to find the bg from the resources folder inside app and the method accepts resourceName as parameters 
        	// No local path needed 
            InputStream is = getClass().getResourceAsStream("/chat-backgrounds/" + backgroundKey + ext);
            // if the file exist to check whether the file type fis into either f the extension accepted 
            if (is != null) {
            	// if exist convert the raw image to BufferedImage as only the bufferedimage can be used by java for graphics rendering 
                bgImage = ImageIO.read(is);
                break;
            }
        }
        // catches error to ensure the background is choosen as the export may not proceed without the background 
        if (bgImage == null) {
            throw new RuntimeException("Background not found: " + backgroundKey);
        }
        
        // storing the images width and height to create a block (an empty frame to fit the image)
        int width = bgImage.getWidth();
        int height = bgImage.getHeight();

        // ---------------- SETUP OUTPUT CANVAS ----------------
        // using the width and height created an object for the bufferedimage
        BufferedImage output = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        // creating a frame for the image which will be created as per the width and height seeked from the above object
        // creating an object for graphics2D class it helps to create a blank surface where we can add text, image or shapes
        Graphics2D g = output.createGraphics();

        // method to render the graphics image,used KEY_ANTIALIASING from RenderingHints class to give that curve and smopth edges feel 
        // VALUE_ANTIALIAS_ON antialias is turned on to give a quality image as I choose good quality image over speed
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        // drawImage method for layered drawing the image as the text, image etc are drawn over another image
        // the content is layered on top of the bgImage by default the drawing starts from top-left corner. it must consider the bg's width 
        // height to avoid poor layout
        g.drawImage(bgImage, 0, 0, width, height, null);

        // declaring the variables for layout control
        int y = 150; // vertical spacing on the top
        int maxBubbleWidth = width - 300; // setting the max width value for test bubble to avoid the bubble taking the whole screen, this wraps the message within this
        int minBubbleWidth = 250;   // to ensure even the short messages doesnt show too tiny it must be in a min range for good interface

        Font msgFont = new Font("SansSerif", Font.PLAIN, 28); // font style standard for text, date and time
        Font timeFont = new Font("SansSerif", Font.PLAIN, 20); // size is as per the readability
        Font dateFont = new Font("SansSerif", Font.BOLD, 32); // date is bold and sized to 32 for more prompt view 

        // ---------------- DATE HEADER ----------------
        // setting the date font to the graphic canvas created above
        g.setFont(dateFont);
        // created a variable dw(date width), used  FontMetrics and stringWidth method to calculate how wide the date text will be in pixel
        // based on the current width set and passed to the method 
        int dw = g.getFontMetrics().stringWidth(date);

        // setting the colour for the graphics off-white
        g.setColor(new Color(255, 255, 255, 220));
        // fill the graphics with centered rectangle with rounded corners, align the date text in the mid of the screen and behind the date will be the background 
        g.fillRoundRect((width - dw - 40) / 2, 50, dw + 40, 70, 25, 25);

        // setting the colour of anything written on the screen is going to be black
        // as the background is off-white i chhose black fro better visibility 
        g.setColor(Color.BLACK);
        // method to draw text on top of the image in java 
        // gonna consist of date text in the center coonsidering the x and y axis of the screen place the date inn the middle horizontally
        g.drawString(date, (width - dw) / 2, 100);

        g.setFont(msgFont);

        // ---------------- LOOP MESSAGES ----------------
        // looping through each messages
       
        for (Messages msg : messages) {

        	// to checks whether the message was sent by the logged user to determine the sender 
        	// as that decides the alignment of the messages visually when fetching the data of messages
            boolean isSender = msg.getSender().equalsIgnoreCase(loggedUser);

            // **********************************************************
            // A. TEXT MESSAGE
            // **********************************************************
            // the msg content must not be empty, only the content it must proceed
            if (msg.getcontent() != null && !msg.getcontent().trim().isEmpty()) {

            	// extract message content to a text variable
                String text = msg.getcontent();
                // calculate how width the text will be in pixel so that bubble size adapts the text length
                int textWidth = g.getFontMetrics().stringWidth(text);

                // declared variable to calculate bubble width, set the max and min to handle the large messages to wrap and tiny messages
                // to stay in a min size atleast just visually layout good and padding to avoid text touching the edges 
                int bubbleWidth = Math.max(minBubbleWidth,
                        Math.min(maxBubbleWidth, textWidth + 50));

                int bubbleHeight = 110;
                

                // horizonal positioning of the bubble by deciding if its a sender 
                // deciding the bubble color and text color by checking whether its a sender or not if sender all the below applies 
                // sender bubble goes right, bubble colour blue. text color white
                // if not a sender bubble goes left, colour is white and text black
                int bubbleX = isSender
                        ? width - bubbleWidth - 50
                        : 50;

                Color bubbleColor = isSender
                        ? new Color(0, 132, 255, 240)
                        : new Color(255, 255, 255, 240);

                Color textColor = isSender ? Color.WHITE : Color.BLACK;

                // As per the decisiion draw the bubble colour and rounded rectangle 
                g.setColor(bubbleColor);
                g.fillRoundRect(bubbleX, y, bubbleWidth, bubbleHeight, 35, 35);

                // set the colour of text 
                g.setColor(textColor);
                g.drawString(text, bubbleX + 20, y + 45);

                g.setFont(timeFont);
                g.drawString(msg.getChatTime(), bubbleX + 20, y + 80);

                g.setFont(msgFont);

                y += bubbleHeight + 25;
            }

            // **********************************************************
            // B. IMAGE MESSAGE (Base64)
            // **********************************************************
            // ============================
// B. IMAGE MESSAGE (Base64)
// ============================
            // checking to ensure the chat image is found and not empty 
            if (msg.getChatimage() != null && !msg.getChatimage().isEmpty()) {

                try {
                	// convert base64 (already cleaned prefixes) chat image to a bytes image 
                    byte[] imgBytes = cleanBase64(msg.getChatimage());
                    // creating an object to store the chat image, converted from bytes to an image so that we can draw 
                    BufferedImage chatImg =
                            ImageIO.read(new ByteArrayInputStream(imgBytes));

                    // checking if the chatimg is in the right format and loaded 
                    if (chatImg != null) {

                    	// setting the max size the image can take up in the message window                    	
                        int maxImgSize = 350;  
                        // declaring the width and height of the bufferedimage using in built getwidth and getheight method 
                        int originalW = chatImg.getWidth();
                        int originalH = chatImg.getHeight();

                        // ---- SCALE PROPORTIONALLY ----
                        // declaring the scale at which the image max can shrink to fit 
                        // the image 350 as maxImgsize for example if 1000 was width, 350/1000=0.35 and height 350/600=0.58
                        // Math.min picks th min and picks 0.35 which is the max it can shrink
                        double scale = Math.min(
                                (double) maxImgSize / originalW,
                                (double) maxImgSize / originalH
                        );

                        // declaring the final width and height and calculating the same after scaling 
                        // calculated the scale factor above is applied to the original image dimension 
                        // the image fits the alloed dimension ensuring the aspect ratio is intact 
                        int imgRenderW = (int) (originalW * scale);
                        int imgRenderH = (int) (originalH * scale);

                        // ---- LEFT / RIGHT ALIGN ----
                        // after fixing the image message proportion, width, height etc 
                        // deciding whether the bubble must align on to the left right by checking if logged user is a sender or not 
                        int bubbleX = isSender
                                ? width - imgRenderW - 80
                                : 50;

                        // ---- DRAW ROUNDED IMAGE ----
                        // creating a transparent image buffer considers the final width and height
                        // used TYPE_INT_ARGB to get the transparency which has rounded corner 
                        // this is the same kind of setup done above 
                        BufferedImage rounded = new BufferedImage(imgRenderW, imgRenderH, BufferedImage.TYPE_INT_ARGB);
                        Graphics2D rg = rounded.createGraphics();
                        rg.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

                       // creating a rounded rectangle that seeks the image size 
                        Shape clipShape = new RoundRectangle2D.Double(0, 0, imgRenderW, imgRenderH, 30, 30);
                        // setting the clipshape on the graphics object rg to use it for drawing on it 
                        // anything beyond this area will be invisible 
                        rg.setClip(clipShape);
                        // the clipshape is already applied to the graphics object, draw the chat image within this for a more
                        // finished and smoother visual
                        rg.drawImage(chatImg, 0, 0, imgRenderW, imgRenderH, null);
                        // release the graphics context once the drawing operations are finished 
                        rg.dispose();

                        // after deciding the sender/receiver considering the logic now we can draw the rounded image on the canvas for export 
                        // on the bubbleX and Y axis 
                        g.drawImage(rounded, bubbleX, y, null);

                        // ---- TIME TEXT UNDER IMAGE ----
                        // setting the time font,colour and 
                        g.setFont(timeFont);
                        g.setColor(Color.WHITE);
                        // drawing the chattime and positioned it, padded 10 too touch the time too close to the edge 
                        // render the height and position date text under the image 
                        g.drawString(msg.getChatTime(), bubbleX + 10, y + imgRenderH + 30);

                        // setting the msgfont back so that the next message picks the right font 
                        g.setFont(msgFont);

                        // ---- SPACING AFTER IMAGE ----
                        // after this image message the next message most have enough spacing in between to give a visually correct layout
                        // rendered imageheight = 80 for the padding timestamp and space between the 2 messages to avoid overlapping 
                        y += imgRenderH + 80;
                    }

                } catch (Exception e) {
                    System.out.println("Invalid Base64 image");
                }
            }

        }

        g.dispose();
        return output;
    }
    // convert buffered image to a PDF file raw bytes
    public byte[] convertImageToPDF(BufferedImage image) throws Exception {

    	// creating a variable to hold converted PDF bytes
    	// ByteArrayOutputStream class to implement an output stream to write the data to it in bytes array
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        // using com.lowagie.text package in which i used document class which prepares a generic document which is just like a notebook
        // with pages and place to add contents, creating an object to manage the content
        com.lowagie.text.Document document =
        		// creating a new document as each export request must create a new PDF document 
        		// using rectangle class from the package, preparing the pages in the pdf rectangle figure to specify the size
        		// As we already set the width and the height as per the image we use that to define the page
        		// to avoid the white spacing around i have set all the sides margin 0 left right top bottom
                new com.lowagie.text.Document(
                        new com.lowagie.text.Rectangle(image.getWidth(), image.getHeight()),
                        0, 0, 0, 0
                );

        // i have the dicument ready and the output destination baos however i need pefwriter class to write the content the way the pdf 
        // file must be structured it needs the required internal setup to proceed with the action hence used getInstance method to 
        // pass in the document structure and output destination baos 
        // so now i have the document is connected to the output stream, anything layed in this document becomes PDF bytes in baos
        com.lowagie.text.pdf.PdfWriter writer =
                com.lowagie.text.pdf.PdfWriter.getInstance(document, baos);

        // open the document created to start writing the content 
        document.open();

        // converting the bufferedimage as a pdf compatible image, in the chatimage the image is in Java graphics form but pdf require
        // animage that is understanable by the PDF library 
        com.lowagie.text.Image pdfImage =
                com.lowagie.text.Image.getInstance(image, null);

        // scale the pdfimage to fit the whole page
        pdfImage.scaleToFit(image.getWidth(), image.getHeight());
        // by default the pdf coordinate system start from bottom left hence set to absolute position to start from top left
        pdfImage.setAbsolutePosition(0, 0);

        // add method to pass in the pdfimage in the PDF document 
        document.add(pdfImage);
        // close method helps to seal and finalise the PDF structure. completes the pdf format 
        document.close();

        // returns pdf document as raw byte 
        // toByteArray method helps to retrieve data from the baos and make it available for user access 
        return baos.toByteArray();
    }

}
