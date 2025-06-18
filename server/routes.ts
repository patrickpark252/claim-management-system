import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertLogSchema } from "@shared/schema";
import multer from "multer";
import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";
import { exec } from "child_process";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all orders
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Get single order
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Create order
  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: "Invalid order data" });
    }
  });

  // Update order
  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.updateOrder(id, req.body);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Update order progress
  app.patch("/api/orders/:id/progress", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { progress } = req.body;
      
      const order = await storage.updateOrder(id, { progress });
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Create log entry
      await storage.createLog({
        orderId: id,
        action: "진행상황 업데이트",
        value: progress,
      });

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Update order processing
  app.patch("/api/orders/:id/processing", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { processing } = req.body;
      
      const order = await storage.updateOrder(id, { processing });
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Create log entry
      await storage.createLog({
        orderId: id,
        action: "처리내역 업데이트",
        value: processing,
      });

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update processing" });
    }
  });

  // Update order game code status
  app.patch("/api/orders/:id/gameCodeStatus", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { gameCodeStatus } = req.body;
      
      const order = await storage.updateOrder(id, { gameCodeStatus });
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update game code status" });
    }
  });

  // Update order memo
  app.patch("/api/orders/:id/memo", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { memo } = req.body;
      
      const order = await storage.updateOrder(id, { memo });
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update memo" });
    }
  });

  // Upload Excel file
  app.post("/api/upload-excel", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Function to extract hyperlink from cell
      const getHyperlinkOrValue = (rowIndex: number, colIndex: number, fallbackValue: any) => {
        const cellAddress = XLSX.utils.encode_cell({ r: rowIndex + 2, c: colIndex }); // +2 because we skip first 2 rows
        const cell = worksheet[cellAddress];
        
        // Check for hyperlink in multiple ways
        if (cell) {
          // Method 1: Direct hyperlink property
          if (cell.l && cell.l.Target) {
            return cell.l.Target;
          }
          
          // Method 2: Check for hyperlink in cell formula
          if (cell.f && cell.f.includes('HYPERLINK')) {
            const match = cell.f.match(/HYPERLINK\("([^"]+)"/);
            if (match && match[1]) {
              return match[1];
            }
          }
          
          // Method 3: Check if cell value itself is a URL
          if (cell.v && typeof cell.v === 'string' && (cell.v.startsWith('http://') || cell.v.startsWith('https://'))) {
            return cell.v;
          }
        }
        
        return fallbackValue || "";
      };

      // Skip first 2 rows (start from row 3 as per spec)
      const orders = data.slice(2).map((row: any[], index: number) => {
        const extractedLink = getHyperlinkOrValue(index, 5, row[5]);
        const displayText = row[5] || "";
        
        // Remove @ symbol from display text if present
        const cleanDisplayText = displayText.replace(/^@/, "");
        
        return {
          mall: row[0] || "",
          gameName: row[1] || "",
          productName: row[2] || "",
          gameCodeStatus: row[3] || "",
          buyerName: row[4] || "",
          orderNumber: cleanDisplayText, // Clean display text without @
          orderNumberLink: extractedLink, // Store the actual hyperlink
          status: row[6] || "",
          progress: row[7] || "",
          processing: row[8] || "",
          memo: row[10] || "",
          logs: row[20] || "",
          column10: row[9] || "",
          column12: row[11] || "",
          column13: row[12] || "",
          column14: row[13] || "",
          column15: row[14] || "",
          column16: row[15] || "",
          column17: row[16] || "",
          column18: row[17] || "",
          column19: row[18] || "",
          column20: row[19] || "",
        };
      });

      const createdOrders = [];
      const skippedOrders = [];
      
      for (const orderData of orders) {
        if (orderData.orderNumber) {
          // Check if order with same orderNumber already exists
          const existingOrders = await storage.getAllOrders();
          const existingOrder = existingOrders.find(o => o.orderNumber === orderData.orderNumber);
          
          if (existingOrder) {
            skippedOrders.push(orderData.orderNumber);
          } else {
            const order = await storage.createOrder(orderData);
            createdOrders.push(order);
          }
        }
      }

      res.json({ 
        message: `${createdOrders.length} new orders imported successfully, ${skippedOrders.length} duplicates skipped`, 
        orders: createdOrders,
        skipped: skippedOrders
      });
    } catch (error) {
      console.error("Excel upload error:", error);
      res.status(500).json({ message: "Failed to process Excel file" });
    }
  });

  // Get all logs
  app.get("/api/logs", async (req, res) => {
    try {
      const logs = await storage.getAllLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });

  // Get logs for specific order
  app.get("/api/orders/:id/logs", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const logs = await storage.getOrderLogs(orderId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order logs" });
    }
  });

  // Save clipboard image
  app.post("/api/save-image", upload.single("image"), async (req, res) => {
    try {
      if (!req.file || !req.body.orderNumber) {
        return res.status(400).json({ message: "이미지 파일과 주문번호가 필요합니다." });
      }

      const orderNumber = req.body.orderNumber;
      const folderPath = path.join(process.cwd(), "images", orderNumber);

      // Create folder if it doesn't exist
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      // Count existing images to determine next number
      const existingFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.jpg'));
      const nextNumber = String(existingFiles.length + 1).padStart(2, '0');
      const filename = `${nextNumber}.jpg`;
      const filePath = path.join(folderPath, filename);

      // Save the image
      fs.writeFileSync(filePath, req.file.buffer);

      res.json({ filename, path: filePath });
    } catch (error) {
      res.status(500).json({ message: "이미지 저장에 실패했습니다." });
    }
  });

  // Get folder path
  app.get("/api/folder-path/:orderNumber", async (req, res) => {
    try {
      const orderNumber = req.params.orderNumber;
      const folderPath = path.join(process.cwd(), "images", orderNumber);

      // Create folder if it doesn't exist
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      res.json({ path: folderPath });
    } catch (error) {
      res.status(500).json({ message: "폴더 경로 조회에 실패했습니다." });
    }
  });

  // Open folder (legacy endpoint, now tries to open folder if possible)
  app.post("/api/open-folder/:orderNumber", async (req, res) => {
    try {
      const orderNumber = req.params.orderNumber;
      const folderPath = path.join(process.cwd(), "images", orderNumber);

      // Create folder if it doesn't exist
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      // Try to open folder based on OS (this may not work in all environments)
      const platform = process.platform;
      let command = "";

      if (platform === "win32") {
        command = `explorer "${folderPath}"`;
      } else if (platform === "darwin") {
        command = `open "${folderPath}"`;
      } else {
        command = `xdg-open "${folderPath}"`;
      }

      exec(command, (error) => {
        if (error) {
          console.error("폴더 열기 오류:", error);
        }
      });

      res.json({ message: "폴더가 열렸습니다.", path: folderPath });
    } catch (error) {
      res.status(500).json({ message: "폴더 열기에 실패했습니다." });
    }
  });

  // Open image
  app.post("/api/open-image/:orderNumber/:filename", async (req, res) => {
    try {
      const { orderNumber, filename } = req.params;
      const imagePath = path.join(process.cwd(), "images", orderNumber, filename);

      if (!fs.existsSync(imagePath)) {
        return res.status(404).json({ message: "이미지 파일을 찾을 수 없습니다." });
      }

      // Open image based on OS
      const platform = process.platform;
      let command = "";

      if (platform === "win32") {
        command = `start "" "${imagePath}"`;
      } else if (platform === "darwin") {
        command = `open "${imagePath}"`;
      } else {
        command = `xdg-open "${imagePath}"`;
      }

      exec(command, (error) => {
        if (error) {
          console.error("이미지 열기 오류:", error);
        }
      });

      res.json({ message: "이미지가 열렸습니다." });
    } catch (error) {
      res.status(500).json({ message: "이미지 열기에 실패했습니다." });
    }
  });

  // Get image list for order
  app.get("/api/images/:orderNumber", async (req, res) => {
    try {
      const orderNumber = req.params.orderNumber;
      const folderPath = path.join(process.cwd(), "images", orderNumber);

      if (!fs.existsSync(folderPath)) {
        return res.json([]);
      }

      const files = fs.readdirSync(folderPath)
        .filter(file => file.endsWith('.jpg'))
        .sort();

      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "이미지 목록 조회에 실패했습니다." });
    }
  });

  // Serve image files directly
  app.get("/api/image-file/:orderNumber/:filename", async (req, res) => {
    try {
      const { orderNumber, filename } = req.params;
      const imagePath = path.join(process.cwd(), "images", orderNumber, filename);

      if (!fs.existsSync(imagePath)) {
        return res.status(404).json({ message: "이미지 파일을 찾을 수 없습니다." });
      }

      // Set appropriate headers for image
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      
      // Stream the file
      const fileStream = fs.createReadStream(imagePath);
      fileStream.pipe(res);
    } catch (error) {
      res.status(500).json({ message: "이미지 로드에 실패했습니다." });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
