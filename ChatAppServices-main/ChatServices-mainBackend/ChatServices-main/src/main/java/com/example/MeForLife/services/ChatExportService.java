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

@Service
public class ChatExportService {

    private final MessagesRepo messageRepository;

    public ChatExportService(MessagesRepo messageRepository) {
        this.messageRepository = messageRepository;
    }

    // ---------------------------------------------------------------
    // Helper function to clean base64 (removes prefix if present)
    // ---------------------------------------------------------------
    private byte[] cleanBase64(String input) {

        if (input == null || input.trim().isEmpty()) return null;

        input = input.trim();

        // Remove "data:image/...;base64," prefix if exists
        if (input.startsWith("data:image")) {
            int commaIndex = input.indexOf(",");
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
    public BufferedImage exportChatImage(Long conversationId,
                                         String date,
                                         String backgroundKey,
                                         String loggedUser) throws Exception {

        // ---------------- FETCH MESSAGES ----------------
        List<Messages> messages =
                messageRepository.findByConversationIDAndDateTimeOrderByDateTimeAsc(conversationId, date);

        if (messages.isEmpty()) {
            throw new RuntimeException("No messages found for this date.");
        }

        // ---------------- LOAD BACKGROUND ----------------
        String[] extensions = {".png", ".jpg", ".jpeg"};
        BufferedImage bgImage = null;

        for (String ext : extensions) {
            InputStream is = getClass().getResourceAsStream("/chat-backgrounds/" + backgroundKey + ext);
            if (is != null) {
                bgImage = ImageIO.read(is);
                break;
            }
        }

        if (bgImage == null) {
            throw new RuntimeException("Background not found: " + backgroundKey);
        }

        int width = bgImage.getWidth();
        int height = bgImage.getHeight();

        // ---------------- SETUP OUTPUT CANVAS ----------------
        BufferedImage output = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = output.createGraphics();

        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.drawImage(bgImage, 0, 0, width, height, null);

        int y = 150;
        int maxBubbleWidth = width - 300;
        int minBubbleWidth = 250;   // ⭐ FIX: Ensures proper right alignment

        Font msgFont = new Font("SansSerif", Font.PLAIN, 28);
        Font timeFont = new Font("SansSerif", Font.PLAIN, 20);
        Font dateFont = new Font("SansSerif", Font.BOLD, 32);

        // ---------------- DATE HEADER ----------------
        g.setFont(dateFont);
        int dw = g.getFontMetrics().stringWidth(date);

        g.setColor(new Color(255, 255, 255, 220));
        g.fillRoundRect((width - dw - 40) / 2, 50, dw + 40, 70, 25, 25);

        g.setColor(Color.BLACK);
        g.drawString(date, (width - dw) / 2, 100);

        g.setFont(msgFont);

        // ---------------- LOOP MESSAGES ----------------
        for (Messages msg : messages) {

            boolean isSender = msg.getSender().equalsIgnoreCase(loggedUser);

            // **********************************************************
            // A. TEXT MESSAGE
            // **********************************************************
            if (msg.getcontent() != null && !msg.getcontent().trim().isEmpty()) {

                String text = msg.getcontent();
                int textWidth = g.getFontMetrics().stringWidth(text);

                int bubbleWidth = Math.max(minBubbleWidth,
                        Math.min(maxBubbleWidth, textWidth + 50));

                int bubbleHeight = 110;

                int bubbleX = isSender
                        ? width - bubbleWidth - 50
                        : 50;

                Color bubbleColor = isSender
                        ? new Color(0, 132, 255, 240)
                        : new Color(255, 255, 255, 240);

                Color textColor = isSender ? Color.WHITE : Color.BLACK;

                g.setColor(bubbleColor);
                g.fillRoundRect(bubbleX, y, bubbleWidth, bubbleHeight, 35, 35);

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
            if (msg.getChatimage() != null && !msg.getChatimage().isEmpty()) {

                try {
                    byte[] imgBytes = cleanBase64(msg.getChatimage());
                    BufferedImage chatImg =
                            ImageIO.read(new ByteArrayInputStream(imgBytes));

                    if (chatImg != null) {

                        int maxImgSize = 350;  // ⭐ MUCH BETTER SIZE
                        int originalW = chatImg.getWidth();
                        int originalH = chatImg.getHeight();

                        // ---- SCALE PROPORTIONALLY ----
                        double scale = Math.min(
                                (double) maxImgSize / originalW,
                                (double) maxImgSize / originalH
                        );

                        int imgRenderW = (int) (originalW * scale);
                        int imgRenderH = (int) (originalH * scale);

                        // ---- LEFT / RIGHT ALIGN ----
                        int bubbleX = isSender
                                ? width - imgRenderW - 80
                                : 50;

                        // ---- DRAW ROUNDED IMAGE ----
                        BufferedImage rounded = new BufferedImage(imgRenderW, imgRenderH, BufferedImage.TYPE_INT_ARGB);
                        Graphics2D rg = rounded.createGraphics();
                        rg.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

                        Shape clipShape = new RoundRectangle2D.Double(0, 0, imgRenderW, imgRenderH, 30, 30);
                        rg.setClip(clipShape);
                        rg.drawImage(chatImg, 0, 0, imgRenderW, imgRenderH, null);
                        rg.dispose();

                        g.drawImage(rounded, bubbleX, y, null);

                        // ---- TIME TEXT UNDER IMAGE ----
                        g.setFont(timeFont);
                        g.setColor(Color.WHITE);
                        g.drawString(msg.getChatTime(), bubbleX + 10, y + imgRenderH + 30);

                        g.setFont(msgFont);

                        // ---- SPACING AFTER IMAGE ----
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
    public byte[] convertImageToPDF(BufferedImage image) throws Exception {

        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        com.lowagie.text.Document document =
                new com.lowagie.text.Document(
                        new com.lowagie.text.Rectangle(image.getWidth(), image.getHeight()),
                        0, 0, 0, 0
                );

        com.lowagie.text.pdf.PdfWriter writer =
                com.lowagie.text.pdf.PdfWriter.getInstance(document, baos);

        document.open();

        com.lowagie.text.Image pdfImage =
                com.lowagie.text.Image.getInstance(image, null);

        pdfImage.scaleToFit(image.getWidth(), image.getHeight());
        pdfImage.setAbsolutePosition(0, 0);

        document.add(pdfImage);
        document.close();

        return baos.toByteArray();
    }

}
