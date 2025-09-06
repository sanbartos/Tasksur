// shared/schema.ts (completo con correcciones)
import { pgTable, text, varchar, timestamp, jsonb, index, serial, integer, decimal, boolean, } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
// Tabla notifications
export const notifications = pgTable("notifications", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    messageId: integer("message_id"),
});
// Tabla sessions
export const sessions = pgTable("sessions", {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
}, (table) => [index("IDX_session_expire").on(table.expire)]);
// Tabla users
export const users = pgTable("users", {
    id: varchar("id").primaryKey().notNull(),
    email: varchar("email").unique(),
    password: varchar("password", { length: 255 }).notNull(),
    role: varchar("role", { length: 20 }).notNull(),
    firstName: varchar("first_name"),
    lastName: varchar("last_name"),
    profileImageUrl: varchar("profile_image_url"),
    isTasker: boolean("is_tasker").default(false),
    phone: varchar("phone"),
    location: varchar("location"),
    bio: text("bio"),
    skills: text("skills").array(),
    hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
    totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0"),
    totalTasks: integer("total_tasks").default(0),
    rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
    reviewCount: integer("review_count").default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    // Columna notifications con tipo NotificationPreferences y valor por defecto objeto vacío
    notifications: jsonb("notifications").$type().default({}),
});
// Tabla categories
export const categories = pgTable("categories", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    description: text("description"),
    icon: varchar("icon", { length: 50 }),
    color: varchar("color", { length: 20 }),
    createdAt: timestamp("created_at").defaultNow(),
});
// Tabla tasks
export const tasks = pgTable("tasks", {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description").notNull(),
    categoryId: integer("category_id").references(() => categories.id),
    clientId: varchar("client_id").references(() => users.id).notNull(),
    budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("UYU"),
    location: varchar("location").notNull(),
    status: varchar("status").default("open"),
    priority: varchar("priority").default("normal"),
    dueDate: timestamp("due_date"),
    assignedTaskerId: varchar("assigned_tasker_id").references(() => users.id),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
// Tabla offers
export const offers = pgTable("offers", {
    id: serial("id").primaryKey(),
    taskId: integer("task_id").references(() => tasks.id).notNull(),
    taskerId: varchar("tasker_id").references(() => users.id).notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("UYU"),
    message: text("message"),
    estimatedDuration: varchar("estimated_duration"),
    status: varchar("status").default("pending"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
// Tabla reviews
export const reviews = pgTable("reviews", {
    id: serial("id").primaryKey(),
    taskId: integer("task_id").references(() => tasks.id).notNull(),
    reviewerId: varchar("reviewer_id").references(() => users.id).notNull(),
    revieweeId: varchar("reviewee_id").references(() => users.id).notNull(),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at").defaultNow(),
});
// ✅ Tabla messages (corregida para permitir mensajes generales)
export const messages = pgTable("messages", {
    id: serial("id").primaryKey(),
    taskId: integer("task_id").references(() => tasks.id), // ✅ Eliminado .notNull() para permitir NULL
    senderId: varchar("sender_id").references(() => users.id).notNull(),
    receiverId: varchar("receiver_id").references(() => users.id).notNull(),
    content: text("content").notNull(),
    isRead: boolean("is_read").default(false),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").defaultNow(),
});
// Tabla payments
export const payments = pgTable("payments", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 36 }).references(() => users.id).notNull(),
    orderId: varchar("order_id", { length: 100 }).notNull().unique(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    status: varchar("status", { length: 20 }).notNull(),
    method: varchar("method", { length: 50 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Relaciones
export const usersRelations = relations(users, ({ many }) => ({
    clientTasks: many(tasks, { relationName: "client_tasks" }),
    taskerTasks: many(tasks, { relationName: "tasker_tasks" }),
    offers: many(offers),
    sentReviews: many(reviews, { relationName: "sent_reviews" }),
    receivedReviews: many(reviews, { relationName: "received_reviews" }),
    sentMessages: many(messages, { relationName: "sent_messages" }),
    receivedMessages: many(messages, { relationName: "received_messages" }),
    payments: many(payments),
}));
export const categoriesRelations = relations(categories, ({ many }) => ({
    tasks: many(tasks),
}));
export const tasksRelations = relations(tasks, ({ one, many }) => ({
    category: one(categories, {
        fields: [tasks.categoryId],
        references: [categories.id],
    }),
    client: one(users, {
        fields: [tasks.clientId],
        references: [users.id],
        relationName: "client_tasks",
    }),
    assignedTasker: one(users, {
        fields: [tasks.assignedTaskerId],
        references: [users.id],
        relationName: "tasker_tasks",
    }),
    offers: many(offers),
    reviews: many(reviews),
    messages: many(messages),
}));
export const offersRelations = relations(offers, ({ one }) => ({
    task: one(tasks, {
        fields: [offers.taskId],
        references: [tasks.id],
    }),
    tasker: one(users, {
        fields: [offers.taskerId],
        references: [users.id],
    }),
}));
export const reviewsRelations = relations(reviews, ({ one }) => ({
    task: one(tasks, {
        fields: [reviews.taskId],
        references: [tasks.id],
    }),
    reviewer: one(users, {
        fields: [reviews.reviewerId],
        references: [users.id],
        relationName: "sent_reviews",
    }),
    reviewee: one(users, {
        fields: [reviews.revieweeId],
        references: [users.id],
        relationName: "received_reviews",
    }),
}));
// ✅ Relaciones messages (actualizadas para manejar taskId opcional)
export const messagesRelations = relations(messages, ({ one }) => ({
    task: one(tasks, {
        fields: [messages.taskId],
        references: [tasks.id],
        // ✅ Relación opcional ya que taskId puede ser NULL
    }),
    sender: one(users, {
        fields: [messages.senderId],
        references: [users.id],
        relationName: "sent_messages",
    }),
    receiver: one(users, {
        fields: [messages.receiverId],
        references: [users.id],
        relationName: "received_messages",
    }),
}));
export const paymentsRelations = relations(payments, ({ one }) => ({
    user: one(users, {
        fields: [payments.userId],
        references: [users.id],
    }),
}));
// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    notifications: true,
});
export const insertCategorySchema = createInsertSchema(categories).omit({
    id: true,
    createdAt: true,
});
export const insertTaskSchema = createInsertSchema(tasks).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertOfferSchema = createInsertSchema(offers).omit({
    id: true,
    createdAt: true,
});
export const insertReviewSchema = createInsertSchema(reviews).omit({
    id: true,
    createdAt: true,
});
// ✅ InsertMessageSchema (actualizado para taskId opcional)
export const insertMessageSchema = createInsertSchema(messages, {
    taskId: z.number().optional(), // ✅ Ahora es opcional
}).omit({
    id: true,
    createdAt: true,
    isRead: true,
    readAt: true,
});
export const insertPaymentSchema = createInsertSchema(payments).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
