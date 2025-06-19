import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
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
  createdAt: integer("created_at", { mode: 'timestamp' }),
  updatedAt: integer("updated_at", { mode: 'timestamp' }),
});

export const logs = sqliteTable("logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").references(() => orders.id),
  action: text("action").notNull(),
  value: text("value").notNull(),
  timestamp: integer("timestamp", { mode: 'timestamp' }),
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

// User schema for basic user management
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  createdAt: integer("created_at", { mode: 'timestamp' }),
  updatedAt: integer("updated_at", { mode: 'timestamp' }),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;