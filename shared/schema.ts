import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  mall: text("mall").notNull(), // 쇼핑몰 정보 (1열)
  gameName: text("game_name").notNull(), // 게임명 (2열)
  productName: text("product_name").notNull(), // 상품명 (3열)
  gameCodeStatus: text("game_code_status").notNull(), // 게임코드상태 (4열)
  buyerName: text("buyer_name").notNull(), // 구매자명 (5열)
  orderNumber: text("order_number").notNull(), // 주문번호 (6열)
  orderNumberLink: text("order_number_link"), // 주문번호 하이퍼링크
  status: text("status").notNull(), // 상태 (7열)
  progress: text("progress"), // 진행상황 (8열)
  processing: text("processing"), // 처리내역 (9열)
  memo: text("memo"), // 메모 (11열)
  logs: text("logs"), // 로그 (21열)
  // Additional columns for full 21-column support
  column10: text("column_10"),
  column12: text("column_12"),
  column13: text("column_13"),
  column14: text("column_14"),
  column15: text("column_15"),
  column16: text("column_16"),
  column17: text("column_17"),
  column18: text("column_18"),
  column19: text("column_19"),
  column20: text("column_20"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  action: text("action").notNull(),
  value: text("value").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLogSchema = createInsertSchema(logs).omit({
  id: true,
  timestamp: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;
export type Log = typeof logs.$inferSelect;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
